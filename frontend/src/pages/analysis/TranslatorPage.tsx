import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookmarkCheck, Check, Copy, History, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";


type Term = {
  word: string;
  meaning: string;
  example?: string;
};

type TranslationResult = {
  text: string;
  terms: Term[];
};

const SAMPLE_DICTIONARY: Record<string, Term> = {
  "헌법": {
    word: "헌법",
    meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률입니다.",
    example: "대한민국 헌법은 국민의 자유와 권리를 보장합니다.",
  },
  "기본권": {
    word: "기본권",
    meaning: "사람이라면 누구나 기본적으로 누려야 하는 권리입니다.",
    example: "표현의 자유는 헌법이 보장하는 기본권 중 하나입니다.",
  },
  "보장": {
    word: "보장",
    meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것을 뜻합니다.",
    example: "법은 우리의 안전을 보장합니다.",
  },
  "국민": {
    word: "국민",
    meaning: "한 나라에 속해 있는 사람들을 말합니다.",
    example: "모든 국민은 법 앞에 평등합니다.",
  },
};

const DEFAULT_INPUT = "헌법은 국민의 기본권을 보장한다.";
const DEFAULT_RESULT: TranslationResult = {
  text: "국민이 기본적으로 누려야 하는 권리를 나라의 [[기본권]]으로서 [[헌법]]이 [[보장]]해 준다는 뜻입니다.",
  terms: [SAMPLE_DICTIONARY["기본권"], SAMPLE_DICTIONARY["헌법"], SAMPLE_DICTIONARY["보장"]],
};

const MAX_CHARS = 1000;

type Tone = "기본" | "어린이용" | "친근한 말투" | "공식 설명";

const TONES: { id: Tone; label: string }[] = [
  { id: "기본", label: "기본" },
  { id: "어린이용", label: "어린이용" },
  { id: "친근한 말투", label: "친근한 말투" },
  { id: "공식 설명", label: "공식 설명" },
];

