import { Trophy, Crown, X, RotateCcw } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import type { ParticipantType } from "./ParticipantCard";

interface Vocab {
  word: string;
  meaning: string;
}

interface Quiz {
  sentence: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  vocab: Vocab[];
}

interface ResultsPhaseProps {
  rankedParticipants: ParticipantType[];
  quizzes: Quiz[];
  handleRestart: () => void;
}

export function ResultsPhase({
  rankedParticipants,
  quizzes,
  handleRestart,
}: ResultsPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-emerald-500 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)]">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            퀴즈 종료!
          </h2>
          <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "15px" }}>
            모든 참가자의 최종 결과를 확인하세요.
          </p>
        </div>

        {/* 랭킹 리스트 */}
        <div className="flex flex-col gap-3">
          {rankedParticipants.map((p, rank) => {
            const accuracy = quizzes.length > 0 ? Math.round((p.score / quizzes.length) * 100) : 0;
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={p.id}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
                  rank === 0
                    ? "border-amber-200 bg-amber-50/60"
                    : p.isMe
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-slate-100 bg-slate-50 dark:bg-slate-900/50/60"
                }`}
              >
                <span style={{ fontSize: "22px" }}>{medals[rank] ?? `${rank + 1}위`}</span>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${p.color} text-white`}
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  {p.avatar}
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 dark:text-slate-200" style={{ fontSize: "15px", fontWeight: 700 }}>
                      {p.name}
                    </span>
                    {p.isMe && (
                      <span
                        className="rounded-full bg-blue-100 px-1.5 py-px text-blue-600 font-bold"
                        style={{ fontSize: "10px" }}
                      >
                        나
                      </span>
                    )}
                    {rank === 0 && <Crown className="h-4 w-4 text-amber-500" />}
                  </div>
                  <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px" }}>
                    {rank + 1}위 · {p.score}문제 정답 · 정확도 {accuracy}%
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-slate-800 dark:text-slate-200" style={{ fontSize: "20px", fontWeight: 700 }}>
                    {p.score}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                    점
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 내 결과 요약 */}
        {(() => {
          const me = rankedParticipants.find((p) => p.isMe);
          const myRank = rankedParticipants.findIndex((p) => p.isMe) + 1;
          const accuracy = me && quizzes.length > 0 ? Math.round((me.score / quizzes.length) * 100) : 0;
          return me ? (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-emerald-50 px-5 py-4">
              <p className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px" }}>
                내 결과: <strong className="text-slate-900 dark:text-white">{myRank}위</strong>
                {" · "}
                <strong className="text-slate-900 dark:text-white">{me.score}문제 정답</strong>
                {" · 정확도 "}
                <strong className="text-slate-900 dark:text-white">{accuracy}%</strong>
              </p>
            </div>
          ) : null;
        })()}

        {/* 작업 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-2.5 text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            <X className="h-4 w-4" />
            방 나가기
          </button>
          <Button
            onClick={handleRestart}
            className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            다시 하기
          </Button>
        </div>
      </section>
    </div>
  );
}
