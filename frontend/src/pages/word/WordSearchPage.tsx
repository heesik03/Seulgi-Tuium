import { useWordSearch } from "./hooks/useWordSearch";
import { Bookmark, BookmarkCheck, ExternalLink, Search, Sparkles, Clock, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export function WordSearchPage() {
  const navigate = useNavigate();
  const {
    query,
    groupedWords,
    loading,
    error,
    favoriteMap,
    toggleFavorite,
    isPending,
    searchHistory,
    removeHistoryKeyword,
    clearSearchHistory,
  } = useWordSearch();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        
        {/* 페이지 헤더 */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-emerald-500 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              사전 검색 결과
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {query ? (
              <>
                <strong className="text-blue-600 dark:text-blue-400">“{query}”</strong>에 대한 우리말샘 사전 검색 결과입니다.
              </>
            ) : (
              "검색할 단어를 헤더의 검색창에 입력해 주세요."
            )}
          </p>
        </header>

        {/* 1. 로딩 상태 표시 (스켈레톤 카드 렌더링) */}
        {loading && (
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8"
              >
                <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
                <div className="space-y-3">
                  <div className="h-5 w-full bg-slate-100 dark:bg-slate-900 rounded-md" />
                  <div className="h-5 w-4/5 bg-slate-100 dark:bg-slate-900 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. 에러 상태 표시 */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-950/30 dark:bg-red-950/10 dark:text-red-400">
            <p className="font-semibold">검색 결과를 가져오는 데 실패했습니다.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 4. 검색 쿼리가 없을 때 최근 검색어 표시 */}
        {!query && (
          <div className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <h3 className="text-slate-800 dark:text-slate-200 font-bold" style={{ fontSize: "16px" }}>
                  최근 검색어
                </h3>
              </div>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  전체 삭제
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500" style={{ fontSize: "14px" }}>
                최근 검색 기록이 없습니다.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 px-3.5 py-1.5 transition duration-200 cursor-pointer text-slate-700 dark:text-slate-300 group"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(item.keyword)}`)}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.keyword}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryKeyword(item.id);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. 검색 결과 목록 */}
        {!loading && !error && query && (
          <div className="flex flex-col gap-6">
            {groupedWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50/40 px-6 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 shadow-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-slate-800 dark:text-slate-200 font-bold" style={{ fontSize: "18px" }}>
                  검색 결과가 없습니다
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm" style={{ fontSize: "14px" }}>
                  입력한 단어가 우리말샘 사전에 존재하지 않거나, 맞춤법이 올바른지 확인해 보세요.
                </p>
              </div>
            ) : (
              groupedWords.map((grouped) => (
                <article
                  key={grouped.word}
                  className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10 transition hover:shadow-[0_12px_48px_-12px_rgba(15,23,42,0.12)]"
                >
                  {/* 단어 타이틀 표기 */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-6">
                    <div className="flex items-baseline gap-2.5">
                      <h2
                        className="text-slate-950 dark:text-white"
                        style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}
                      >
                        {grouped.word}
                      </h2>
                      <span className="text-sm text-slate-400 dark:text-slate-500">
                        뜻풀이 {grouped.items.length}개
                      </span>
                    </div>
                  </div>

                  {/* 여러 뜻풀이 리스트 출력 */}
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                    {grouped.items.map((item) => {
                      const isFavorited = favoriteMap.has(item.targetCode);
                      return (
                        <div
                          key={item.targetCode}
                          className="py-6 first:pt-0 last:pb-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="flex flex-col gap-2.5 flex-1 pr-4">
                            {/* 의미 번호 및 품사/범주 태그 */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
                                {item.senseNo}
                              </span>
                              {item.pos && (
                                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  {item.pos}
                                </span>
                              )}
                              {item.type && item.type !== "일반어" && (
                                <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  {item.type}
                                </span>
                              )}
                            </div>

                            {/* 뜻풀이 본문 */}
                            <p
                              className="text-slate-700 dark:text-slate-300 font-medium"
                              style={{ fontSize: "16px", lineHeight: "1.75" }}
                            >
                              {item.definition}
                            </p>

                            {/* 상세 사전 링크 */}
                            {item.link && (
                              <div className="mt-1">
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition hover:underline"
                                >
                                  우리말샘 사전 상세 보기
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* 즐겨찾기(북마크) 등록 및 삭제 버튼 */}
                          <div className="flex sm:self-start self-end shrink-0">
                            <Button
                              onClick={() => toggleFavorite(item)}
                              disabled={isPending}
                              variant={isFavorited ? "default" : "outline"}
                              className={`h-10 rounded-xl px-4 transition ${
                                isFavorited
                                  ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xs"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                              }`}
                            >
                              {isFavorited ? (
                                <>
                                  <BookmarkCheck className="h-4 w-4 mr-1.5 fill-current" />
                                  즐겨찾기됨
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-4 w-4 mr-1.5" />
                                  즐겨찾기 추가
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 국립국어원 출처 표기 */}
                  <div className="mt-6 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800/60 text-right">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      (제공: 국립국어원 우리말샘)
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordSearchPage;
