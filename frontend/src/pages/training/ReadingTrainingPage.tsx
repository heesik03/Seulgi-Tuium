import { useState, useRef } from "react";
import { BookOpen } from "lucide-react";
import { InputPhase } from "./components/ReadingTraining/InputPhase";
import { TrainingPhase } from "./components/ReadingTraining/TrainingPhase";
import { useReadingTraining } from "./hooks/useReadingTraining";
import type { TrainingDifficulty } from "./types/readingTraining";

const DIFFICULTY_LABELS: Record<TrainingDifficulty, string> = {
  EASY: "쉬움",
  NORMAL: "보통",
  HARD: "어려움",
};

const DIFFICULTY_DESC: Record<TrainingDifficulty, string> = {
  EASY: "한 문장씩 · 키워드 강조",
  NORMAL: "2~3 문장씩 · 키워드 표시",
  HARD: "긴 단락씩 · 최소 도움",
};

// ─── Page Component ───────────────────────────────────────────────────────────

export function ReadingTrainingPage() {
  const {
    phase,
    setPhase,
    inputText,
    setInputText,
    difficulty,
    setDifficulty,
    sentenceGroups,
    isPending,
    error,
    handleStartTraining,
    resetTraining,
  } = useReadingTraining();

  const [currentIdx, setCurrentIdx] = useState(0);

  const topRef = useRef<HTMLDivElement>(null);

  const totalGroups = sentenceGroups.length;
  const currentGroup = sentenceGroups[currentIdx];

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  async function handleStart() {
    setCurrentIdx(0);
    await handleStartTraining();
    // 훅 내부에서 데이터가 성공적으로 오면 phase를 "training"으로 설정합니다.
    scrollTop();
  }

  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx((n) => n - 1);
  }

  function handleNext() {
    if (currentIdx < totalGroups - 1) {
      setCurrentIdx((n) => n + 1);
    } else {
      // 훈련이 완료되면 즉시 초기 시작 화면(입력 단계)으로 리셋하여 돌아감
      handleRestart();
      scrollTop();
    }
  }

  function handleRestart() {
    resetTraining();
    setCurrentIdx(0);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div
        ref={topRef}
        className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        {/* 페이지 헤더 */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-emerald-500 shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-slate-900 dark:text-white" style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              읽기 훈련
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "15px" }}>
            긴 문장을 나누어 읽고 핵심 내용을 이해해보세요.
          </p>
        </header>

        {/* ── INPUT PHASE ── */}
        {phase === "input" && (
          <InputPhase
            inputText={inputText}
            setInputText={setInputText}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            handleStart={handleStart}
            difficultyLabels={DIFFICULTY_LABELS}
            difficultyDesc={DIFFICULTY_DESC}
            isPending={isPending}
            error={error}
          />
        )}

        {/* ── TRAINING PHASE ── */}
        {phase === "training" && currentGroup && (
          <TrainingPhase
            difficulty={difficulty}
            group={currentGroup}
            currentIdx={currentIdx}
            totalGroups={totalGroups}
            handlePrev={handlePrev}
            handleNext={handleNext}
            setPhase={setPhase}
            scrollTop={scrollTop}
            difficultyLabels={DIFFICULTY_LABELS}
          />
        )}
      </div>
    </div>
  );
}

export default ReadingTrainingPage;
