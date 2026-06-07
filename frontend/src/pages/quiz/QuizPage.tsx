import { useState, useTransition, Activity } from "react";
import { useQuiz } from "./hooks/useQuiz";
import { useQuizHistory } from "./hooks/useQuizHistory";
import { QuizDashboard } from "./components/QuizDashboard";
import { QuizWordSelector } from "./components/QuizWordSelector";
import { QuizLoading } from "./components/QuizLoading";
import { QuizActivePlay } from "./components/QuizActivePlay";
import { QuizResultView } from "./components/QuizResultView";
import { AlertCircle } from "lucide-react";

type ViewMode = "dashboard" | "selector" | "loading" | "play" | "result" | "history-detail";

export function QuizPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [, startTransition] = useTransition();

  const {
    quizzes,
    activeQuiz,
    answers,
    quizResult,
    isPending: isQuizPending,
    error: quizError,
    hasNext: quizHasNext,
    nextCursor: quizNextCursor,
    handleCreateQuiz,
    fetchQuizzes,
    fetchQuizDetail,
    handleExtractQuiz,
    handleModifyQuizTitle,
    handleMarkAnswer,
    handleSubmitQuiz,
    resetQuizPlay,
    setActiveQuiz,
    setQuizResult,
  } = useQuiz();

  const {
    histories,
    activeHistory,
    isPending: isHistoryPending,
    error: historyError,
    hasNext: historyHasNext,
    nextCursor: historyNextCursor,
    fetchHistories,
    fetchHistoryDetail,
    handleRemoveHistory,
    setActiveHistory,
  } = useQuizHistory();

  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    startTransition(() => {
      setViewMode("dashboard");
      setActiveQuiz(null);
      setActiveHistory(null);
      resetQuizPlay();
    });
  };

  // 퀴즈 생성 개시
  const handleStartCreateQuiz = async (words: string[]) => {
    setViewMode("loading");
    const newQuiz = await handleCreateQuiz(words);
    if (newQuiz) {
      setViewMode("play");
    } else {
      setViewMode("selector");
    }
  };

  // 퀴즈 제출
  const handleSubmitActiveQuiz = async () => {
    if (!activeQuiz) return;
    const result = await handleSubmitQuiz(activeQuiz.quizId);
    if (result) {
      setViewMode("result");
      // 제출 완료 후 대시보드 리스트 리프레시 유도
      fetchQuizzes();
      fetchHistories();
    }
  };

  // 과거 이력 상세 복습 진입
  const handleViewHistoryDetail = async (historyId: number) => {
    // 1. 이력 상세 먼저 호출
    const historyDetail = await fetchHistoryDetail(historyId);
    if (historyDetail) {
      // 2. 이력에 매칭된 퀴즈 상세 호출
      const quizDetail = await fetchQuizDetail(historyDetail.quizId);
      if (quizDetail) {
        setViewMode("history-detail");
      }
    }
  };

  // 퀴즈 단건 상세 진입 (대시보드에서 퀴즈 목록 클릭 시 바로 풀기 유도)
  const handleViewQuizDetail = async (quizId: number) => {
    const quizDetail = await fetchQuizDetail(quizId);
    if (quizDetail) {
      setViewMode("play");
    }
  };

  // 퀴즈 재풀이
  const handleRetryQuiz = () => {
    resetQuizPlay();
    setViewMode("play");
  };

  // 에러 메시지 통합 출력
  const activeError = quizError || historyError;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <main className="mx-auto flex w-full max-w-225 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Error Alert Display */}
        {activeError && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm font-semibold">{activeError}</div>
          </div>
        )}

        {/* View Mode Routing */}
        {viewMode === "dashboard" && (
          <QuizDashboard
            quizzes={quizzes}
            histories={histories}
            isQuizPending={isQuizPending}
            isHistoryPending={isHistoryPending}
            quizHasNext={quizHasNext}
            historyHasNext={historyHasNext}
            quizNextCursor={quizNextCursor}
            historyNextCursor={historyNextCursor}
            onFetchQuizzes={fetchQuizzes}
            onFetchHistories={fetchHistories}
            onDeleteQuiz={handleExtractQuiz}
            onDeleteHistory={handleRemoveHistory}
            onUpdateQuizTitle={handleModifyQuizTitle}
            onSelectQuiz={handleViewQuizDetail}
            onSelectHistory={handleViewHistoryDetail}
            onStartNewQuiz={() => setViewMode("selector")}
          />
        )}

        {viewMode === "selector" && (
          <QuizWordSelector
            onCancel={handleBackToDashboard}
            onCreateQuiz={handleStartCreateQuiz}
          />
        )}

        {viewMode === "loading" && <QuizLoading />}

        {viewMode === "play" && activeQuiz && (
          <QuizActivePlay
            quiz={activeQuiz}
            answers={answers}
            isPending={isQuizPending}
            onMarkAnswer={handleMarkAnswer}
            onSubmit={handleSubmitActiveQuiz}
            onCancel={handleBackToDashboard}
          />
        )}

        {viewMode === "result" && activeQuiz && quizResult && (
          <QuizResultView
            quiz={activeQuiz}
            history={quizResult}
            onRetry={handleRetryQuiz}
            onBack={handleBackToDashboard}
          />
        )}

        {viewMode === "history-detail" && activeQuiz && activeHistory && (
          <QuizResultView
            quiz={activeQuiz}
            history={activeHistory}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default QuizPage;
