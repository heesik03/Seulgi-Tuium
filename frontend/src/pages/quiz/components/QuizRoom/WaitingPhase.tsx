import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ParticipantCard } from "./ParticipantCard";
import type { ParticipantType } from "./ParticipantCard";

interface Vocab {
  word: string;
  meaning: string;
}

interface WaitingPhaseProps {
  selectedWords: string[];
  roomTitle: string;
  quizCount: number;
  participants: ParticipantType[];
  handleStartQuiz: () => void;
  setPhase: (phase: "lobby" | "waiting" | "playing" | "results") => void;
  vocabBank: Vocab[];
}

export function WaitingPhase({
  selectedWords,
  roomTitle,
  quizCount,
  participants,
  handleStartQuiz,
  setPhase,
  vocabBank,
}: WaitingPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left: Settings Summary */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
              선택한 단어
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {selectedWords.map((w) => {
              const vocab = vocabBank.find((v) => v.word === w);
              return vocab ? (
                <div
                  key={w}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50/60 px-4 py-3"
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold"
                    style={{ fontSize: "11px" }}
                  >
                    어
                  </span>
                  <div>
                    <p className="text-slate-800 dark:text-slate-200" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {vocab.word}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      {vocab.meaning}
                    </p>
                  </div>
                </div>
              ) : null;
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                방 제목
              </span>
              <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: "14px", fontWeight: 500 }}>
                {roomTitle || "제목 없음"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                문제 수
              </span>
              <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: "14px", fontWeight: 500 }}>
                {quizCount}문제
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                최대 인원
              </span>
              <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: "14px", fontWeight: 500 }}>
                3명
              </span>
            </div>
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
              <ParticipantCard key={p.id} p={p} />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
            <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
              참가자 대기 중...
            </span>
          </div>
        </section>
      </div>

      {/* 하단 제어 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setPhase("lobby")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-600 dark:text-slate-400 transition hover:border-slate-300 dark:border-slate-700 hover:text-slate-800 dark:text-slate-200"
          style={{ fontSize: "14px" }}
        >
          ← 로비로 돌아가기
        </button>
        <Button
          onClick={handleStartQuiz}
          className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          퀴즈 시작
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
