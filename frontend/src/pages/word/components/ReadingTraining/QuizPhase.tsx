import { Check, X, ArrowLeft, ArrowRight } from "lucide-react";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizPhaseProps {
  quizQuestion: string;
  quizOptions: QuizOption[];
  selectedOption: number | null;
  handlePickAnswer: (idx: number) => void;
  answeredCorrectly: boolean;
  quizExplanation: string;
  setCurrentIdx: (idx: number) => void;
  setPhase: (phase: "input" | "training" | "quiz" | "review") => void;
  scrollTop: () => void;
}

export function QuizPhase({
  quizQuestion,
  quizOptions,
  selectedOption,
  handlePickAnswer,
  answeredCorrectly,
  quizExplanation,
  setCurrentIdx,
  setPhase,
  scrollTop,
}: QuizPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <span className="text-slate-700" style={{ fontSize: "14px", fontWeight: 600 }}>
          이해도 확인
        </span>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <p
          className="text-slate-800"
          style={{ fontSize: "18px", fontWeight: 600, lineHeight: "1.7", letterSpacing: "-0.01em" }}
        >
          {quizQuestion}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {quizOptions.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const answered = selectedOption !== null;
            const showCorrect = answered && opt.isCorrect;
            const showWrong = isSelected && !opt.isCorrect;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickAnswer(idx)}
                disabled={answered}
                className={`group flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition sm:px-5 ${
                  showCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : showWrong
                      ? "border-red-200 bg-red-50"
                      : isSelected
                        ? "border-blue-300 bg-blue-50"
                        : answered
                          ? "border-slate-100 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    showCorrect
                      ? "bg-emerald-500 text-white"
                      : showWrong
                        ? "bg-red-500 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  {showCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : showWrong ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    `${idx + 1}`
                  )}
                </span>
                <span
                  className={`flex-1 ${
                    showCorrect ? "text-emerald-800" : showWrong ? "text-red-800" : "text-slate-700"
                  }`}
                  style={{ fontSize: "15px", lineHeight: "1.65" }}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div
            className={`mt-6 rounded-xl border p-5 ${
              answeredCorrectly ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-white ${
                  answeredCorrectly ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {answeredCorrectly ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span
                className={answeredCorrectly ? "text-emerald-700" : "text-red-700"}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                {answeredCorrectly ? "정답입니다!" : "아쉬워요. 다시 살펴볼게요."}
              </span>
            </div>
            <div>
              <span className="text-slate-400" style={{ fontSize: "12px" }}>
                해설
              </span>
              <p className="mt-1.5 text-slate-700" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                {quizExplanation}
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setCurrentIdx(0);
            setPhase("training");
            scrollTop();
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-800 cursor-pointer"
          style={{ fontSize: "14px" }}
        >
          <ArrowLeft className="h-4 w-4" />
          다시 읽기
        </button>

        {selectedOption !== null && (
          <button
            type="button"
            onClick={() => {
              setPhase("review");
              scrollTop();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 py-2.5 text-white shadow-md shadow-blue-500/20 transition hover:from-blue-600 hover:to-emerald-600 cursor-pointer"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            전체 글 다시 보기
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
