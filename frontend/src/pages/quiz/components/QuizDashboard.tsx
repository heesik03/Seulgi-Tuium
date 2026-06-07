import { useEffect, useState, useTransition, useDeferredValue } from "react";
import { BookOpen, Calendar, HelpCircle, Award, Trash2, Pencil, Check, Plus, AlertCircle, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { QuizResponse, QuizHistoryResponse } from "../types/quizType";

interface QuizDashboardProps {
  quizzes: QuizResponse[];
  histories: QuizHistoryResponse[];
  isQuizPending: boolean;
  isHistoryPending: boolean;
  quizHasNext: boolean;
  historyHasNext: boolean;
  quizNextCursor: number | null;
  historyNextCursor: number | null;
  onFetchQuizzes: (cursorId?: number) => Promise<void>;
  onFetchHistories: (cursorId?: number) => Promise<void>;
  onDeleteQuiz: (quizId: number) => Promise<void>;
  onDeleteHistory: (historyId: number) => Promise<void>;
  onUpdateQuizTitle: (quizId: number, title: string) => Promise<void>;
  onSelectQuiz: (quizId: number) => void;
  onSelectHistory: (historyId: number) => void;
  onStartNewQuiz: () => void;
}

export function QuizDashboard({
  quizzes,
  histories,
  isQuizPending,
  isHistoryPending,
  quizHasNext,
  historyHasNext,
  quizNextCursor,
  historyNextCursor,
  onFetchQuizzes,
  onFetchHistories,
  onDeleteQuiz,
  onDeleteHistory,
  onUpdateQuizTitle,
  onSelectQuiz,
  onSelectHistory,
  onStartNewQuiz,
}: QuizDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("quizzes");
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [, startTransition] = useTransition();

  // 리스트 렌더링 성능 최적화를 위한 useDeferredValue 적용 (대량의 데이터 페이징 렌더 시 버벅임 완화)
  const deferredQuizzes = useDeferredValue(quizzes);
  const deferredHistories = useDeferredValue(histories);

  useEffect(() => {
    // 마운트 시 최초 데이터 로드
    onFetchQuizzes();
    onFetchHistories();
  }, [onFetchQuizzes, onFetchHistories]);

  const handleStartEdit = (e: React.MouseEvent, quiz: QuizResponse) => {
    e.stopPropagation();
    setEditingQuizId(quiz.quizId);
    setEditTitle(quiz.title);
  };

  const handleSaveTitle = async (e: React.MouseEvent, quizId: number) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await onUpdateQuizTitle(quizId, editTitle.trim());
      setEditingQuizId(null);
    } catch (err) {
      alert("제목 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteQuizClick = async (e: React.MouseEvent, quizId: number) => {
    e.stopPropagation();
    if (!window.confirm("이 퀴즈를 정말 삭제하시겠습니까?\n해당 퀴즈의 관련 이력들도 함께 삭제될 수 있습니다.")) return;
    try {
      await onDeleteQuiz(quizId);
    } catch (err) {
      alert("퀴즈 삭제에 실패했습니다.");
    }
  };

  const handleDeleteHistoryClick = async (e: React.MouseEvent, historyId: number) => {
    e.stopPropagation();
    if (!window.confirm("이 풀이 이력을 정말 삭제하시겠습니까?")) return;
    try {
      await onDeleteHistory(historyId);
    } catch (err) {
      alert("이력 삭제에 실패했습니다.");
    }
  };

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Top Banner */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            단어 학습 AI 퀴즈
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            즐겨찾기한 단어들을 모아 실력을 평가하고 복습해 보세요.
          </p>
        </div>
        <Button
          onClick={onStartNewQuiz}
          className="h-11 rounded-xl bg-linear-to-r from-blue-500 to-emerald-500 px-5 text-white shadow-md hover:from-blue-600 hover:to-emerald-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          새로운 퀴즈 만들기
        </Button>
      </section>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            내 퀴즈 목록
          </TabsTrigger>
          <TabsTrigger value="histories" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            풀이 이력
          </TabsTrigger>
        </TabsList>

        {/* Quiz List Tab */}
        <TabsContent value="quizzes">
          <div className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-sm sm:p-8">
            {deferredQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <HelpCircle className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  생성된 퀴즈가 아직 없습니다.
                </p>
                <Button onClick={onStartNewQuiz} variant="link" className="mt-2 text-blue-500">
                  첫 AI 퀴즈 생성하기
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ul className="divide-y divide-slate-100 dark:divide-slate-900">
                  {deferredQuizzes.map((quiz) => (
                    <li
                      key={quiz.quizId}
                      onClick={() => onSelectQuiz(quiz.quizId)}
                      className="group flex flex-col justify-between gap-4 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30 sm:flex-row sm:items-center sm:px-4 sm:rounded-xl cursor-pointer"
                    >
                      <div className="flex flex-1 items-start gap-3.5 min-w-0">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          {editingQuizId === quiz.quizId ? (
                            <div className="flex max-w-md items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="h-8 py-1 text-sm font-semibold"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={(e) => handleSaveTitle(e, quiz.quizId)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingQuizId(null);
                                }}
                                aria-label="수정 취소"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {quiz.title}
                            </h3>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </span>
                            <span>·</span>
                            <span>문제 {quiz.questions?.length || 4}개</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        {editingQuizId !== quiz.quizId && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-slate-400 hover:text-blue-500"
                            onClick={(e) => handleStartEdit(e, quiz)}
                            aria-label="제목 수정"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-red-500"
                          onClick={(e) => handleDeleteQuizClick(e, quiz.quizId)}
                          aria-label="퀴즈 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* More Button */}
                {quizHasNext && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => onFetchQuizzes(quizNextCursor || undefined)}
                      disabled={isQuizPending}
                      className="px-6 rounded-xl"
                    >
                      {isQuizPending ? "불러오는 중..." : "퀴즈 더 보기"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* History List Tab */}
        <TabsContent value="histories">
          <div className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-sm sm:p-8">
            {deferredHistories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Award className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  퀴즈를 푼 기록이 아직 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ul className="divide-y divide-slate-100 dark:divide-slate-900">
                  {deferredHistories.map((history) => (
                    <li
                      key={history.historyId}
                      onClick={() => onSelectHistory(history.historyId)}
                      className="group flex flex-col justify-between gap-4 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30 sm:flex-row sm:items-center sm:px-4 sm:rounded-xl cursor-pointer"
                    >
                      <div className="flex flex-1 items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {history.quizTitle || `풀이 결과 - ${history.score}점`}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                            <span className="font-semibold text-blue-500">{history.score}점</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(history.solvedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-red-500"
                          onClick={(e) => handleDeleteHistoryClick(e, history.historyId)}
                          aria-label="이력 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* More Button */}
                {historyHasNext && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => onFetchHistories(historyNextCursor || undefined)}
                      disabled={isHistoryPending}
                      className="px-6 rounded-xl"
                    >
                      {isHistoryPending ? "불러오는 중..." : "이력 더 보기"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
