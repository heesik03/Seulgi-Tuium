import { useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "../../components/ui/button";

type Vocab = {
  word: string;
  meaning: string;
};

type Quiz = {
  sentence: string; // uses [[word]] markers
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  vocab: Vocab[];
};

const VOCAB_BANK: Vocab[] = [
  { word: "헌법", meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률" },
  { word: "기본권", meaning: "사람이라면 누구나 누려야 하는 기본적인 권리" },
  { word: "보장", meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것" },
  { word: "국민", meaning: "한 나라에 속해 있는 사람들" },
  { word: "행정", meaning: "법에 따라 나라의 일을 처리하고 운영하는 활동" },
  { word: "입법", meaning: "법을 만드는 활동이나 일" },
];

const QUIZ_BANK: Quiz[] = [
  {
    sentence: "[[헌법]]은 [[국민]]의 [[기본권]]을 [[보장]]한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "국민이 세금을 내야 한다는 뜻",
      "국민의 권리를 법이 지켜준다는 뜻",
      "법원이 새로운 법을 만든다는 뜻",
      "국민이 선거를 해야 한다는 뜻",
    ],
    answerIndex: 1,
    explanation:
      "“기본권”이라는 단어 때문에 문장의 핵심 의미가 국민의 권리 보호라는 점을 알 수 있습니다.",
    vocab: [
      { word: "헌법", meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률" },
      { word: "기본권", meaning: "사람이라면 누구나 누려야 하는 기본적인 권리" },
      { word: "보장", meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것" },
    ],
  },
  {
    sentence: "[[입법]] 기관은 새로운 법을 만들고 고치는 일을 한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "법을 집행하는 기관에 대한 설명",
      "재판을 진행하는 기관에 대한 설명",
      "법을 만들고 개정하는 기관에 대한 설명",
      "세금을 걷는 기관에 대한 설명",
    ],
    answerIndex: 2,
    explanation:
      "“입법”은 법을 만드는 활동을 뜻하므로, 법을 새로 만들거나 고치는 기관을 설명한 문장입니다.",
    vocab: [{ word: "입법", meaning: "법을 만드는 활동이나 일" }],
  },
  {
    sentence: "[[행정]] 기관은 [[국민]]에게 필요한 서비스를 제공한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "법을 만드는 기관이 시민에게 서비스를 한다",
      "나라 살림을 맡은 기관이 사람들에게 필요한 서비스를 준다",
      "재판소가 시민의 분쟁을 해결한다",
      "기업이 시민에게 물건을 판다",
    ],
    answerIndex: 1,
    explanation:
      "“행정”은 법에 따라 나라의 일을 처리하는 활동을 뜻합니다. 따라서 행정 기관은 시민들에게 공공 서비스를 제공하는 역할을 합니다.",
    vocab: [
      { word: "행정", meaning: "법에 따라 나라의 일을 처리하고 운영하는 활동" },
      { word: "국민", meaning: "한 나라에 속해 있는 사람들" },
    ],
  },
];

function parseSentence(text: string) {
  const regex = /\[\[(.+?)\]\]/g;
  const out: { type: "text" | "term"; value: string }[] = [];
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    out.push({ type: "term", value: m[1] });
    last = regex.lastIndex;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

export function QuizPage() {
  const [selected, setSelected] = useState<string[]>(["헌법", "기본권"]);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const quizzes = useMemo(() => {
    if (selected.length === 0) return [];
    return QUIZ_BANK.filter((q) =>
      q.vocab.some((v) => selected.includes(v.word)),
    );
  }, [selected]);

  const toggleWord = (w: string) =>
    setSelected((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w],
    );

  const handleStart = () => {
    if (quizzes.length === 0) return;
    setStarted(true);
    setCurrent(0);
    setPicked(null);
  };

  const handleNext = () => {
    if (current + 1 < quizzes.length) {
      setCurrent((c) => c + 1);
      setPicked(null);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setCurrent(0);
    setPicked(null);
  };

  const quiz = quizzes[current];
  const isCorrect = picked !== null && quiz && picked === quiz.answerIndex;
  const isComplete = started && current === quizzes.length - 1 && picked !== null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-225 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Heading */}
        <header className="flex flex-col gap-2">
          <h1
            className="text-slate-900 dark:text-white"
            style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            퀴즈
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            저장한 어려운 단어로 문장을 만들고, 해석 퀴즈를 풀어보세요.
          </p>
        </header>

        {/* Vocabulary Selection */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
              단어 선택
            </h2>
          </div>
          <p className="mb-5 text-slate-500 dark:text-slate-400" style={{ fontSize: "14px" }}>
            문장을 생성할 단어를 선택하세요.
          </p>

          <div className="flex flex-wrap gap-2">
            {VOCAB_BANK.map((v) => {
              const active = selected.includes(v.word);
              return (
                <button
                  key={v.word}
                  type="button"
                  onClick={() => toggleWord(v.word)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                    active
                      ? "bg-blue-500 text-white shadow-[0_4px_12px_-4px_rgba(59,130,246,0.5)]"
                      : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600"
                  }`}
                  style={{ fontSize: "14px" }}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {v.word}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
              {selected.length > 0
                ? `선택된 단어 ${selected.length}개 · 생성 가능한 문제 ${quizzes.length}개`
                : "단어를 한 개 이상 선택해주세요."}
            </span>
            <Button
              onClick={handleStart}
              disabled={quizzes.length === 0}
              className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-5 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600 disabled:opacity-60"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              문장 생성하기
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
          </div>
        </section>

        {/* Quiz Section */}
        {started && quiz && (
          <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            {/* Progress */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                {current + 1} / {quizzes.length} 문제
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-600"
                style={{ fontSize: "12px" }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                다시 시작
              </button>
            </div>

            <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all"
                style={{
                  width: `${((current + (picked !== null ? 1 : 0)) / quizzes.length) * 100}%`,
                }}
              />
            </div>

            {/* Question */}
            <div className="mt-8">
              <span className="text-blue-500" style={{ fontSize: "13px", fontWeight: 600 }}>
                Q{current + 1}
              </span>
              <p
                className="mt-3 text-slate-800 dark:text-slate-200"
                style={{ fontSize: "22px", lineHeight: "1.7", fontWeight: 600, letterSpacing: "-0.01em" }}
              >
                {parseSentence(quiz.sentence).map((s, i) =>
                  s.type === "term" ? (
                    <span
                      key={i}
                      className="mx-0.5 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 align-baseline"
                    >
                      {s.value}
                    </span>
                  ) : (
                    <span key={i}>{s.value}</span>
                  ),
                )}
              </p>
              <p className="mt-5 text-slate-500 dark:text-slate-400" style={{ fontSize: "15px" }}>
                {quiz.question}
              </p>
            </div>

            {/* Choices */}
            <div className="mt-6 flex flex-col gap-3">
              {quiz.choices.map((choice, idx) => {
                const isPicked = picked === idx;
                const showCorrect = picked !== null && idx === quiz.answerIndex;
                const showWrong = isPicked && idx !== quiz.answerIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => picked === null && setPicked(idx)}
                    disabled={picked !== null}
                    className={`group flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition sm:px-5 ${
                      showCorrect
                        ? "border-emerald-200 bg-emerald-50"
                        : showWrong
                          ? "border-red-200 bg-red-50"
                          : isPicked
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-300 hover:bg-blue-50/40"
                    } ${picked !== null ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        showCorrect
                          ? "bg-emerald-500 text-white"
                          : showWrong
                            ? "bg-red-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {showCorrect ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : showWrong ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span
                      className={`flex-1 ${
                        showCorrect ? "text-emerald-800" : showWrong ? "text-red-800" : "text-slate-700 dark:text-slate-300"
                      }`}
                      style={{ fontSize: "15px", lineHeight: "1.65" }}
                    >
                      {choice}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {picked !== null && (
              <div
                className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-red-200 bg-red-50/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                      isCorrect ? "bg-emerald-500" : "bg-red-500"
                    } text-white`}
                  >
                    {isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className={isCorrect ? "text-emerald-700" : "text-red-700"}
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    {isCorrect ? "정답입니다!" : "아쉬워요. 다시 살펴봐요."}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                      정답
                    </span>
                    <p className="mt-1 text-slate-800 dark:text-slate-200" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                      {quiz.choices[quiz.answerIndex]}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                      용어 설명
                    </span>
                    <ul className="mt-2 flex flex-col gap-2">
                      {quiz.vocab.map((v) => (
                        <li
                          key={v.word}
                          className="rounded-lg border border-white/70 bg-white dark:bg-slate-950/80 px-3.5 py-2.5"
                        >
                          <span className="text-blue-600" style={{ fontSize: "14px", fontWeight: 700 }}>
                            {v.word}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px" }}>
                            {" — "}
                            {v.meaning}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                      해설
                    </span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300" style={{ fontSize: "14px", lineHeight: "1.75" }}>
                      {quiz.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  {isComplete ? (
                    <Button
                      onClick={handleReset}
                      className="h-11 rounded-xl border-0 bg-slate-900 px-5 text-white hover:bg-slate-800"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      처음으로
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-5 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] hover:from-blue-600 hover:to-emerald-600"
                    >
                      다음 문제
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
