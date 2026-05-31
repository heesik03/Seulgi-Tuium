import { useState, useRef } from "react";
import { BookOpen } from "lucide-react";
import { InputPhase } from "./components/ReadingTraining/InputPhase";
import { TrainingPhase } from "./components/ReadingTraining/TrainingPhase";
import { QuizPhase } from "./components/ReadingTraining/QuizPhase";
import { ReviewPhase } from "./components/ReadingTraining/ReviewPhase";


type Difficulty = "easy" | "normal" | "hard";
type Phase = "input" | "training" | "quiz" | "review";
type SentenceRole = "주어" | "원인" | "결과" | "서술어" | "목적어" | "부연";

interface Segment {
  text: string;
  keywords: string[];
  role?: SentenceRole;
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}


const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: "한 문장씩 · 키워드 강조",
  normal: "2~3 문장씩 · 키워드 표시",
  hard: "긴 단락씩 · 최소 도움",
};

const SAMPLE_TEXT =
  "오늘날 많은 학생들은 스마트폰 사용 시간이 증가하면서 문해력이 저하되고 있다. 문해력이란 글을 읽고 그 의미를 정확히 이해하는 능력으로, 민주주의 사회에서 기본권을 누리기 위해 반드시 필요한 역량이다. 헌법은 모든 국민에게 교육받을 권리를 보장하고 있으며, 이는 단순히 지식을 습득하는 것을 넘어 비판적 사고 능력을 기르는 것을 포함한다. 따라서 학교와 가정에서는 독서 습관을 장려하고 디지털 기기 사용을 적절히 조절하는 방향으로 교육 환경을 개선해 나가야 한다.";

const REVIEW_KEYWORDS = ["문해력 저하", "문해력", "민주주의", "기본권", "헌법"];

const SEGMENTS_EASY: Segment[] = [
  { text: "오늘날 많은 학생들은", keywords: [], role: "주어" },
  { text: "스마트폰 사용 시간이 증가하면서", keywords: ["스마트폰"], role: "원인" },
  { text: "문해력이 저하되고 있다.", keywords: ["문해력 저하"], role: "결과" },
  { text: "문해력이란 글을 읽고", keywords: ["문해력"], role: "주어" },
  { text: "그 의미를 정확히 이해하는 능력으로,", keywords: [], role: "서술어" },
  { text: "민주주의 사회에서 기본권을 누리기 위해", keywords: ["민주주의", "기본권"], role: "원인" },
  { text: "반드시 필요한 역량이다.", keywords: [], role: "결과" },
  { text: "헌법은 모든 국민에게", keywords: ["헌법"], role: "주어" },
  { text: "교육받을 권리를 보장하고 있으며,", keywords: ["기본권"], role: "서술어" },
  { text: "이는 비판적 사고 능력을 기르는 것을 포함한다.", keywords: [], role: "부연" },
  { text: "따라서 독서 습관을 장려하고", keywords: [], role: "목적어" },
  { text: "디지털 기기 사용을 적절히 조절하는 방향으로", keywords: [], role: "원인" },
  { text: "교육 환경을 개선해 나가야 한다.", keywords: [], role: "결과" },
];

const SEGMENTS_NORMAL: Segment[] = [
  {
    text: "오늘날 많은 학생들은 스마트폰 사용 시간이 증가하면서 문해력이 저하되고 있다.",
    keywords: ["문해력 저하"],
    role: "주어",
  },
  {
    text: "문해력이란 글을 읽고 그 의미를 정확히 이해하는 능력으로,\n민주주의 사회에서 기본권을 누리기 위해 반드시 필요한 역량이다.",
    keywords: ["문해력", "민주주의", "기본권"],
    role: "서술어",
  },
  {
    text: "헌법은 모든 국민에게 교육받을 권리를 보장하고 있으며,\n이는 단순히 지식을 습득하는 것을 넘어 비판적 사고 능력을 기르는 것을 포함한다.",
    keywords: ["헌법", "기본권"],
    role: "부연",
  },
  {
    text: "따라서 학교와 가정에서는 독서 습관을 장려하고\n디지털 기기 사용을 적절히 조절하는 방향으로 교육 환경을 개선해 나가야 한다.",
    keywords: [],
    role: "결과",
  },
];

const SEGMENTS_HARD: Segment[] = [
  {
    text: "오늘날 많은 학생들은 스마트폰 사용 시간이 증가하면서 문해력이 저하되고 있다. 문해력이란 글을 읽고 그 의미를 정확히 이해하는 능력으로, 민주주의 사회에서 기본권을 누리기 위해 반드시 필요한 역량이다.",
    keywords: ["문해력 저하", "민주주의", "기본권"],
    role: "주어",
  },
  {
    text: "헌법은 모든 국민에게 교육받을 권리를 보장하고 있으며, 이는 단순히 지식을 습득하는 것을 넘어 비판적 사고 능력을 기르는 것을 포함한다. 따라서 학교와 가정에서는 독서 습관을 장려하고 디지털 기기 사용을 적절히 조절하는 방향으로 교육 환경을 개선해 나가야 한다.",
    keywords: ["헌법"],
    role: "결과",
  },
];

const QUIZ_OPTIONS: QuizOption[] = [
  { text: "스마트폰 판매량의 지속적인 증가", isCorrect: false },
  { text: "학생들의 문해력 저하와 교육 환경 개선의 필요성", isCorrect: true },
  { text: "헌법에 규정된 교육비 지원 제도", isCorrect: false },
  { text: "인터넷 속도 향상에 따른 학습 효과", isCorrect: false },
];

const QUIZ_QUESTION = "이 글의 핵심 내용으로 가장 적절한 것은?";
const QUIZ_EXPLANATION =
  "이 글은 스마트폰 사용 증가로 인한 문해력 저하 문제를 제기하고, 문해력의 중요성(헌법·기본권·민주주의)을 설명한 뒤, 독서 습관 장려와 디지털 기기 조절을 통한 교육 환경 개선을 촉구하고 있습니다.";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSegments(difficulty: Difficulty): Segment[] {
  if (difficulty === "easy") return SEGMENTS_EASY;
  if (difficulty === "normal") return SEGMENTS_NORMAL;
  return SEGMENTS_HARD;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export function ReadingTrainingPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const segments = getSegments(difficulty);
  const totalSegments = segments.length;
  const segment = segments[currentIdx];

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function handleStart() {
    setCurrentIdx(0);
    setSelectedOption(null);
    setPhase("training");
    scrollTop();
  }

  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx((n) => n - 1);
  }

  function handleNext() {
    if (currentIdx < totalSegments - 1) {
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
    setPhase("input");
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
          />
        )}

        {/* ── TRAINING PHASE ── */}
        {phase === "training" && segment && (
          <TrainingPhase
            difficulty={difficulty}
            segment={segment}
            currentIdx={currentIdx}
            totalSegments={totalSegments}
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
