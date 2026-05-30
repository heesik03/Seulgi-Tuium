import { useCallback, useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";
import type { ParticipantType } from "./components/QuizRoom/ParticipantCard";
import { LobbyPhase } from "./components/QuizRoom/LobbyPhase";
import { WaitingPhase } from "./components/QuizRoom/WaitingPhase";
import { PlayingPhase } from "./components/QuizRoom/PlayingPhase";
import { ResultsPhase } from "./components/QuizRoom/ResultsPhase";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "lobby" | "waiting" | "playing" | "results";

type Vocab = { word: string; meaning: string };

type Quiz = {
  sentence: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  vocab: Vocab[];
};

type AnswerRecord = {
  participantId: string;
  choiceIndex: number;
  correct: boolean;
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const VOCAB_BANK: Vocab[] = [
  { word: "헌법", meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률" },
  { word: "기본권", meaning: "사람이라면 누구나 누려야 하는 기본적인 권리" },
  { word: "보장", meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것" },
  { word: "국민", meaning: "한 나라에 속해 있는 사람들" },
  { word: "행정", meaning: "법에 따라 나라의 일을 처리하고 운영하는 활동" },
  { word: "입법", meaning: "법을 만드는 활동이나 일" },
  { word: "사법", meaning: "법에 따라 옳고 그름을 판단하는 재판 활동" },
  { word: "조례", meaning: "지방 자치 단체가 만드는 법률 아래의 규칙" },
];

const QUIZ_BANK: Quiz[] = [
  {
    sentence: "[[헌법]]은 [[국민]]의 [[기본권]]을 [[보장]]한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "국민이 세금을 내야 한다는 뜻",
      "국민의 권리를 법이 지켜준다는 뜻",
      "법원이 새로운 법을 만든다는 뜻",
      "국민이 선거를 해야 한다는 뜻",
    ],
    answerIndex: 1,
    explanation: "“기본권”은 국민의 권리를 뜻하고, “보장”은 지켜준다는 의미입니다.",
    vocab: [
      { word: "헌법", meaning: "한 나라를 운영하는 가장 기본이 되는 최고의 법률" },
      { word: "기본권", meaning: "사람이라면 누구나 누려야 하는 기본적인 권리" },
      { word: "보장", meaning: "어떤 일이 잘 이루어지도록 책임지고 지켜주는 것" },
    ],
  },
  {
    sentence: "[[입법]] 기관은 새로운 법을 만들고 고치는 일을 한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "법을 집행하는 기관에 대한 설명",
      "재판을 진행하는 기관에 대한 설명",
      "법을 만들고 개정하는 기관에 대한 설명",
      "세금을 걷는 기관에 대한 설명",
    ],
    answerIndex: 2,
    explanation: '“입법”은 법을 만드는 활동을 뜻하므로, 법을 새로 만들거나 고치는 기관을 설명한 문장입니다.',
    vocab: [{ word: "입법", meaning: "법을 만드는 활동이나 일" }],
  },
  {
    sentence: "[[행정]] 기관은 [[국민]]에게 필요한 서비스를 제공한다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "법을 만드는 기관이 시민에게 서비스를 한다",
      "나라 살림을 맡은 기관이 사람들에게 필요한 서비스를 준다",
      "재판소가 시민의 분쟁을 해결한다",
      "기업이 시민에게 물건을 판다",
    ],
    answerIndex: 1,
    explanation: '“행정”은 법에 따라 나라의 일을 처리하는 활동입니다. 행정 기관은 공공 서비스를 제공하는 역할을 합니다.',
    vocab: [
      { word: "행정", meaning: "법에 따라 나라의 일을 처리하고 운영하는 활동" },
      { word: "국민", meaning: "한 나라에 속해 있는 사람들" },
    ],
  },
  {
    sentence: "[[사법]] 기관은 법에 따라 분쟁을 해결하고 판결을 내린다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "나라 돈을 관리하는 기관에 대한 설명",
      "법을 새로 만드는 기관에 대한 설명",
      "재판을 통해 옳고 그름을 가리는 기관에 대한 설명",
      "공공 서비스를 제공하는 기관에 대한 설명",
    ],
    answerIndex: 2,
    explanation: '“사법”은 법에 따라 재판을 진행하고 판결하는 활동을 뜻합니다.',
    vocab: [{ word: "사법", meaning: "법에 따라 옳고 그름을 판단하는 재판 활동" }],
  },
  {
    sentence: "지방의회는 해당 지역의 [[조례]]를 제정하고 개정할 권한을 가진다.",
    question: "다음 문장의 뜻으로 가장 적절한 것은?",
    choices: [
      "지방의회가 국가 헌법을 바꿀 수 있다는 뜻",
      "지방의회가 그 지역만의 규칙을 만들고 고칠 수 있다는 뜻",
      "지방의회가 세금을 걷는 권한을 가진다는 뜻",
      "지방의회가 재판을 진행할 수 있다는 뜻",
    ],
    answerIndex: 1,
    explanation: '“조례”는 지방 자치 단체가 만드는 규칙이며, 지방의회가 이를 만들고 고치는 권한을 갖습니다.',
    vocab: [{ word: "조례", meaning: "지방 자치 단체가 만드는 법률 아래의 규칙" }],
  },
];

