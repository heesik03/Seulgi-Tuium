import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, Check, Pencil, Search, Trash2, ExternalLink } from "lucide-react";
import { Input } from "../../components/ui/input";
import { getFavoriteWords, deleteFavoriteWord } from "./api/wordApi";
import type { FavoriteWordRes } from "./types/wordType";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { BookOpen } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { getWordBooks, createWordBookWithWords, deleteWordBook } from "./api/wordBookApi";
import type { WordBookRes } from "./types/wordBookType";

export function VocabularyPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteWordRes[]>([]);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [title, setTitle] = useState("나의 단어장");
  const [editingTitle, setEditingTitle] = useState(false);

  const [activeTab, setActiveTab] = useState("favorites");
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [wordBooks, setWordBooks] = useState<WordBookRes[]>([]);

  useEffect(() => {
    if (activeTab === "wordbook") {
      fetchWordBooks();
    }
  }, [activeTab]);

  const fetchWordBooks = async () => {
    try {
      const res = await getWordBooks();
      setWordBooks(res);
    } catch (e) {
      console.error("Failed to fetch wordbooks", e);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedWordIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateWordBook = async () => {
    if (selectedWordIds.length === 0) return;
    try {
      const selectedItems = items.filter((i) => selectedWordIds.includes(i.favoriteWordId));
      const wordsToSave = selectedItems.map((item) => ({
        word: item.word ?? item.UrimalsaemItem?.word ?? item.urimalsaemItem?.word ?? "",
        targetCode: item.UrimalsaemItem?.targetCode ?? item.urimalsaemItem?.targetCode ?? 0,
        senseNo: item.UrimalsaemItem?.senseNo ?? item.urimalsaemItem?.senseNo ?? 0,
        definition: item.definition ?? item.UrimalsaemItem?.definition ?? item.urimalsaemItem?.definition ?? "",
        pos: item.pos ?? item.UrimalsaemItem?.pos ?? item.urimalsaemItem?.pos ?? "",
        link: item.UrimalsaemItem?.link ?? item.urimalsaemItem?.link ?? "",
        type: item.type ?? item.UrimalsaemItem?.type ?? item.urimalsaemItem?.type ?? "",
      }));

      await createWordBookWithWords({ words: wordsToSave });
      setSelectedWordIds([]);
      setActiveTab("wordbook");
    } catch (e) {
      alert("단어장 생성 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteWordBook = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteWordBook(id);
      setWordBooks((prev) => prev.filter((wb) => wb.wordBookId !== id));
    } catch (e) {
      alert("단어장 삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await getFavoriteWords(undefined, 100);
      setItems(res.content);
    } catch (error) {
      console.error("Failed to fetch words", error);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((i) => {
          const word = i.word ?? i.UrimalsaemItem?.word ?? i.urimalsaemItem?.word ?? "";
          const def = i.definition ?? i.UrimalsaemItem?.definition ?? i.urimalsaemItem?.definition ?? "";
          return word.toLowerCase().includes(q) || def.toLowerCase().includes(q);
        })
      : items;
    return [...list].sort((a, b) => {
      const dateA = a.addedAt || "";
      const dateB = b.addedAt || "";
      return sortDesc
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
    });
  }, [items, query, sortDesc]);

  const handleDelete = async (id: number) => {
    try {
      await deleteFavoriteWord(id);
      setItems((prev) => prev.filter((i) => i.favoriteWordId !== id));
      setSelectedWordIds((prev) => prev.filter((x) => x !== id));
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Page heading */}
        <header className="flex flex-col gap-2">
          <h1
            className="text-slate-900 dark:text-white"
            style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            단어장
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            저장한 어려운 단어와 뜻을 다시 확인해보세요.
          </p>

          {/* Editable title */}
          <div className="mt-4 inline-flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={!editingTitle}
              placeholder="제목을 입력하세요"
              className="h-8 flex-1 border-0 bg-transparent p-0 text-slate-800 dark:text-slate-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ fontSize: "15px", fontWeight: 600 }}
            />
            <button
              type="button"
              onClick={() => setEditingTitle((v) => !v)}
              aria-label={editingTitle ? "제목 저장" : "제목 수정"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-600"
            >
              {editingTitle ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              즐겨찾기 단어
            </TabsTrigger>
            <TabsTrigger value="wordbook" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              단어장
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {/* Vocabulary container */}
            <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
              {/* Search & filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="단어 검색"
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50/40 pl-10 focus-visible:border-blue-400 focus-visible:bg-white dark:bg-slate-950 focus-visible:ring-4 focus-visible:ring-blue-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {selectedWordIds.length > 0 && (
                    <Button 
                      onClick={handleCreateWordBook} 
                      className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-0"
                    >
                      선택한 {selectedWordIds.length}개로 단어장 만들기
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSortDesc((v) => !v)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                    style={{ fontSize: "13px" }}
                  >
                    {sortDesc ? "최신순" : "오래된순"}
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="mt-6">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50/40 px-6 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 shadow-sm">
                      <Bookmark className="h-5 w-5" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "14px" }}>
                      {query
                        ? "검색 결과가 없습니다."
                        : "저장된 단어가 아직 없습니다."}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filtered.map((item) => {
                      const word = item.word ?? item.UrimalsaemItem?.word ?? item.urimalsaemItem?.word ?? "알 수 없음";
                      const definition = item.definition ?? item.UrimalsaemItem?.definition ?? item.urimalsaemItem?.definition ?? "뜻이 제공되지 않았습니다.";
                      const pos = item.pos ?? item.UrimalsaemItem?.pos ?? item.urimalsaemItem?.pos ?? "";
                      const type = item.type ?? item.UrimalsaemItem?.type ?? item.urimalsaemItem?.type ?? "";
                      const link = item.link ?? item.UrimalsaemItem?.link ?? item.urimalsaemItem?.link ?? "";

                      return (
                      <li
                        key={item.favoriteWordId}
                        className="group flex flex-col gap-4 rounded-xl px-2 py-5 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50/60 sm:flex-row sm:items-start sm:justify-between sm:px-4"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="pt-1">
                            <Checkbox 
                              checked={selectedWordIds.includes(item.favoriteWordId)}
                              onCheckedChange={() => toggleSelection(item.favoriteWordId)}
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <h3
                                className="text-slate-900 dark:text-white"
                                style={{
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {word}
                              </h3>
                              {link && (
                                <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition"
                                >
                                  사전 보기 <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p
                              className="text-slate-700 dark:text-slate-300"
                              style={{ fontSize: "15px", lineHeight: "1.7" }}
                            >
                              {definition}
                            </p>
                            <p className="mt-1 text-right text-[11px] text-slate-400 dark:text-slate-500">
                              (제공: 국립국어원 우리말샘)
                            </p>
                            {pos && (
                              <p
                                className="text-slate-400 dark:text-slate-500 italic"
                                style={{ fontSize: "13px", lineHeight: "1.7" }}
                              >
                                [{pos}] {type}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                            <BookmarkCheck className="h-3.5 w-3.5 text-blue-500" />
                            <span style={{ fontSize: "12px" }}>
                              {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.favoriteWordId)}
                            aria-label="단어 삭제"
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-400 dark:text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                            style={{ fontSize: "12px" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제
                          </button>
                        </div>
                      </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="wordbook">
            <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">생성된 단어장</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">총 {wordBooks.length}개</span>
              </div>
              
              {wordBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50/40 py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-950 mb-4 shadow-sm text-slate-300 dark:text-slate-600">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">단어장이 없습니다</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">즐겨찾기 단어를 선택하여 새 단어장을 만들어보세요.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wordBooks.map((wb) => (
                    <div 
                      key={wb.wordBookId} 
                      onClick={() => navigate(`/vocabulary/${wb.wordBookId}`)}
                      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 flex-1">
                            {wb.title}
                          </h3>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWordBook(wb.wordBookId);
                          }} 
                          className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition"
                          aria-label="단어장 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 h-10">
                        {wb.description}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          단어 {wb.wordCount}개
                        </span>
                        <span>{new Date(wb.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default VocabularyPage;
