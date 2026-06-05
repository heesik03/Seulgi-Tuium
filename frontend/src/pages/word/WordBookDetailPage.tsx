import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { getWordBooks, getWordBookWords, updateWordBook, deleteWordBook } from "./api/wordBookApi";
import type { WordBookRes, WordBookWordRes } from "./types/wordBookType";

export function WordBookDetailPage() {
  const { wordBookId } = useParams<{ wordBookId: string }>();
  const navigate = useNavigate();
  const idNum = Number(wordBookId);

  const [wordBook, setWordBook] = useState<WordBookRes | null>(null);
  const [words, setWords] = useState<WordBookWordRes[]>([]);
  const [loading, setLoading] = useState(true);

  // 수정 모드 상태
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // 페이징 상태
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isNaN(idNum)) {
      alert("올바르지 않은 단어장 접근입니다.");
      navigate("/vocabulary");
      return;
    }
    initData();
  }, [wordBookId]);

  const initData = async () => {
    setLoading(true);
    try {
      // 1. 단어장 정보 가져오기 (단일 조회 API가 없으므로 전체 목록에서 매칭)
      const books = await getWordBooks();
      const currentBook = books.find((b) => b.wordBookId === idNum);
      if (!currentBook) {
        alert("해당 단어장을 찾을 수 없습니다.");
        navigate("/vocabulary");
        return;
      }
      setWordBook(currentBook);
      setEditTitle(currentBook.title);
      setEditDesc(currentBook.description);

      // 2. 단어 목록 가져오기
      const wordsRes = await getWordBookWords(idNum, undefined, 15);
      setWords(wordsRes.content);
      setLastId(wordsRes.nextCursor);
      setHasNext(wordsRes.hasNext);
    } catch (e) {
      console.error("데이터 로드 실패", e);
      alert("단어장 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreWords = async () => {
    if (!lastId || loadingMore) return;
    setLoadingMore(true);
    try {
      const wordsRes = await getWordBookWords(idNum, lastId, 15);
      setWords((prev) => [...prev, ...wordsRes.content]);
      setLastId(wordsRes.nextCursor);
      setHasNext(wordsRes.hasNext);
    } catch (e) {
      console.error("단어 추가 로드 실패", e);
      alert("단어를 더 불러오는 도중 오류가 발생했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      alert("단어장 제목을 입력해주세요.");
      return;
    }
    try {
      await updateWordBook(idNum, {
        title: editTitle,
        description: editDesc,
      });
      setWordBook((prev) => prev ? { ...prev, title: editTitle, description: editDesc } : null);
      setEditing(false);
    } catch (e) {
      alert("단어장 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 단어장을 삭제하시겠습니까?\n포함된 모든 단어 기록이 삭제됩니다.")) return;
    try {
      await deleteWordBook(idNum);
      alert("단어장이 삭제되었습니다.");
      navigate("/vocabulary");
    } catch (e) {
      alert("단어장 삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <div className="text-slate-500 dark:text-slate-400">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/vocabulary")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          단어장 목록으로 돌아가기
        </button>

        {/* 단어장 정보 카드 */}
        <header className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          {editing ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500">단어장 제목</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="h-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-blue-100"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500">단어장 설명</label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="단어장에 대한 설명을 입력하세요"
                  className="min-h-20 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-blue-100"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => { setEditing(false); setEditTitle(wordBook?.title || ""); setEditDesc(wordBook?.description || ""); }} className="rounded-lg">
                  <X className="h-4 w-4 mr-1" /> 취소
                </Button>
                <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Check className="h-4 w-4 mr-1" /> 저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-6 w-6 text-blue-500 shrink-0" />
                  <h1
                    className="text-slate-900 dark:text-white line-clamp-2"
                    style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em" }}
                  >
                    {wordBook?.title}
                  </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed mt-1">
                  {wordBook?.description || "등록된 설명이 없습니다."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                    단어 {wordBook?.wordCount}개
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {wordBook?.createdAt ? new Date(wordBook.createdAt).toLocaleDateString() : ""} 생성됨
                  </span>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-start">
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="rounded-lg h-9 text-slate-600 dark:text-slate-400"
                >
                  <Pencil className="h-4 w-4 mr-1" /> 수정
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="rounded-lg h-9 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> 삭제
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* 수록 단어 리스트 영역 */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">단어 목록</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">현재 조회된 단어 {words.length}개</span>
          </div>

          {words.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-62.5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 mb-4 shadow-inner">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "14px" }}>
                이 단어장에 저장된 단어가 없습니다.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-900">
              {words.map((item) => {
                const wordItem = item.urimalsaemItem ?? item.UrimalsaemItem;
                const word = wordItem?.word ?? "알 수 없음";
                const definition = wordItem?.definition ?? "뜻이 제공되지 않았습니다.";
                const pos = wordItem?.pos ?? "";
                const type = wordItem?.type ?? "";
                const link = wordItem?.link ?? "";

                return (
                  <li
                    key={item.wordBookWordId}
                    className="group flex flex-col gap-4 py-5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/20 sm:flex-row sm:items-start sm:justify-between px-2 sm:px-4 rounded-xl"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="text-slate-900 dark:text-white"
                            style={{
                              fontSize: "19px",
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
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition"
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
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                        <span>추가일: {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 더 보기 페이징 버튼 */}
          {hasNext && (
            <div className="mt-8 flex justify-center border-t border-slate-100 dark:border-slate-900 pt-6">
              <Button
                variant="outline"
                onClick={loadMoreWords}
                disabled={loadingMore}
                className="h-10 rounded-xl px-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              >
                {loadingMore ? "불러오는 중..." : "단어 더 보기"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default WordBookDetailPage;
