import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";

type Difficulty = "easy" | "normal" | "hard";

interface ReviewPhaseProps {
  inputText: string;
  reviewKeywords: string[];
  handleRestart: () => void;
}

function renderWithKeywords(text: string, keywords: string[], difficulty: Difficulty): ReactNode {
  if (keywords.length === 0 || difficulty === "hard") return text;

  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));

  return parts.map((part, i) =>
    keywords.includes(part) ? (
      <mark key={i} className="rounded px-1 py-0.5 bg-amber-100 text-amber-900 not-italic font-semibold">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function ReviewPhase({
  inputText,
  reviewKeywords,
  handleRestart,
}: ReviewPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-slate-700" style={{ fontSize: "14px", fontWeight: 600 }}>
          원문 다시 읽기
        </span>
      </div>

      <p className="text-slate-500" style={{ fontSize: "14px" }}>
        구조를 파악한 뒤 전체 글을 다시 읽어보세요. 이해가 훨씬 수월해집니다.
      </p>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <p
          className="text-slate-800 whitespace-pre-wrap"
          style={{ fontSize: "17px", lineHeight: "2", letterSpacing: "-0.005em" }}
        >
          {renderWithKeywords(inputText, reviewKeywords, "normal")}
        </p>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <span className="text-slate-400" style={{ fontSize: "12px" }}>
            핵심 키워드
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {reviewKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 font-semibold"
                style={{ fontSize: "13px" }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          <RotateCcw className="h-4 w-4" />
          새로운 텍스트로 훈련하기
        </button>
      </div>
    </div>
  );
}
