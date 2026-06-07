import { useState, useMemo, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, X, RotateCcw, Award } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { QuizResponse } from "../types/quizType";

interface QuizActivePlayProps {
  quiz: QuizResponse;
  answers: Record<number, string>;
  isPending: boolean;
  onMarkAnswer: (questionId: number, answer: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// 힙(Heap) 메모리 누수 방지 및 Allocation Cost 감소를 위해 파싱 유틸리티를 컴포넌트 스코프 외부로 격리
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

export function QuizActivePlay({
  quiz,
  answers,
  isPending,
  onMarkAnswer,
  onSubmit,
  onCancel,
}: QuizActivePlayProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIdx];

  // 선택지 JSON 문자열 파싱 메모이제이션
  const parsedOptions = useMemo<string[]>(() => {
    if (!currentQuestion?.options) return [];
    try {
      return JSON.parse(currentQuestion.options);
    } catch {
      return [];
    }
  }, [currentQuestion]);

  const markedAnswer = answers[currentQuestion?.questionId] || "";

  // 문제 이동 핸들러
  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  }, [currentIdx, questions.length]);

  // 키보드 조작 지원을 통한 접근성(a11y) 최적화
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPending) return;

      // 1 ~ 4 숫자 키로 선택지 마킹
      if (["1", "2", "3", "4"].includes(e.key) && currentQuestion) {
        onMarkAnswer(currentQuestion.questionId, e.key);
      }

      // 왼쪽/오른쪽 방향키로 문항 전환
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestion, onMarkAnswer, handlePrev, handleNext, isPending]);

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
        문제가 존재하지 않습니다.
      </div>
    );
  }

  const isLastQuestion = currentIdx === questions.length - 1;
  const isAllAnswered = questions.every((q) => !!answers[q.questionId]);

  return (
    <article className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-md sm:p-8 lg:p-10">
      {/* Quiz Play Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {quiz.title}
          </span>
          <span className="text-sm font-bold text-blue-500">
            Q{currentIdx + 1} / {questions.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          그만두기
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Content */}
      <section className="mb-8">
        <div className="text-lg font-bold text-slate-800 dark:text-slate-200 sm:text-2xl leading-relaxed">
          {parseSentence(currentQuestion.questionText).map((part, i) =>
            part.type === "term" ? (
              <span
                key={i}
                className="mx-1.5 inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-0.5 text-base font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 align-middle"
              >
                {part.value}
              </span>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          기준 단어: <span className="font-bold text-slate-700 dark:text-slate-300">{currentQuestion.word}</span>
        </p>
      </section>

      {/* Choices Grid */}
      <div className="grid gap-3.5 mb-8">
        {parsedOptions.map((option, idx) => {
          const choiceStr = String(idx + 1);
          const active = markedAnswer === choiceStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onMarkAnswer(currentQuestion.questionId, choiceStr)}
              className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-blue-500 bg-blue-50/20 text-blue-800 dark:bg-blue-950/10 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-slate-50/30"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  active
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                }`}
              >
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-medium leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <footer className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="rounded-xl px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전 문제
        </Button>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          단축키: 숫자키 1~4 (답안 마크) · 방향키 (문제 이동)
        </span>

        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            disabled={!isAllAnswered || isPending}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md disabled:opacity-50"
          >
            {isPending ? "채점하는 중..." : "답안 제출 및 채점"}
            <Award className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!markedAnswer}
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            다음 문제
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </footer>
    </article>
  );
}
export default QuizActivePlay;
