import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles, X, ChevronLeft, Bookmark } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getFavoriteWords } from "../../word/api/wordApi";
import type { FavoriteWordRes } from "../../word/types/wordType";

interface QuizWordSelectorProps {
  onCancel: () => void;
  onCreateQuiz: (words: string[]) => void;
}

export function QuizWordSelector({ onCancel, onCreateQuiz }: QuizWordSelectorProps) {
  const [favoriteWords, setFavoriteWords] = useState<FavoriteWordRes[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setError(null);
      try {
        // 최대 100개까지 즐겨찾기 단어를 조회해 옴
        const res = await getFavoriteWords(undefined, 100);
        setFavoriteWords(res.content);
      } catch (err) {
        setError("즐겨찾기 단어 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  const toggleWord = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((x) => x !== word) : [...prev, word]
    );
  };

  const handleStart = () => {
    if (selectedWords.length < 4 || selectedWords.length > 10) return;
    onCreateQuiz(selectedWords);
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-md sm:p-8 lg:p-10">
      <header className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          aria-label="이전 화면으로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            퀴즈 생성 단어 선택
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            문제를 출제할 단어를 최소 4개에서 최대 10개까지 선택해 주세요.
          </p>
        </div>
      </header>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span className="text-sm text-slate-500">즐겨찾기 단어를 불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-red-500 gap-2">
          <X className="h-8 w-8" />
          <p className="text-sm">{error}</p>
        </div>
      ) : favoriteWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50">
          <Bookmark className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            즐겨찾기(보관)한 단어가 없습니다.<br />
            단어 사전 검색이나 번역 훈련에서 단어를 먼저 즐겨찾기해 보세요.
          </p>
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            대시보드로 돌아가기
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Word Tags Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favoriteWords.map((item) => {
              const wordStr =
                item.word ??
                item.UrimalsaemItem?.word ??
                item.urimalsaemItem?.word ??
                "";
              if (!wordStr) return null;
              const active = selectedWords.includes(wordStr);

              return (
                <button
                  key={item.favoriteWordId}
                  type="button"
                  onClick={() => toggleWord(wordStr)}
                  className={`inline-flex items-center justify-between gap-1.5 rounded-xl border px-3.5 py-3 transition text-left ${
                    active
                      ? "border-blue-500 bg-blue-50/40 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-slate-50/50"
                  }`}
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  <span className="truncate flex-1">{wordStr}</span>
                  {active && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <footer className="mt-4 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedWords.length > 0
                ? `선택한 단어: ${selectedWords.length}개 (4~10개 지정 가능)`
                : "단어를 선택해 주세요."}
            </span>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl">
                취소
              </Button>
              <Button
                onClick={handleStart}
                disabled={selectedWords.length < 4 || selectedWords.length > 10}
                className="group h-11 rounded-xl bg-linear-to-r from-blue-500 to-emerald-500 px-5 text-white shadow-md hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                퀴즈 생성하기
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </div>
          </footer>
        </div>
      )}
    </section>
  );
}
export default QuizWordSelector;
