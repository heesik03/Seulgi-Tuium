import { useState, useRef } from "react";
import { BookOpen } from "lucide-react";
import { InputPhase } from "./components/ReadingTraining/InputPhase";
import { TrainingPhase } from "./components/ReadingTraining/TrainingPhase";
import { QuizPhase } from "./components/ReadingTraining/QuizPhase";
import { ReviewPhase } from "./components/ReadingTraining/ReviewPhase";
import { useReadingTraining } from "./hooks/useReadingTraining";
import type { TrainingDifficulty } from "./types/readingTraining";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

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

const REVIEW_KEYWORDS = ["문해력 저하", "문해력", "민주주의", "기본권", "헌법"];

const QUIZ_OPTIONS: QuizOption[] = [
  { text: "스마트폰 판매량의 지속적인 증가", isCorrect: false },
  { text: "학생들의 문해력 저하와 교육 환경 개선의 필요성", isCorrect: true },
  { text: "헌법에 규정된 교육비 지원 제도", isCorrect: false },
  { text: "인터넷 속도 향상에 따른 학습 효과", isCorrect: false },
];

const QUIZ_QUESTION = "이 글의 핵심 내용으로 가장 적절한 것은?";
const QUIZ_EXPLANATION =
  "이 글은 스마트폰 사용 증가로 인한 문해력 저하 문제를 제기하고, 문해력의 중요성(헌법·기본권·민주주의)을 설명한 뒤, 독서 습관 장려와 디지털 기기 조절을 통한 교육 환경 개선을 촉구하고 있습니다.";

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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const totalGroups = sentenceGroups.length;
  const currentGroup = sentenceGroups[currentIdx];

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  async function handleStart() {
    setCurrentIdx(0);
    setSelectedOption(null);
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
      setPhase("quiz");
      scrollTop();
    }
  }

  function handlePickAnswer(idx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
  }

  function handleRestart() {
    resetTraining();
    setCurrentIdx(0);
    setSelectedOption(null);
  }

  const answeredCorrectly = selectedOption !== null && (QUIZ_OPTIONS[selectedOption]?.isCorrect ?? false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div
        ref={topRef}
        className="mx-auto flex w-full max-w-190 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:py-12"
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

        {/* ── QUIZ PHASE ── */}
        {phase === "quiz" && (
          <QuizPhase
            quizQuestion={QUIZ_QUESTION}
            quizOptions={QUIZ_OPTIONS}
            selectedOption={selectedOption}
            handlePickAnswer={handlePickAnswer}
            answeredCorrectly={answeredCorrectly}
            quizExplanation={QUIZ_EXPLANATION}
            setCurrentIdx={setCurrentIdx}
            setPhase={setPhase}
            scrollTop={scrollTop}
          />
        )}

        {/* ── REVIEW PHASE ── */}
        {phase === "review" && (
          <ReviewPhase
            inputText={inputText}
            reviewKeywords={REVIEW_KEYWORDS}
            handleRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

export default ReadingTrainingPage;
