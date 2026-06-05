import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SentenceGroupRes, SentenceComponentRes, TrainingDifficulty, SemanticRole } from "../../types/readingTraining";
import { CHUNK_ROLE_MAP } from "../../types/readingTraining";

interface TrainingPhaseProps {
  difficulty: TrainingDifficulty;
  group: SentenceGroupRes;
  currentIdx: number;
  totalGroups: number;
  handlePrev: () => void;
  handleNext: () => void;
  setPhase: (phase: "input" | "training" | "quiz" | "review") => void;
  scrollTop: () => void;
  difficultyLabels: Record<TrainingDifficulty, string>;
}

interface RoleColorConfig {
  bg: string;
  text: string;
  dot: string;
  highlightBg: string;
  highlightText: string;
  activeBorder: string;
  activeRing: string;
}

const ROLE_COLORS: Record<SemanticRole, RoleColorConfig> = {
  SUBJECT: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-400",
    highlightBg: "bg-blue-100 dark:bg-blue-900/40",
    highlightText: "text-blue-900 dark:text-blue-200",
    activeBorder: "border-blue-300 dark:border-blue-800",
    activeRing: "ring-blue-400 dark:ring-blue-700",
  },
  OBJECT: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-400",
    highlightBg: "bg-emerald-100 dark:bg-emerald-900/40",
    highlightText: "text-emerald-900 dark:text-emerald-200",
    activeBorder: "border-emerald-300 dark:border-emerald-800",
    activeRing: "ring-emerald-400 dark:ring-emerald-700",
  },
  PREDICATE: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-400",
    highlightBg: "bg-rose-100 dark:bg-rose-900/40",
    highlightText: "text-rose-900 dark:text-rose-200",
    activeBorder: "border-rose-300 dark:border-rose-800",
    activeRing: "ring-rose-400 dark:ring-rose-700",
  },
  CAUSE: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-400",
    highlightBg: "bg-amber-100 dark:bg-amber-900/40",
    highlightText: "text-amber-900 dark:text-amber-200",
    activeBorder: "border-amber-300 dark:border-amber-800",
    activeRing: "ring-amber-400 dark:ring-amber-700",
  },
  RESULT: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-400",
    highlightBg: "bg-violet-100 dark:bg-violet-900/40",
    highlightText: "text-violet-900 dark:text-violet-200",
    activeBorder: "border-violet-300 dark:border-violet-800",
    activeRing: "ring-violet-400 dark:ring-violet-700",
  },
  OTHER: {
    bg: "bg-slate-50 dark:bg-slate-900/50",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-300",
    highlightBg: "bg-slate-200 dark:bg-slate-800",
    highlightText: "text-slate-700 dark:text-slate-300",
    activeBorder: "border-slate-300 dark:border-slate-700",
    activeRing: "ring-slate-400 dark:ring-slate-600",
  },
};

function renderComponents(
  components: SentenceComponentRes[],
  activeRoles: SemanticRole[]
): ReactNode {
  return components.map((comp, compIdx) => {
    const isActive = activeRoles.includes(comp.role);
    const highlightClass = `${ROLE_COLORS[comp.role].highlightBg} ${ROLE_COLORS[comp.role].highlightText}`;

    // 1. 해당 성분의 역할이 활성화된 경우 하이라이트 처리
    if (isActive) {
      if (comp.keywords && comp.keywords.length > 0) {
        const escaped = comp.keywords
          .filter((k) => k.trim().length > 0)
          .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        if (escaped.length > 0) {
          const parts = comp.text.split(new RegExp(`(${escaped.join("|")})`, "g"));
          return (
            <span key={compIdx}>
              {parts.map((part, i) => {
                if (comp.keywords.includes(part)) {
                  return (
                    <mark key={`mark-${i}`} className={`rounded px-1.5 py-0.5 not-italic font-semibold transition-colors duration-300 ${highlightClass}`}>
                      {part}
                    </mark>
                  );
                } else {
                  return <span key={`text-${i}`}>{part}</span>;
                }
              })}
              {/* 컴포넌트 간 띄어쓰기 보정 */}
              {!comp.text.endsWith(" ") && compIdx < components.length - 1 && " "}
            </span>
          );
        }
      }

      // 키워드가 빈 배열인 경우 성분 텍스트 전체 하이라이트
      return (
        <span key={compIdx}>
          <mark className={`rounded px-1.5 py-0.5 not-italic font-semibold transition-colors duration-300 ${highlightClass}`}>
            {comp.text}
          </mark>
          {!comp.text.endsWith(" ") && compIdx < components.length - 1 && " "}
        </span>
      );
    }

    // 2. 비활성화된 경우 일반 텍스트 렌더링
    return (
      <span key={compIdx}>
        {comp.text}
        {!comp.text.endsWith(" ") && compIdx < components.length - 1 && " "}
      </span>
    );
  });
}

export function TrainingPhase({
  difficulty,
  group,
  currentIdx,
  totalGroups,
  handlePrev,
  handleNext,
  setPhase,
  scrollTop,
  difficultyLabels,
}: TrainingPhaseProps) {
  const [activeRoles, setActiveRoles] = useState<SemanticRole[]>([]);

  // 그룹이 변경될 때마다 활성화된 역할 초기화
  const handlePrevClick = () => {
    setActiveRoles([]);
    handlePrev();
  };

  const handleNextClick = () => {
    setActiveRoles([]);
    handleNext();
  };

  const toggleRole = (role: SemanticRole) => {
    setActiveRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

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
        </div>
        <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
          {currentIdx + 1} / {totalGroups}
        </span>
      </div>

      {/* 진행 상황 바 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / totalGroups) * 100}%` }}
        />
      </div>

      {/* 역할 범례 설명 (클릭 시 키워드 강조 처리) */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "12px" }}>
          아래 옵션을 눌러 해당 의미를 가진 단어(키워드)를 찾아보세요.
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CHUNK_ROLE_MAP) as SemanticRole[]).map((role) => {
            const c = ROLE_COLORS[role];
            const { label, description } = CHUNK_ROLE_MAP[role];
            const isActive = activeRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                title={description}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? `${c.bg} ${c.activeBorder} shadow-sm ring-1 ${c.activeRing}`
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className={isActive ? c.text : "text-slate-600 dark:text-slate-400"} style={{ fontSize: "12px", fontWeight: 600 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 독해 본문 카드 */}
      <section className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-950 p-8 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-10">
        <p
          className="text-slate-800 dark:text-slate-200 whitespace-pre-line"
          style={{
            fontSize: difficulty === "EASY" ? "22px" : difficulty === "NORMAL" ? "20px" : "18px",
            lineHeight: "1.9",
            letterSpacing: "-0.01em",
            fontWeight: 500,
          }}
        >
          {renderComponents(group.components, activeRoles)}
        </p>
      </section>

      {/* 이전/다음 이동 네비게이션 */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevClick}
          disabled={currentIdx === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
          className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition cursor-pointer"
          style={{ fontSize: "13px" }}
        >
          처음으로
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          className="inline-flex items-center gap-1.5 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-5 py-2.5 text-white shadow-md shadow-blue-500/20 transition hover:from-blue-600 hover:to-emerald-600 cursor-pointer"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {currentIdx < totalGroups - 1 ? "다음" : "퀴즈 풀기"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