const TONE_RESULTS: Record<Tone, TranslationResult> = {
  "기본": {
    text: "국민이 기본적으로 누려야 하는 권리를 나라의 [[기본권]]으로서 [[헌법]]이 [[보장]]해 준다는 뜻입니다.",
    terms: [SAMPLE_DICTIONARY["기본권"], SAMPLE_DICTIONARY["헌법"], SAMPLE_DICTIONARY["보장"]],
  },
  "어린이용": {
    text: "우리나라에는 모든 사람이 지켜야 하는 가장 중요한 약속인 [[헌법]]이 있어요. 이 약속에는 모든 어린이와 어른이 마땅히 누려야 할 권리, 즉 [[기본권]]이 적혀 있고, 나라가 이를 꼭 지켜주도록 [[보장]]하고 있답니다.",
    terms: [SAMPLE_DICTIONARY["헌법"], SAMPLE_DICTIONARY["기본권"], SAMPLE_DICTIONARY["보장"]],
  },
  "친근한 말투": {
    text: "쉽게 말하면, [[헌법]]은 우리가 당연히 누려야 할 권리([[기본권]])를 나라가 꼭 지켜주겠다고 [[보장]]하는 가장 높은 법이에요. 즉, 국민 모두의 기본적인 권리를 나라가 책임지고 보호해 준다는 이야기예요.",
    terms: [SAMPLE_DICTIONARY["헌법"], SAMPLE_DICTIONARY["기본권"], SAMPLE_DICTIONARY["보장"]],
  },
  "공식 설명": {
    text: "대한민국 [[헌법]]은 모든 [[국민]]이 인간으로서 당연히 갖는 [[기본권]]을 국가 최고 규범으로서 [[보장]]함을 천명합니다. 국가는 이 헌법적 권리가 실질적으로 구현될 수 있도록 적극적 의무를 부담합니다.",
    terms: [SAMPLE_DICTIONARY["헌법"], SAMPLE_DICTIONARY["국민"], SAMPLE_DICTIONARY["기본권"], SAMPLE_DICTIONARY["보장"]],
  },
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

export function TranslatorPage() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [tone, setTone] = useState<Tone>("기본");
  const [result, setResult] = useState<TranslationResult | null>(DEFAULT_RESULT);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(SAMPLE_DICTIONARY["기본권"]);
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  const charCount = input.length;

  const segments = useMemo(
    () => (result ? parseSegments(result.text) : []),
    [result],
  );

  const plainResult = useMemo(
    () => (result ? result.text.replace(/\[\[(.+?)\]\]/g, "$1") : ""),
    [result],
  );

  const handleTranslate = () => {
    if (!input.trim()) return;
    setTranslating(true);
    setTimeout(() => {
      const matched: Term[] = [];
      Object.keys(SAMPLE_DICTIONARY).forEach((key) => {
        if (input.includes(key)) matched.push(SAMPLE_DICTIONARY[key]);
      });

      let translated: TranslationResult;
      if (input.trim() === DEFAULT_INPUT) {
        translated = TONE_RESULTS[tone];
      } else if (matched.length > 0) {
        const termList = matched
          .map((t) => `[[${t.word}]]`)
          .join(", ");

        const tonePrefix: Record<Tone, string> = {
          "기본": `입력하신 문장에는 ${termList}와 같은 어려운 표현이 포함되어 있습니다. 쉽게 풀어 설명하면, 일상에서 누구나 이해할 수 있는 말로 같은 의미를 전달한다는 뜻입니다.`,
          "어린이용": `이 문장에는 ${termList} 같은 어려운 낱말이 있어요. 쉽게 말하면, 모든 사람이 알아들을 수 있는 표현으로 같은 내용을 전하는 거예요!`,
          "친근한 말투": `이 문장 안에 ${termList} 같은 좀 어려운 표현들이 있는데요, 결국 누구나 쉽게 이해할 수 있는 말로 같은 의미를 전달한다는 뜻이에요.`,
          "공식 설명": `본 문장은 ${termList} 등의 전문 용어를 포함하며, 이를 일반 어휘로 환언하면 동일한 의미를 보다 보편적으로 전달할 수 있습니다.`,
        };

        translated = {
          text: tonePrefix[tone],
          terms: matched,
        };
      } else {
        const toneGeneric: Record<Tone, string> = {
          "기본": "입력하신 문장을 더 쉬운 표현으로 풀어드렸습니다. (예시 응답입니다.)",
          "어린이용": "입력하신 문장을 어린이도 알아들을 수 있게 바꿔 봤어요! (예시 응답이에요.)",
          "친근한 말투": "입력하신 문장을 좀 더 편하고 쉬운 말로 바꿔봤어요~ (예시 응답이에요.)",
          "공식 설명": "입력하신 문장을 명확하고 이해하기 쉬운 표현으로 재서술하였습니다. (예시 응답입니다.)",
        };
        translated = {
          text: toneGeneric[tone],
          terms: [],
        };
      }

      setResult(translated);
      setSelectedTerm(translated.terms[0] ?? null);
      setTranslating(false);
    }, 500);
  };

  const handleSave = () => {
    if (!result || result.terms.length === 0) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleSaveHistory = () => {
    if (!result) return;
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 1800);
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Translator Card */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-2">
            <h1 className="text-slate-900" style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              쉬운 말 번역기
            </h1>
            <p className="text-slate-500">
              어려운 문장을 더 쉽게 이해할 수 있도록 도와드립니다.
            </p>
          </header>

          {/* Tone Selector */}
          <div className="mb-7 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-600" style={{ fontSize: "14px", fontWeight: 500 }}>번역 어투</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-500" style={{ fontSize: "11px" }}>
                {tone}
              </span>
            </div>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 gap-1">
              {TONES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTone(id)}
                  className={`flex-1 rounded-lg px-2 py-2 text-center transition-all duration-150 ${
                    tone === id
                      ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
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
              <span className="text-slate-600">원문</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-500" style={{ fontSize: "12px" }}>
                어려운 한국어
              </span>
            </div>
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder="어려운 법률 문장이나 전문 용어가 포함된 문장을 입력하세요."
                className="min-h-50 resize-none border-0 bg-transparent px-5 py-4 text-slate-800 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: "16px", lineHeight: "1.7" }}
              />
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5">
                <button
                  type="button"
                  onClick={() => setInput(DEFAULT_INPUT)}
                  className="text-slate-400 transition hover:text-slate-600"
                  style={{ fontSize: "12px" }}
                >
                  예시 문장 넣기
                </button>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
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
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.06)]">
          <div className="grid min-h-150 grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Translated Result (Left) */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <h2 className="text-slate-900" style={{ fontSize: "16px", fontWeight: 600 }}>
                    번역 결과
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600" style={{ fontSize: "12px" }}>
                  쉬운 한국어
                </span>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex-1 text-slate-800" style={{ fontSize: "18px", lineHeight: "1.85" }}>
                  {result ? (
                    <p>
                      {segments.map((seg, i) =>
                        seg.type === "term" ? (
                          <button
                            key={i}
                            onClick={() =>
                              setSelectedTerm(SAMPLE_DICTIONARY[seg.value] ?? { word: seg.value, meaning: "설명을 준비 중입니다." })
                            }
                            className={`mx-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 align-baseline transition ${
                              selectedTerm?.word === seg.value
                                ? "bg-blue-500 text-white"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            {seg.value}
                          </button>
                        ) : (
                          <span key={i}>{seg.value}</span>
                        ),
                      )}
                    </p>
                  ) : (
                    <p className="text-slate-400">번역 결과가 여기에 표시됩니다.</p>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <span className="text-slate-400" style={{ fontSize: "13px" }}>
                    {result?.terms.length
                      ? `어려운 표현 ${result.terms.length}개를 강조했어요`
                      : "강조된 단어가 없습니다"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!result}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
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
            </div>

            {/* Terminology Panel (Right) */}
            <div className="flex flex-col bg-slate-50/30 p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h2 className="text-slate-900" style={{ fontSize: "16px", fontWeight: 600 }}>
                    용어 설명
                  </h2>
                </div>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  강조된 단어를 클릭하세요
                </span>
              </div>

              <div className="flex flex-1 flex-col">
                {selectedTerm ? (
                  <div className="flex flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-slate-400" style={{ fontSize: "13px" }}>
                        단어
                      </span>
                      <span className="text-blue-600" style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                        {selectedTerm.word}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-slate-400" style={{ fontSize: "13px" }}>
                        뜻
                      </span>
                      <p className="text-slate-800" style={{ fontSize: "17px", lineHeight: "1.75" }}>
                        {selectedTerm.meaning}
                      </p>
                    </div>
                    {selectedTerm.example && (
                      <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-6">
                        <span className="text-slate-400" style={{ fontSize: "13px" }}>
                          사용 예시
                        </span>
                        <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm">
                          <p className="text-slate-600 italic" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                            “{selectedTerm.example}”
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-slate-400">
                    <p style={{ fontSize: "15px" }}>
                      번역 결과의 강조된 단어를 클릭하면<br />이곳에 상세한 설명이 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/40 px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-1">
              <span className="text-slate-600" style={{ fontSize: "14px", fontWeight: 500 }}>
                나중에 다시 확인하기
              </span>
              <span className="text-slate-400" style={{ fontSize: "12px" }}>
                {result
                  ? "번역된 내용과 강조된 단어를 보관할 수 있습니다."
                  : "번역 후 기록을 저장할 수 있습니다."}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleSave}
                disabled={!result || result.terms.length === 0}
                className={`h-11 rounded-xl border-0 px-6 text-white transition disabled:opacity-50 ${
                  saved
                    ? "bg-emerald-500 hover:bg-emerald-500 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)]"
                    : "bg-linear-to-r from-blue-600 to-blue-500 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.4)] hover:from-blue-700 hover:to-blue-600 hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)]"
                }`}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="mr-1.5 h-4 w-4" />
                    단어장에 저장됨
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1.5 h-4 w-4" />
                    단어장에 저장
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
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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