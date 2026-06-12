import { useSearchParams, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import type { GameParticipantType, GamePhase, GameVocab, GameQuiz } from "./types/gameType";
import { GameLobbyPhase } from "./components/QuizRoom/GameLobbyPhase";
import { GameWaitingPhase } from "./components/QuizRoom/GameWaitingPhase";
import { GamePlayingPhase } from "./components/QuizRoom/GamePlayingPhase";
import { GameResultsPhase } from "./components/QuizRoom/GameResultsPhase";
import { useGameWebSocket } from "./hooks/useGameWebSocket";
import { useAuthStore } from "../../store/authStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────

export function GameRoomPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryRoomId = searchParams.get("roomId");
  const initialRoomId = queryRoomId ? parseInt(queryRoomId, 10) : 0;
  // 초대 수락 시 Router state로 전달된 방 제목 (WebSocket 상태 도착 전 즉시 표시용)
  const initialRoomTitle = (location.state as { roomTitle?: string })?.roomTitle || "";

  const {
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
  } = useGameWebSocket(initialRoomId, initialRoomTitle);

  const { userName } = useAuthStore();
  const myId = participants.find((p) => p.isMe)?.id || "me";
  const myAnswer = [...questionAnswers].reverse().find((a) => a.participantId === myId) ?? null;
  const allAnswered = questionAnswers.length === participants.length && participants.length > 0;

  const rankedParticipants = [...participants]
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* ── Page Heading ── */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              실시간 단어 게임
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-600" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Users className="h-3.5 w-3.5" />
              최대 3명
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            단어를 선택하고 친구들과 함께 문제를 풀어보세요.
          </p>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 1 · LOBBY
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "lobby" && (
          <GameLobbyPhase
            roomTitle={roomTitle}
            setRoomTitle={setRoomTitle}
            handleCreateRoom={handleCreateRoom}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 2 · WAITING ROOM
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "waiting" && (
          <GameWaitingPhase
            roomId={roomId}
            roomTitle={roomTitle}
            participants={participants}
            handleStartQuiz={handleStartQuiz}
            handleToggleReady={handleToggleReady}
            setPhase={setPhase}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 3 · PLAYING
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "playing" && quizzes[current] && (
          <GamePlayingPhase
            quiz={quizzes[current]}
            quizzes={quizzes}
            current={current}
            participants={participants}
            scores={scores}
            nextCountdown={nextCountdown}
            myAnswerText={myAnswerText}
            myAnswer={myAnswer}
            questionAnswers={questionAnswers}
            allAnswered={allAnswered}
            handleMyAnswer={handleMyAnswer}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 4 · RESULTS
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "results" && (
          <GameResultsPhase
            rankedParticipants={rankedParticipants}
            quizzes={quizzes}
            handleRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

export default GameRoomPage;
