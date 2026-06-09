import { useState } from "react";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { GameParticipantCard } from "./GameParticipantCard";
import type { GameParticipantType, GamePhase } from "../../types/gameType";
import { axiosInstance } from "../../../../app/apiClient";

interface GameWaitingPhaseProps {
  roomId: number;
  roomTitle: string;
  participants: GameParticipantType[];
  handleStartQuiz: () => void;
  handleToggleReady: () => void;
  setPhase: (phase: GamePhase) => void;
}

export function GameWaitingPhase({
  roomId,
  roomTitle,
  participants,
  handleStartQuiz,
  handleToggleReady,
  setPhase,
}: GameWaitingPhaseProps) {
  const myParticipant = participants.find((p) => p.isMe);
  const isHost = myParticipant?.isHost ?? false;
  const isReady = myParticipant?.status === "ready";
  const [inviteNickname, setInviteNickname] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInvite = async () => {
    if (!inviteNickname.trim()) return;
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      await axiosInstance.post("/api/game/invite", {
        receiverNickname: inviteNickname.trim(),
        roomId: roomId,
      });
      setInviteSuccess(true);
      setInviteNickname("");
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "초대 발송에 실패했습니다. 유저가 오프라인이거나 존재하지 않습니다.";
      setInviteError(msg);
    } finally {
      setIsInviting(false);
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left: Settings Summary */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 flex flex-col justify-center items-center text-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
              {roomTitle || "제목 없음"}
            </h2>
            <div className="inline-flex items-center gap-2 justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400" style={{ fontSize: "15px", fontWeight: 600 }}>
                랜덤 4문제 출제
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2" style={{ fontSize: "14px" }}>
              모두 준비가 완료되면 방장이 게임을 시작할 수 있습니다.<br />단어의 뜻을 보고 알맞은 단어를 주관식으로 입력해야 합니다.
            </p>
          </div>
        </section>

        {/* Right: Participant List */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
                참가자
              </h2>
            </div>
            <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px" }}>
              {participants.length} / 3 참가 중
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {participants.map((p) => (
              <GameParticipantCard key={p.id} p={p} />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
            <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
              참가자 대기 중...
            </span>
          </div>

          {/* 실시간 닉네임 초대 양식 */}
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-col gap-2.5">
            <label className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px", fontWeight: 600 }}>
              친구 초대하기
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteNickname}
                onChange={(e) => setInviteNickname(e.target.value)}
                placeholder="유저 닉네임 입력..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden focus:border-blue-400 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={handleInvite}
                disabled={isInviting || !inviteNickname.trim()}
                className="rounded-xl bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {isInviting ? "발송 중" : "초대"}
              </button>
            </div>
            {inviteError && (
              <span className="text-red-500 text-[11px] font-semibold">{inviteError}</span>
            )}
            {inviteSuccess && (
              <span className="text-emerald-600 text-[11px] font-semibold">초대 알림을 보냈습니다!</span>
            )}
          </div>
        </section>
      </div>

      {/* 하단 제어 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setPhase("lobby")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-600 dark:text-slate-400 transition hover:border-slate-300 hover:text-slate-800 cursor-pointer"
          style={{ fontSize: "14px" }}
        >
          ← 로비로 돌아가기
        </button>
        {isHost ? (
          <Button
            onClick={handleStartQuiz}
            className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600 cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            게임 시작
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Button>
        ) : (
          <Button
            onClick={handleToggleReady}
            className={`group h-11 rounded-xl border-0 px-6 text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,0.4)] transition cursor-pointer ${
              isReady
                ? "bg-slate-400 hover:bg-slate-500"
                : "bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            }`}
          >
            {isReady ? "준비 완료 (취소)" : "준비하기"}
          </Button>
        )}
      </div>
    </div>
  );
}
