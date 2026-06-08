/**
 * 실시간 다중 퀴즈 게임 관련 타입 정의 파일
 */

// 게임 진행 단계 타입
export type GamePhase = "lobby" | "waiting" | "playing" | "results";

// 웹소켓 메시지 타입 ENUM 정의 (백엔드 GameMessageType 매칭)
export type GameMessageType =
  | "ENTER"
  | "LEAVE"
  | "TALK"
  | "READY"
  | "START"
  | "DELEGATE"
  | "END"
  | "SUBMIT";

// 단어 정보 인터페이스
export interface GameVocab {
  word: string;
  meaning: string;
}

// 개별 퀴즈 정보 인터페이스 (백엔드 GameQuestionResDTO 매칭)
export interface GameQuiz {
  roomId: number;
  definition: string;
  length: number;
  timeLimit: number;
}

// 답안 제출 기록 인터페이스
export interface GameAnswerRecord {
  participantId: string;
  answerText: string;
  correct: boolean;
}

// 프론트엔드 UI 렌더링용 참가자 정보 인터페이스
export interface GameParticipantType {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  status: "waiting" | "ready" | "answering" | "submitted" | "correct" | "wrong";
  isMe: boolean;
  isHost: boolean;
}

// ── 백엔드 API/웹소켓 연동용 DTO 인터페이스 정의 ──────────────────────────────────────────

// 게임 참가자 상태 정보 (GameParticipantResDTO 매칭)
export interface GameParticipantRes {
  userId: number;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

// 게임방 실시간 상태 정보 (GameRoomStatusResDTO 매칭)
export interface GameRoomStatusRes {
  roomId: number;
  title?: string;
  participants: GameParticipantRes[];
}

// 웹소켓 송수신 메시지 정보 (GameMessageReqDTO / GameMessageResDTO 매칭)
export interface GameMessageRes {
  roomId: number;
  senderId: number;
  senderName: string;
  type: GameMessageType;
  message: string;
  sentAt: string;
  isCorrect?: boolean;
}
