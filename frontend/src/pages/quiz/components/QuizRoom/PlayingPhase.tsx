import { Clock, Check, X, Loader2 } from "lucide-react";
import { StatusBadge } from "./ParticipantCard";
import type { ParticipantType } from "./ParticipantCard";

interface Vocab {
  word: string;
  meaning: string;
}

interface Quiz {
  sentence: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  vocab: Vocab[];
}

interface AnswerRecord {
  participantId: string;
  choiceIndex: number;
  correct: boolean;
}

interface PlayingPhaseProps {
  quiz: Quiz;
  quizzes: Quiz[];
  current: number;
  participants: ParticipantType[];
  scores: Record<string, number>;
  nextCountdown: number | null;
  myPicked: number | null;
  myAnswer: AnswerRecord | null;
  allAnswered: boolean;
  handleMyAnswer: (choiceIndex: number) => void;
}

// 퀴즈 문장 마크 파싱 헬퍼 함수
function parseSentence(text: string) {
  const regex = /\[\[(.+?)\]\]/g;
  const out: { type: "text" | "term"; value: string }[] = [];
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    out.push({ type: "term", value: m[1] });
    last = regex.lastIndex;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

export function PlayingPhase({
  quiz,
  quizzes,
  current,
  participants,
  scores,
  nextCountdown,
  myPicked,
  myAnswer,
  allAnswered,
  handleMyAnswer,
}: PlayingPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 실시간 참가자 상태 바 */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)]">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${p.color} text-white`}
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              {p.avatar}
            </div>
            <div className="flex flex-col">
              <span className="text-slate-700" style={{ fontSize: "12px", fontWeight: 600 }}>
                {p.isMe ? "나" : p.name}
              </span>
              <StatusBadge status={p.status} />
            </div>
            <span className="ml-1 text-slate-500" style={{ fontSize: "12px", fontWeight: 600 }}>
              {scores[p.id] ?? 0}점
            </span>
            {p !== participants[participants.length - 1] && (
              <div className="ml-1 h-4 w-px bg-slate-200" />
            )}
          </div>
        ))}
      </div>

      {/* 메인 퀴즈 카드 */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        {/* 진행 상황 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-slate-400" style={{ fontSize: "13px" }}>
            {current + 1} / {quizzes.length} 문제
          </span>
          {nextCountdown !== null && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <Clock className="h-3.5 w-3.5" />
              {nextCountdown}초 후 다음 문제
            </span>
          )}
        </div>

        <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((current + (myAnswer !== null ? 1 : 0)) / quizzes.length) * 100}%` }}
          />
        </div>

        {/* 문제 텍스트 */}
        <div>
          <span className="text-blue-500" style={{ fontSize: "13px", fontWeight: 600 }}>
            Q{current + 1}
          </span>
          <p
            className="mt-3 text-slate-800"
            style={{ fontSize: "22px", lineHeight: "1.7", fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {parseSentence(quiz.sentence).map((s, i) =>
              s.type === "term" ? (
                <span
                  key={i}
                  className="mx-0.5 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 align-baseline"
                >
                  {s.value}
                </span>
              ) : (
                <span key={i}>{s.value}</span>
              ),
            )}
          </p>
          <p className="mt-5 text-slate-500" style={{ fontSize: "15px" }}>
            {quiz.question}
          </p>
        </div>

        {/* 선택지 */}
        <div className="mt-6 flex flex-col gap-3">
          {quiz.choices.map((choice, idx) => {
            const isPicked = myPicked === idx;
            const showCorrect = myAnswer !== null && idx === quiz.answerIndex;
            const showWrong = isPicked && idx !== quiz.answerIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleMyAnswer(idx)}
                disabled={myAnswer !== null}
                className={`group flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition sm:px-5 ${
                  showCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : showWrong
                      ? "border-red-200 bg-red-50"
                      : isPicked
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                } ${myAnswer !== null ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    showCorrect
                      ? "bg-emerald-500 text-white"
                      : showWrong
                        ? "bg-red-500 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  {showCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : showWrong ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={`flex-1 ${
                    showCorrect ? "text-emerald-800" : showWrong ? "text-red-800" : "text-slate-700"
                  }`}
                  style={{ fontSize: "15px", lineHeight: "1.65" }}
                >
                  {choice}
                </span>
              </button>
            );
          })}
        </div>

        {/* 제출 결과 피드백 */}
        {myAnswer !== null && (
          <div
            className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
              myAnswer.correct ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
            }`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    myAnswer.correct ? "bg-emerald-500" : "bg-red-500"
                  } text-white`}
                >
                  {myAnswer.correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={myAnswer.correct ? "text-emerald-700" : "text-red-700"}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  {myAnswer.correct ? "정답입니다!" : "아쉬워요. 다시 살펴봐요."}
                </span>
              </div>
              {!allAnswered && (
                <span className="inline-flex items-center gap-1.5 text-slate-400" style={{ fontSize: "13px" }}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  다른 참가자 대기 중...
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  정답
                </span>
                <p className="mt-1 text-slate-800" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                  {quiz.choices[quiz.answerIndex]}
                </p>
              </div>
              <div>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  용어 설명
                </span>
                <ul className="mt-2 flex flex-col gap-2">
                  {quiz.vocab.map((v) => (
                    <li key={v.word} className="rounded-lg border border-white/70 bg-white/80 px-3.5 py-2.5">
                      <span className="text-blue-600" style={{ fontSize: "14px", fontWeight: 700 }}>
                        {v.word}
                      </span>
                      <span className="text-slate-600" style={{ fontSize: "14px" }}>
                        {" — "}
                        {v.meaning}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  해설
                </span>
                <p className="mt-1 text-slate-700" style={{ fontSize: "14px", lineHeight: "1.75" }}>
                  {quiz.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 미선택시 넛지 문구 */}
        {myAnswer === null && (
          <p className="mt-5 text-center text-slate-400" style={{ fontSize: "13px" }}>
            정답을 선택해 주세요
          </p>
        )}
      </section>
    </div>
  );
}
