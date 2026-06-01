import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookmarkCheck, Check, Copy, History, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";


import { translateText, searchUrimalsaem } from "./api/analysisApi";
import { addFavoriteWord } from "../word/api/wordApi";
import type { UrimalsaemItem, AnalysisTranslateReq } from "./types/analysisType";

type TranslationResult = {
  text: string;
  aiDifficultWords: string[];
  komoranKeywords: string[];
  terms: UrimalsaemItem[];
};

const DEFAULT_INPUT = "헌법은 국민의 기본권을 보장한다.";

const MAX_CHARS = 1000;
const URIMALSAEM_MIN_SEARCH_COUNT = 10;

type Tone = "기본" | "어린이용" | "친근한 말투" | "공식 설명";

const TONES: { id: Tone; label: string }[] = [
  { id: "기본", label: "기본" },
  { id: "어린이용", label: "어린이용" },
  { id: "친근한 말투", label: "친근한 말투" },
  { id: "공식 설명", label: "공식 설명" },
];

const TONE_MAP: Record<Tone, AnalysisTranslateReq["tone"]> = {
  "기본": "DEFAULT",
  "어린이용": "CHILD",
  "친근한 말투": "FRIENDLY",
  "공식 설명": "OFFICIAL",
};

function parseSegments(text: string) {
  const regex = /\[\[(.+?)\]\]/g;
  const segments: { type: "text" | "term"; value: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "term", value: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

function uniqueWords(words: string[] = []) {
  return Array.from(new Set(words.map((word) => word.trim()).filter(Boolean)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseHighlightedWords(text: string, words: string[]) {
  const sortedWords = uniqueWords(words).sort((a, b) => b.length - a.length);
  if (sortedWords.length === 0) {
    return [{ type: "text" as const, value: text }];
  }

  const regex = new RegExp(`(${sortedWords.map(escapeRegExp).join("|")})`, "g");
  const segments: { type: "text" | "term"; value: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "term", value: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function TranslatorPage() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [tone, setTone] = useState<Tone>("기본");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<UrimalsaemItem | null>(null);
  const [showAllMorphWords, setShowAllMorphWords] = useState(false);
  const [loadingTerm, setLoadingTerm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  const charCount = input.length;

  const segments = useMemo(
    () => (result ? parseSegments(result.text) : []),
    [result],
  );

  const activeWords = useMemo(() => {
    if (!result) return [];
    return showAllMorphWords
      ? uniqueWords([...result.aiDifficultWords, ...result.komoranKeywords])
      : result.aiDifficultWords;
  }, [result, showAllMorphWords]);

  const difficultSentenceSegments = useMemo(
    () => (result ? parseHighlightedWords(input, activeWords) : []),
    [activeWords, input, result],
  );

  const plainResult = useMemo(
    () => (result ? result.text.replace(/\[\[(.+?)\]\]/g, "$1") : ""),
    [result],
  );

  const savableTerms = useMemo(
    () => (result ? result.terms.filter((term) => term.targetCode > 0) : []),
    [result],
  );

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setTranslating(true);
    try {
      const res = await translateText({ text: input, tone: TONE_MAP[tone] });
      
      const fetchedTerms: UrimalsaemItem[] = [];
      const aiDifficultWords = uniqueWords(res.aiDifficultWords);
      const komoranKeywords = uniqueWords(res.komoranKeywords);
      
      for (const word of aiDifficultWords) {
        try {
          const dictRes = await searchUrimalsaem({ q: word, num: URIMALSAEM_MIN_SEARCH_COUNT });
          if (dictRes.items && dictRes.items.length > 0) {
            fetchedTerms.push(dictRes.items[0]);
          }
        } catch (e) {
          console.error("Dictionary fetch error", e);
        }
      }

      const translatedResult = {
        text: res.convertedText,
        aiDifficultWords,
        komoranKeywords,
        terms: fetchedTerms,
      };

      setShowAllMorphWords(false);
      setResult(translatedResult);
      setSelectedTerm(fetchedTerms.length > 0 ? fetchedTerms[0] : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "번역 중 오류가 발생했습니다.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTerm || selectedTerm.targetCode <= 0) return;
    try {
      await addFavoriteWord({
        word: selectedTerm.word,
        targetCode: selectedTerm.targetCode,
        senseNo: selectedTerm.senseNo,
        definition: selectedTerm.definition,
        pos: selectedTerm.pos,
        link: selectedTerm.link,
        type: selectedTerm.type,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    }
  };

  const handleSaveHistory = () => {
    if (!result) return;
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 1800);
  };

  const handleSelectWord = async (word: string) => {
    if (!result) return;
    setSaved(false);
    const cachedTerm = result.terms.find((term) => term.word === word);

    if (cachedTerm) {
      setSelectedTerm(cachedTerm);
      return;
    }

    setLoadingTerm(word);
    try {
      const dictRes = await searchUrimalsaem({ q: word, num: URIMALSAEM_MIN_SEARCH_COUNT });
      const nextTerm = dictRes.items?.[0] ?? {
        word,
        definition: "한국어샘에서 설명을 찾을 수 없습니다.",
        targetCode: 0,
        senseNo: 0,
        pos: "",
        link: "",
        type: "",
      };

      setResult({
        ...result,
        terms: [...result.terms, nextTerm],
      });
      setSelectedTerm(nextTerm);
    } catch (e) {
      setSelectedTerm({
        word,
        definition: e instanceof Error ? e.message : "한국어샘 조회 중 오류가 발생했습니다.",
        targetCode: 0,
        senseNo: 0,
        pos: "",
        link: "",
        type: "",
      });
    } finally {
      setLoadingTerm(null);
    }
  };

  const handleCopy = async () => {
    if (!plainResult) return;
    try {
      await navigator.clipboard.writeText(plainResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Translator Card */}
        <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white" style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              쉬운 말 번역기
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              어려운 문장을 더 쉽게 이해할 수 있도록 도와드립니다.
            </p>
          </header>

          {/* Tone Selector */}
          <div className="mb-7 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px", fontWeight: 500 }}>번역 어투</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-500" style={{ fontSize: "11px" }}>
                {tone}
              </span>
            </div>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1 gap-1">
              {TONES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTone(id)}
                  className={`flex-1 rounded-lg px-2 py-2 text-center transition-all duration-150 ${
                    tone === id
                      ? "bg-white dark:bg-slate-950 text-blue-600 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-white dark:bg-slate-950/60"
                  }`}
                  style={{ fontSize: "13px", fontWeight: tone === id ? 600 : 400 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Original Input (full width) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">원문</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-slate-500 dark:text-slate-400" style={{ fontSize: "12px" }}>
                어려운 한국어
              </span>
            </div>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder="어려운 법률 문장이나 전문 용어가 포함된 문장을 입력하세요."
                className="min-h-50 resize-none border-0 bg-transparent px-5 py-4 text-slate-800 dark:text-slate-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: "16px", lineHeight: "1.7" }}
              />
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5">
                <button
                  type="button"
                  onClick={() => setInput(DEFAULT_INPUT)}
                  className="text-slate-400 transition hover:text-slate-600 dark:text-slate-400"
                  style={{ fontSize: "12px" }}
                >
                  예시 문장 넣기
                </button>
                <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
            </div>

            <Button
              onClick={handleTranslate}
              disabled={!input.trim() || translating}
              className="group h-12 w-full rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600 hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.7)] disabled:opacity-60"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {translating ? "번역 중..." : "쉬운 말로 번역하기"}
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
          </div>
        </section>

        {/* Unified Result & Terminology Container */}
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.06)]">
          <div className="grid h-auto lg:h-162.5 grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Translated Result (Left) */}
            <ScrollArea className="h-125 lg:h-full overflow-hidden">
              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                {result ? (
                  <Tabs defaultValue="easy" className="w-full flex-1 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                      <TabsList className="bg-slate-100 dark:bg-slate-900">
                        <TabsTrigger value="easy">쉬운 말 번역</TabsTrigger>
                        <TabsTrigger value="difficult">어려운 문장</TabsTrigger>
                      </TabsList>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300" style={{ fontSize: "12px" }}>
                        쉬운 한국어
                      </span>
                    </div>

                    {/* Tab 1: 쉬운 말 번역 */}
                    <TabsContent value="easy" className="mt-0 flex-1 flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px", fontWeight: 600 }}>
                          쉬운 말 번역
                        </span>
                        <p className="text-slate-800 dark:text-slate-200" style={{ fontSize: "18px", lineHeight: "1.85" }}>
                          {segments.length > 0
                            ? segments.map((seg, i) => <span key={`${seg.type}-${seg.value}-${i}`}>{seg.value}</span>)
                            : plainResult}
                        </p>
                      </div>
                    </TabsContent>

                    {/* Tab 2: 어려운 문장 (상단에 AI 단어 분석 배치) */}
                    <TabsContent value="difficult" className="mt-0 flex-1 flex flex-col gap-6">
                      {/* AI 단어 분석 (상단 배치) */}
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px", fontWeight: 600 }}>
                            AI가 고른 어려운 단어
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" style={{ fontSize: "12px" }}>
                            {result.aiDifficultWords.length}개
                          </span>
                        </div>
                        {result.aiDifficultWords.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.aiDifficultWords.map((word) => (
                              <button
                                key={word}
                                type="button"
                                onClick={() => handleSelectWord(word)}
                                className={`rounded-full px-3 py-1.5 transition ${
                                  selectedTerm?.word === word
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50 dark:bg-slate-950 dark:text-blue-300 dark:ring-blue-900/70"
                                }`}
                                style={{ fontSize: "13px", lineHeight: 1.2 }}
                              >
                                {loadingTerm === word ? "조회 중..." : word}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 dark:text-slate-500" style={{ fontSize: "14px" }}>
                            AI가 별도로 고른 어려운 단어가 없습니다.
                          </p>
                        )}
                      </div>

                      {/* 형태소 분석 단어 전체 표시 토글 */}
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                        <Checkbox
                          checked={showAllMorphWords}
                          onCheckedChange={(checked) => setShowAllMorphWords(checked === true)}
                          disabled={result.komoranKeywords.length === 0}
                        />
                        <span className="flex flex-col">
                          <span style={{ fontSize: "14px", fontWeight: 600 }}>
                            형태소 분석 단어 전체 표시
                          </span>
                          <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                            켜면 형태소 분석으로 추출한 {result.komoranKeywords.length}개 단어가 모두 눌러집니다.
                          </span>
                        </span>
                      </label>

                      {/* 어려운 문장 */}
                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "13px", fontWeight: 600 }}>
                          어려운 문장
                        </span>
                        <p className="text-slate-800 dark:text-slate-200" style={{ fontSize: "16px", lineHeight: "1.75" }}>
                          {difficultSentenceSegments.map((seg, i) =>
                            seg.type === "term" ? (
                              <button
                                key={`${seg.value}-${i}`}
                                type="button"
                                onClick={() => handleSelectWord(seg.value)}
                                className={`mx-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 align-baseline transition ${
                                  selectedTerm?.word === seg.value
                                    ? "bg-blue-500 text-white"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                                }`}
                              >
                                {loadingTerm === seg.value ? "조회 중..." : seg.value}
                              </button>
                            ) : (
                              <span key={`${seg.value}-${i}`}>{seg.value}</span>
                            ),
                          )}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
                          번역 결과
                        </h2>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600" style={{ fontSize: "12px" }}>
                        쉬운 한국어
                      </span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500">번역 결과가 여기에 표시됩니다.</p>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                    {result && activeWords.length > 0
                      ? `강조된 단어 ${activeWords.length}개`
                      : "강조된 단어가 없습니다"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!result}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-700 disabled:opacity-40"
                    style={{ fontSize: "13px" }}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" /> 복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> 결과 복사하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </ScrollArea>

            {/* Terminology Panel (Right) */}
            <ScrollArea className="h-100 lg:h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
              <div className="flex flex-col p-6 sm:p-8 lg:p-10 min-h-full">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
                    용어 설명
                  </h2>
                </div>
                <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                  강조된 단어를 클릭하세요
                </span>
              </div>

              <div className="flex flex-1 flex-col">
                {selectedTerm ? (
                  <div className="flex flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                        단어
                      </span>
                      <span className="text-blue-600" style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                        {selectedTerm.word}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                        뜻
                      </span>
                      <p className="text-slate-800 dark:text-slate-200" style={{ fontSize: "17px", lineHeight: "1.75" }}>
                        {selectedTerm.definition}
                      </p>
                    </div>
                    {selectedTerm.pos && (
                      <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
                        <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                          품사 및 정보
                        </span>
                        <div className="rounded-xl bg-white dark:bg-slate-950 p-5 border border-slate-100 shadow-sm">
                          <p className="text-slate-600 dark:text-slate-400" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                            {selectedTerm.pos} / {selectedTerm.type}
                          </p>
                          {selectedTerm.link && (
                            <a href={selectedTerm.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mt-2 block text-sm">
                              사전에서 보기
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                    <p style={{ fontSize: "15px" }}>
                      번역 결과의 강조된 단어를 클릭하면<br />이곳에 상세한 설명이 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
              </div>
            </ScrollArea>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-900/50 px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-1">
              <span className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px", fontWeight: 500 }}>
                나중에 다시 확인하기
              </span>
              <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                {result
                  ? "번역된 내용과 강조된 단어를 보관할 수 있습니다."
                  : "번역 후 기록을 저장할 수 있습니다."}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleSave}
                disabled={!selectedTerm || selectedTerm.targetCode <= 0}
                className={`h-11 rounded-xl border-0 px-6 text-white transition disabled:opacity-50 ${
                  saved
                    ? "bg-emerald-500 hover:bg-emerald-500 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)]"
                    : "bg-linear-to-r from-blue-600 to-blue-500 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.4)] hover:from-blue-700 hover:to-blue-600 hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)]"
                }`}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="mr-1.5 h-4 w-4" />
                    단어 즐겨찾기됨
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1.5 h-4 w-4" />
                    단어 즐겨찾기
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveHistory}
                disabled={!result}
                variant="outline"
                className={`h-11 rounded-xl px-6 transition disabled:opacity-40 ${
                  historySaved
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {historySaved ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    기록 저장됨
                  </>
                ) : (
                  <>
                    <History className="mr-1.5 h-4 w-4" />
                    번역 기록 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