const INITIAL_PARTICIPANTS: ParticipantType[] = [
  { id: "me", name: "나", avatar: "나", color: "bg-blue-500", score: 0, status: "ready", isMe: true },
  { id: "p2", name: "김민준", avatar: "김", color: "bg-emerald-500", score: 0, status: "waiting", isMe: false },
  { id: "p3", name: "이서연", avatar: "이", color: "bg-violet-500", score: 0, status: "waiting", isMe: false },
];

const QUIZ_COUNT_OPTIONS = [3, 5, 10];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuizRoomPage() {
  // ── Global phase state
  const [phase, setPhase] = useState<Phase>("lobby");

  // ── Lobby state
  const [selectedWords, setSelectedWords] = useState<string[]>(["헌법", "기본권"]);
  const [quizCount, setQuizCount] = useState(5);
  const [roomTitle, setRoomTitle] = useState("");

  // ── Waiting state
  const [participants, setParticipants] = useState<ParticipantType[]>(
    INITIAL_PARTICIPANTS.map((p) => ({ ...p })),
  );

  // ── Playing state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [current, setCurrent] = useState(0);
  const [myPicked, setMyPicked] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // We track per-question answers separately
  const [questionAnswers, setQuestionAnswers] = useState<AnswerRecord[]>([]);
  const myAnswer = questionAnswers.find((a) => a.participantId === "me") ?? null;
  const allAnswered = questionAnswers.length === participants.length;

  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  // ── Score tracking across questions
  const [scores, setScores] = useState<Record<string, number>>({ me: 0, p2: 0, p3: 0 });

  // ─── Lobby Handlers ─────────────────────────────────────────────────────────

  const toggleWord = (w: string) =>
    setSelectedWords((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));

  const handleCreateRoom = () => {
    setParticipants(INITIAL_PARTICIPANTS.map((p) => ({ ...p })));
    setScores({ me: 0, p2: 0, p3: 0 });
    setPhase("waiting");

    // Simulate opponents becoming ready over time
    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === "p2" ? { ...p, status: "ready" } : p)),
      );
    }, 1800);
    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === "p3" ? { ...p, status: "ready" } : p)),
      );
    }, 3200);
  };

  // ─── Waiting Handlers ────────────────────────────────────────────────────────

  const handleStartQuiz = useCallback(() => {
    const filtered = QUIZ_BANK.filter((q) =>
      q.vocab.some((v) => selectedWords.includes(v.word)),
    );
    const pool = filtered.length >= quizCount ? shuffle(filtered).slice(0, quizCount) : shuffle([...QUIZ_BANK]).slice(0, quizCount);
    setQuizzes(pool);
    setCurrent(0);
    setMyPicked(null);
    setQuestionAnswers([]);
    setNextCountdown(null);
    setParticipants((prev) => prev.map((p) => ({ ...p, status: "answering", score: 0 })));
    setScores({ me: 0, p2: 0, p3: 0 });
    setPhase("playing");
  }, [selectedWords, quizCount]);

  // ─── Playing Handlers ────────────────────────────────────────────────────────

  const advanceQuestion = useCallback(
    (currentIdx: number, updatedScores: Record<string, number>) => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= quizzes.length) {
        // End of quiz — show results
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, score: updatedScores[p.id] ?? 0, status: "ready" })),
        );
        setPhase("results");
      } else {
        setCurrent(nextIdx);
        setMyPicked(null);
        setQuestionAnswers([]);
        setNextCountdown(null);
        setParticipants((prev) => prev.map((p) => ({ ...p, status: "answering" })));
      }
    },
    [quizzes.length],
  );

  // Simulate opponents answering (called when quiz changes)
  useEffect(() => {
    if (phase !== "playing" || quizzes.length === 0) return;

    const quiz = quizzes[current];
    if (!quiz) return;

    // Clear old timers
    if (timerRef.current) clearTimeout(timerRef.current);

    const opponentIds = ["p2", "p3"];
    const delays = [1800 + Math.random() * 1500, 2400 + Math.random() * 2000];

    opponentIds.forEach((id, i) => {
      timerRef.current = setTimeout(() => {
        const isCorrect = Math.random() > 0.35;
        const choiceIndex = isCorrect
          ? quiz.answerIndex
          : (() => {
              const wrong = quiz.choices
                .map((_, idx) => idx)
                .filter((idx) => idx !== quiz.answerIndex);
              return wrong[Math.floor(Math.random() * wrong.length)];
            })();

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: isCorrect ? "correct" : "wrong" } : p,
          ),
        );
        setScores((prev) => {
          const next = { ...prev };
          if (isCorrect) next[id] = (next[id] ?? 0) + 1;
          return next;
        });
        setQuestionAnswers((prev) => [...prev, { participantId: id, choiceIndex, correct: isCorrect }]);
      }, delays[i]);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, current, quizzes]);

  // When all answered, start countdown to next question
  useEffect(() => {
    if (!allAnswered || phase !== "playing") return;

    const updatedScores = { ...scores };
    let countdown = 3;
    setNextCountdown(countdown);

    countdownRef.current = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(countdownRef.current!);
        setNextCountdown(null);
        advanceQuestion(current, updatedScores);
      } else {
        setNextCountdown(countdown);
      }
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [allAnswered, phase, current, scores, advanceQuestion]);

  const handleMyAnswer = (choiceIndex: number) => {
    if (myAnswer !== null) return;
    const quiz = quizzes[current];
    if (!quiz) return;

    const correct = choiceIndex === quiz.answerIndex;
    setMyPicked(choiceIndex);
    setParticipants((prev) =>
      prev.map((p) => (p.isMe ? { ...p, status: correct ? "correct" : "wrong" } : p)),
    );
    setScores((prev) => {
      const next = { ...prev };
      if (correct) next["me"] = (next["me"] ?? 0) + 1;
      return next;
    });
    setQuestionAnswers((prev) => [...prev, { participantId: "me", choiceIndex, correct }]);
  };

  // ─── Results Handlers ────────────────────────────────────────────────────────

  const rankedParticipants = [...participants]
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const handleRestart = () => {
    setPhase("lobby");
    setSelectedWords(["헌법", "기본권"]);
    setQuizCount(5);
    setRoomTitle("");
    setQuizzes([]);
    setCurrent(0);
    setMyPicked(null);
    setQuestionAnswers([]);
    setNextCountdown(null);
    setScores({ me: 0, p2: 0, p3: 0 });
    setParticipants(INITIAL_PARTICIPANTS.map((p) => ({ ...p })));
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* ── Page Heading ── */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1
              className="text-slate-900"
              style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              실시간 퀴즈 방
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-600" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Users className="h-3.5 w-3.5" />
              최대 3명
            </span>
          </div>
          <p className="text-slate-500">
            단어를 선택하고 친구들과 함께 문제를 풀어보세요.
          </p>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 1 · LOBBY
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "lobby" && (
          <LobbyPhase
            selectedWords={selectedWords}
            toggleWord={toggleWord}
            roomTitle={roomTitle}
            setRoomTitle={setRoomTitle}
            quizCount={quizCount}
            setQuizCount={setQuizCount}
            handleCreateRoom={handleCreateRoom}
            vocabBank={VOCAB_BANK}
            quizCountOptions={QUIZ_COUNT_OPTIONS}
            quizBank={QUIZ_BANK}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 2 · WAITING ROOM
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "waiting" && (
          <WaitingPhase
            selectedWords={selectedWords}
            roomTitle={roomTitle}
            quizCount={quizCount}
            participants={participants}
            handleStartQuiz={handleStartQuiz}
            setPhase={setPhase}
            vocabBank={VOCAB_BANK}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 3 · PLAYING
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "playing" && quizzes[current] && (
          <PlayingPhase
            quiz={quizzes[current]}
            quizzes={quizzes}
            current={current}
            participants={participants}
            scores={scores}
            nextCountdown={nextCountdown}
            myPicked={myPicked}
            myAnswer={myAnswer}
            allAnswered={allAnswered}
            handleMyAnswer={handleMyAnswer}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 4 · RESULTS
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "results" && (
          <ResultsPhase
            rankedParticipants={rankedParticipants}
            quizzes={quizzes}
            handleRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
