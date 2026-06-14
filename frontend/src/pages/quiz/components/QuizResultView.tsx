import { useMemo } from "react";
import { CheckCircle2, XCircle, Award, Calendar, ChevronRight, RotateCcw, Home, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { QuizResponse, QuizHistoryResponse } from "../types/quizType";

interface QuizResultViewProps {
  quiz: QuizResponse;
  history: QuizHistoryResponse;
  onRetry?: () => void;
  onBack: () => void;
}

// 힙(Heap) 메모리 할당 비용 최적화를 위한 헬퍼 함수 외부 격리
function parseSentence(text: string) {
  if (!text) return [];
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

export function QuizResultView({ quiz, history, onRetry, onBack }: QuizResultViewProps) {
  const resultSummary = useMemo(() => {
    const total = history.results.length;
    const correctCount = history.results.filter((r) => r.isCorrect).length;
    return {
      total,
      correctCount,
      wrongCount: total - correctCount,
    };
  }, [history]);

  return (
    <div className="flex flex-col gap-6">
      {/* Score Summary Card */}
      <section className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-md text-center sm:p-10">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <Award className="h-12 w-12" />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          퀴즈 완료!
        </h2>
        <div className="mt-2 text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-emerald-500">
          {history.score}점
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            정답 {resultSummary.correctCount}개
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            오답 {resultSummary.wrongCount}개
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(history.solvedAt).toLocaleDateString()}
          </span>
        </div>
      </section>

      {/* Answer Verification List */}
      <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-md sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
          문항별 결과 상세
        </h3>

        <div className="flex flex-col gap-8">
          {quiz.questions.map((question, index) => {
            const answerResult = history.results.find(
              (r) => r.questionId === question.questionId
            );
            
            // 선택지 옵션 파싱
            let options: string[] = [];
            try {
              options = JSON.parse(question.options);
            } catch (e) {
              options = [];
            }

            const submittedIdx = answerResult ? Number(answerResult.submittedAnswer) - 1 : -1;
            const correctIdx = answerResult ? Number(answerResult.correctAnswer) - 1 : -1;
            const isCorrect = answerResult?.isCorrect ?? false;

            return (
              <article
                key={question.questionId}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isCorrect
                    ? "border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20"
                    : "border-red-100 bg-red-50/10 dark:border-red-950/20"
                }`}
              >
                {/* Result Indicator Header */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-500">
                      문제 {index + 1}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      기준 단어: <strong className="text-slate-600 dark:text-slate-300">{question.word}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">정답</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-600">오답</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed sm:text-lg">
                  {parseSentence(question.questionText).map((part, i) =>
                    part.type === "term" ? (
                      <span
                        key={i}
                        className="mx-1 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 align-middle"
                      >
                        {part.value}
                      </span>
                    ) : (
                      <span key={i}>{part.value}</span>
                    )
                  )}
                </div>

                {/* Choices Comparison */}
                <div className="mt-5 flex flex-col gap-2">
                  {options.map((option, optIdx) => {
                    const isSubmitted = optIdx === submittedIdx;
                    const isCorrectAnswer = optIdx === correctIdx;

                    let rowStyle = "border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400";
                    let badge = null;

                    if (isCorrectAnswer) {
                      rowStyle = "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/30 dark:bg-emerald-950/20 dark:text-emerald-300";
                      badge = (
                        <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          정답
                        </span>
                      );
                    } else if (isSubmitted) {
                      rowStyle = "border-red-200 bg-red-50/50 text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-300";
                      badge = (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          내가 선택한 오답
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${rowStyle}`}
                      >
                        <span className="font-bold">{optIdx + 1}</span>
                        <span>{option}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* External Dictionary Link for feedback */}
                <div className="mt-4 flex justify-end">
                  <a
                    href={`https://opendict.korean.go.kr/search/searchResult?focus_name_top=query&query=${encodeURIComponent(
                      question.word
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                  >
                    사전에서 "{question.word}" 뜻 확인하기
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer Controls */}
      <footer className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onBack} className="h-11 rounded-xl">
          <Home className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Button>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            이 퀴즈 다시 풀기
          </Button>
        )}
      </footer>
    </div>
  );
}
export default QuizResultView;
