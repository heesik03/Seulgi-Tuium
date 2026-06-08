import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthStore } from "../../../store/authStore";
import { axiosInstance } from "../../../app/apiClient";
import type {
  GamePhase,
  GameQuiz,
  GameAnswerRecord,
  GameParticipantType,
  GameRoomStatusRes,
  GameMessageRes,
} from "../types/gameType";

// WebSocket 기본 연결 엔드포인트 URL 구성 헬퍼
const getWebSocketUrl = () => {
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const url = new URL(apiURL);
  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${url.host}/ws-quiz`;
};

export function useGameWebSocket(initialRoomId: number, initialRoomTitle?: string) {
  const { accessToken, userName } = useAuthStore();
  const [roomId, setRoomId] = useState<number>(initialRoomId);
  const [phase, setPhase] = useState<GamePhase>(initialRoomId > 0 ? "waiting" : "lobby");
  const [roomTitle, setRoomTitle] = useState(initialRoomTitle || "");
  const [participants, setParticipants] = useState<GameParticipantType[]>([]);
  const [quizzes, setQuizzes] = useState<GameQuiz[]>([]);
  const [current, setCurrent] = useState(0);
  const [myAnswerText, setMyAnswerText] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<GameAnswerRecord[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // URL 쿼리 파라미터(초대 링크)를 통해 initialRoomId가 동적으로 변경되었을 때 상태 동기화
  useEffect(() => {
    if (initialRoomId > 0 && roomId !== initialRoomId) {
      setRoomId(initialRoomId);
      setPhase("waiting");
    }
  }, [initialRoomId, roomId]);

  // 1. HTTP 퀴즈방 신설 API 호출 및 대기방 진입
  const handleCreateRoom = useCallback(async (title: string) => {
    try {
      const res = await axiosInstance.post<{ roomId: number; title: string }>("/api/game/rooms", {
        title,
        words: [],
        quizCount: 4,
      });

      const newRoomId = res.data.roomId;
      setRoomId(newRoomId);
      setRoomTitle(res.data.title || title);
      setPhase("waiting");
      return newRoomId;
    } catch (err) {
      console.error("게임방 생성 중 오류 발생:", err);
      throw new Error("게임방을 개설하지 못했습니다.");
    }
  }, []);

  // 2. STOMP Client 초기화 및 실시간 메시지 구독 연동
  useEffect(() => {
    if (roomId <= 0 || !accessToken) return;

    // STOMP Client 설정 (@stomp/stompjs ^7.3.0 스펙 적용)
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // JWT 인증 헤더 적재
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log("[STOMP Debug] " + str);
        }
      },
    });

    client.onConnect = () => {
      console.log(`Successfully connected to WebSocket room: ${roomId}`);

      // ── A. 방 상태 및 참가자 목록 실시간 동기화 구독
      client.subscribe(`/topic/room/${roomId}/status`, (message) => {
        try {
          const status: GameRoomStatusRes = JSON.parse(message.body);
          if (status.title) setRoomTitle(status.title);
          // 백엔드 참가자 리스트를 프론트 UI 포맷으로 전환
          const mappedParticipants: GameParticipantType[] = status.participants.map((p, idx) => ({
            id: String(p.userId),
            name: p.name,
            avatar: p.name.substring(0, 1),
            color: idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-emerald-500" : "bg-violet-500",
            score: 0,
            status: p.isReady ? "ready" : "waiting",
            isMe: p.name === userName,
            isHost: p.isHost,
          }));
          setParticipants(mappedParticipants);
        } catch (err) {
          console.error("방 상태 동기화 파싱 에러:", err);
        }
      });

      // ── B. 채팅 및 입장/퇴장 시스템 메시지 수신
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const msg: GameMessageRes = JSON.parse(message.body);
          console.log("[Chat/System Message]:", msg.message);
        } catch (err) {
          console.error("채팅 메시지 파싱 에러:", err);
        }
      });

      // ── C. 게임 시작 및 최종 게임 종료 시그널 수신
      client.subscribe(`/topic/room/${roomId}/start`, (message) => {
        try {
          const startData = JSON.parse(message.body);
          if (startData.message && startData.message.includes("종료")) {
            // 게임 종료로 결과 페이즈 전환
            setPhase("results");
          } else {
            // 게임 플레이 시작
            setPhase("playing");
            setCurrent(0);
            setMyAnswerText(null);
            setQuestionAnswers([]);
            setScores({});
          }
        } catch (err) {
          console.error("게임 시작 신호 파싱 에러:", err);
        }
      });

      // ── D. 퀴즈 문제 정보 실시간 수신
      client.subscribe(`/topic/room/${roomId}/question`, (message) => {
        try {
          const questionData = JSON.parse(message.body);
          // questionData 형식 매핑
          const newQuiz: GameQuiz = {
            roomId: questionData.roomId,
            definition: questionData.definition,
            length: questionData.length,
            timeLimit: questionData.timeLimit,
          };
          setQuizzes((prev) => [...prev, newQuiz]);
          setMyAnswerText(null);
          setQuestionAnswers([]);
          setNextCountdown(null);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        } catch (err) {
          console.error("퀴즈 문제 파싱 에러:", err);
        }
      });

      // ── E. 채점 결과 및 스코어 갱신 구독
      client.subscribe(`/topic/room/${roomId}/submit`, (message) => {
        try {
          const submitResult = JSON.parse(message.body);
          // submitResult: { userId, userName, isCorrect, score }
          setScores((prev) => ({
            ...prev,
            [submitResult.userId]: submitResult.score,
          }));

          setQuestionAnswers((prev) => [
            ...prev,
            {
              participantId: String(submitResult.userId),
              answerText: submitResult.submitWord || "",
              correct: submitResult.isCorrect,
            },
          ]);

          // 누군가 정답을 맞추면 다음 라운드로 진행하기 위한 카운트다운 시작
          if (submitResult.isCorrect) {
            let count = 3;
            setNextCountdown(count);
            countdownIntervalRef.current = setInterval(() => {
              count -= 1;
              if (count <= 0) {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                }
                setNextCountdown(null);
                setCurrent((prev) => prev + 1);
              } else {
                setNextCountdown(count);
              }
            }, 1000);
          }
        } catch (err) {
          console.error("채점 결과 수신 파싱 에러:", err);
        }
      });

      // ── F. 에러 메시지 수신 (백엔드 @MessageExceptionHandler)
      client.subscribe(`/user/queue/errors`, (message) => {
        try {
          alert(`서버 에러: ${message.body}`);
        } catch (err) {
          console.error("에러 메시지 처리 오류:", err);
        }
      });

      // ── G. 입장 프레임 전송
      client.publish({
        destination: "/app/game/message",
        body: JSON.stringify({
          roomId: roomId,
          type: "ENTER",
          message: `${userName} 입장`,
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        try {
          if (stompClientRef.current.connected) {
            // 퇴장 프레임 송신
            stompClientRef.current.publish({
              destination: "/app/game/message",
              body: JSON.stringify({
                roomId: roomId,
                type: "LEAVE",
                message: `${userName} 퇴장`,
              }),
            });
          }
        } catch (err) {
          console.error("퇴장 메시지 전송 에러:", err);
        } finally {
          stompClientRef.current.deactivate();
        }
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [roomId, accessToken, userName]);

  // 3. 실시간 게임방 액션 전송 핸들러

  // 준비상태 토글 전송
  const handleToggleReady = useCallback(() => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;
    stompClientRef.current.publish({
      destination: "/app/game/message",
      body: JSON.stringify({
        roomId: roomId,
        type: "READY",
        message: "",
      }),
    });
  }, [roomId]);

  // 게임방 시작 전송 (방장 한정)
  const handleStartQuiz = useCallback(() => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;
    stompClientRef.current.publish({
      destination: "/app/game/message",
      body: JSON.stringify({
        roomId: roomId,
        type: "START",
        message: "",
      }),
    });
  }, [roomId]);

  // 내 답안 제출 전송
  const handleMyAnswer = useCallback((answerText: string) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;
    setMyAnswerText(answerText);
    stompClientRef.current.publish({
      destination: "/app/game/message",
      body: JSON.stringify({
        roomId: roomId,
        type: "SUBMIT",
        message: answerText,
      }),
    });
  }, [roomId]);

  // 종료 후 다시 대시보드로 복귀
  const handleRestart = useCallback(() => {
    setPhase("lobby");
    setRoomId(0);
    setParticipants([]);
    setQuizzes([]);
    setCurrent(0);
    setMyAnswerText(null);
    setQuestionAnswers([]);
    setScores({});
    setNextCountdown(null);
  }, []);

  return {
    roomId,
    phase,
    roomTitle,
    participants,
    quizzes,
    current,
    myAnswerText,
    questionAnswers,
    scores,
    nextCountdown,
    setPhase,
    setRoomTitle,
    handleCreateRoom,
    handleToggleReady,
    handleStartQuiz,
    handleMyAnswer,
    handleRestart,
  };
}
