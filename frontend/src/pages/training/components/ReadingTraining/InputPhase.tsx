import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import type { TrainingDifficulty } from "../../types/readingTraining";

interface InputPhaseProps {
  inputText: string;
  setInputText: (text: string) => void;
  difficulty: TrainingDifficulty;
  setDifficulty: (diff: TrainingDifficulty) => void;
  handleStart: () => void;
  difficultyLabels: Record<TrainingDifficulty, string>;
  difficultyDesc: Record<TrainingDifficulty, string>;
  isPending: boolean;
  error: string | null;
}

export function InputPhase({
  inputText,
  setInputText,
  difficulty,
  setDifficulty,
  handleStart,
  difficultyLabels,
  difficultyDesc,
  isPending,
  error,
}: InputPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-slate-800 dark:text-slate-200" style={{ fontSize: "15px", fontWeight: 600 }}>
            훈련할 텍스트
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="읽기 훈련을 시작할 문장을 입력하세요."
            rows={7}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            style={{ fontSize: "15px", lineHeight: "1.8" }}
          />
          <span className="absolute bottom-3 right-4 text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
            {inputText.length} / 1000
          </span>
        </div>

        {/* 난이도 설정 */}
        <div className="mt-6 flex flex-col gap-3">
          <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: "14px", fontWeight: 600 }}>
            훈련 난이도
          </span>
          <div className="flex flex-wrap gap-2">
            {(["EASY", "NORMAL", "HARD"] as TrainingDifficulty[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDifficulty(opt)}
                className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition ${
                  difficulty === opt
                    ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-[0_0_0_2px_rgba(59,130,246,0.12)] dark:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-300 hover:bg-blue-50/40 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                }`}
                style={{ minWidth: "96px" }}
              >
                <span
                  className={difficulty === opt ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  {difficultyLabels[opt]}
                </span>
                <span
                  className={difficulty === opt ? "text-blue-500 dark:text-blue-300" : "text-slate-400 dark:text-slate-500"}
                  style={{ fontSize: "12px", marginTop: "2px" }}
                >
                  {difficultyDesc[opt]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={inputText.trim().length === 0 || isPending}
          className="mt-6 w-full h-12 rounded-xl text-white bg-linear-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          style={{ fontSize: "15px", fontWeight: 600 }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              AI 분석 및 읽기 훈련 설정 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              읽기 훈련 시작
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-600" />
          <span>AI 기반 문장 분석이므로 분석 결과가 완전히 정확하지 않을 수 있습니다.</span>
        </div>

        {isPending && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/30 dark:bg-blue-950/20 animate-pulse">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-emerald-500 shadow-xs">
              <Sparkles className="h-4.5 w-4.5 text-white animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">AI 문장 분석 진행 중</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                입력하신 문장을 단계별로 나누고 핵심 키워드를 추출하여 맞춤 훈련을 준비하고 있습니다. 잠시만 기다려 주세요.
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 정보 바 */}
      <div className="flex flex-wrap gap-6 rounded-2xl border border-slate-100 bg-white dark:bg-slate-950 px-5 py-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)]">
        {[
          { label: "단계별 읽기", desc: "긴 글을 작은 단위로 분해" },
          { label: "키워드 강조", desc: "핵심 개념을 노란 하이라이트로 표시" },
          { label: "이해도 확인", desc: "읽기 완료 후 퀴즈로 점검" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-slate-800 dark:text-slate-200" style={{ fontSize: "13px", fontWeight: 600 }}>
              {item.label}
            </span>
            <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
