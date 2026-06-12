import { Sparkles } from "lucide-react";

export function GameLoading() {
  return (
    <section
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-100 rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-8 shadow-md"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Animated Gradient rings */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20 dark:bg-blue-600" />
        <span className="absolute inline-flex h-16 w-16 animate-pulse rounded-full bg-emerald-400 opacity-35 dark:bg-emerald-600" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-500 to-emerald-500 text-white shadow-lg">
          <Sparkles className="h-7 w-7 animate-bounce" />
        </div>
      </div>

      <h3 className="mt-8 text-lg font-bold text-slate-800 dark:text-slate-200 sm:text-xl">
        AI가 단어 게임 문제를 출제하고 있습니다
      </h3>
      <p className="mt-2 text-center text-sm text-slate-400 dark:text-slate-500 max-w-sm">
        Gemini AI가 선택한 단어들을 바탕으로 주관식 단어 게임 문제를 구성하는 중입니다. 잠시만 기다려 주세요.
      </p>

      {/* CSS Shimmer bar */}
      <div className="mt-8 h-1.5 w-60 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
        <div className="h-full w-1/2 rounded-full bg-linear-to-r from-blue-500 to-emerald-500 animate-[shimmer_1.5s_infinite_linear]" 
             style={{
               animation: "shimmer 1.5s infinite linear",
               backgroundImage: "linear-gradient(90deg, var(--color-blue-500) 0%, var(--color-emerald-500) 100%)"
             }}
         />
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </section>
  );
}
export default GameLoading;
