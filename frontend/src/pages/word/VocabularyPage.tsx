import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Check, Pencil, Search, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/input";

type VocabItem = {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  savedAt: string;
};

const INITIAL_VOCAB: VocabItem[] = [
  {
    id: "1",
    word: "기본권",
    meaning: "사람이라면 누구나 기본적으로 누려야 하는 권리",
    example: "헌법은 국민의 기본권을 보장합니다.",
    savedAt: "2026-05-10",
  },
  {
    id: "2",
    word: "헌법",
    meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률",
    example: "대한민국 헌법은 국민의 자유와 권리를 보장합니다.",
    savedAt: "2026-05-09",
  },
  {
    id: "3",
    word: "보장",
    meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것",
    example: "법은 우리의 안전을 보장합니다.",
    savedAt: "2026-05-07",
  },
  {
    id: "4",
    word: "국민",
    meaning: "한 나라에 속해 있는 사람들",
    example: "모든 국민은 법 앞에 평등합니다.",
    savedAt: "2026-05-05",
  },
];

export function VocabularyPage() {
  const [items, setItems] = useState<VocabItem[]>(INITIAL_VOCAB);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [title, setTitle] = useState("나의 단어장");
  const [editingTitle, setEditingTitle] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter(
          (i) =>
            i.word.toLowerCase().includes(q) ||
            i.meaning.toLowerCase().includes(q),
        )
      : items;
    return [...list].sort((a, b) =>
      sortDesc
        ? b.savedAt.localeCompare(a.savedAt)
        : a.savedAt.localeCompare(b.savedAt),
    );
  }, [items, query, sortDesc]);

  const handleDelete = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

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
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-600 dark:text-slate-400"
            >
              {editingTitle ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

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
            <button
              type="button"
              onClick={() => setSortDesc((v) => !v)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white dark:text-white"
              style={{ fontSize: "13px" }}
            >
              {sortDesc ? "최신순" : "오래된순"}
            </button>
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
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    className="group flex flex-col gap-4 rounded-xl px-2 py-5 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50/60 sm:flex-row sm:items-start sm:justify-between sm:px-4"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <h3
                        className="text-slate-900 dark:text-white"
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.word}
                      </h3>
                      <p
                        className="text-slate-700 dark:text-slate-300"
                        style={{ fontSize: "15px", lineHeight: "1.7" }}
                      >
                        {item.meaning}
                      </p>
                      {item.example && (
                        <p
                          className="text-slate-400 dark:text-slate-500 italic"
                          style={{ fontSize: "13px", lineHeight: "1.7" }}
                        >
                          “{item.example}”
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <BookmarkCheck className="h-3.5 w-3.5 text-blue-500" />
                        <span style={{ fontSize: "12px" }}>{item.savedAt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label="단어 삭제"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-400 dark:text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                        style={{ fontSize: "12px" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
