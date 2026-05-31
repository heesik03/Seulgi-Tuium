import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Difficulty = "easy" | "normal" | "hard";
type SentenceRole = "주어" | "원인" | "결과" | "서술어" | "목적어" | "부연";

interface Segment {
  text: string;
  keywords: string[];
  role?: SentenceRole;
}

interface TrainingPhaseProps {
  difficulty: Difficulty;
  segment: Segment;
  currentIdx: number;
  totalSegments: number;
  handlePrev: () => void;
  handleNext: () => void;
  setPhase: (phase: "input" | "training" | "quiz" | "review") => void;
  scrollTop: () => void;
  difficultyLabels: Record<Difficulty, string>;
}

const ROLE_COLORS: Record<SentenceRole, { bg: string; text: string; dot: string }> = {
  주어: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  원인: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  결과: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  서술어: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  목적어: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
  부연: { bg: "bg-slate-50 dark:bg-slate-900/50", text: "text-slate-500 dark:text-slate-400", dot: "bg-slate-300" },
};

function RoleBadge({ role }: { role?: SentenceRole }) {
  if (!role) return null;
  const c = ROLE_COLORS[role];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${c.bg}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot} shrink-0`} />
      <span className={c.text} style={{ fontSize: "12px", fontWeight: 600 }}>
        {role}
      </span>
    </span>
  );
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

export function TrainingPhase({
  difficulty,
  segment,
  currentIdx,
  totalSegments,
  handlePrev,
  handleNext,
  setPhase,
  scrollTop,
  difficultyLabels,
}: TrainingPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 상태 표시줄 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-slate-600 dark:text-slate-400"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            {difficultyLabels[difficulty]}
          </span>
          <RoleBadge role={segment.role} />
        </div>
        <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
          {currentIdx + 1} / {totalSegments}
        </span>
      </div>

      {/* 진행 상황 바 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / totalSegments) * 100}%` }}
        />
      </div>

      {/* 역할 범례 설명 */}
      {difficulty !== "hard" && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROLE_COLORS) as SentenceRole[]).map((role) => {
            const c = ROLE_COLORS[role];
            return (
              <span key={role} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${c.bg}`}>
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className={c.text} style={{ fontSize: "11px", fontWeight: 600 }}>
                  {role}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* 독해 본문 카드 */}
      <section className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-950 p-8 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-10">
        <p
          className="text-slate-800 dark:text-slate-200 whitespace-pre-line"
          style={{
            fontSize: difficulty === "easy" ? "22px" : difficulty === "normal" ? "20px" : "18px",
            lineHeight: "1.9",
            letterSpacing: "-0.01em",
            fontWeight: 500,
          }}
        >
          {renderWithKeywords(segment.text, segment.keywords, difficulty)}
        </p>

        {segment.keywords.length > 0 && difficulty !== "hard" && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {segment.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 font-semibold"
                style={{ fontSize: "13px" }}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 이전/다음 이동 네비게이션 */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-600 dark:text-slate-400 transition hover:border-slate-300 dark:border-slate-700 hover:text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>

        <button
          type="button"
          onClick={() => {
            setPhase("input");
            scrollTop();
          }}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 transition cursor-pointer"
          style={{ fontSize: "13px" }}
        >
          처음으로
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-5 py-2.5 text-white shadow-md shadow-blue-500/20 transition hover:from-blue-600 hover:to-emerald-600 cursor-pointer"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {currentIdx < totalSegments - 1 ? "다음" : "퀴즈 풀기"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
