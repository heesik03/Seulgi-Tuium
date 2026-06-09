import { useState, useEffect } from "react";
import { Clock, Check, X, Loader2, Send } from "lucide-react";
import { StatusBadge } from "./GameParticipantCard";
import type { GameQuiz, GameAnswerRecord, GameParticipantType } from "../../types/gameType";

interface GamePlayingPhaseProps {
  quiz: GameQuiz;
  quizzes: GameQuiz[];
  current: number;
  participants: GameParticipantType[];
  scores: Record<string, number>;
  nextCountdown: number | null;
  myAnswerText: string | null;
  myAnswer: GameAnswerRecord | null;
  questionAnswers: GameAnswerRecord[];
  allAnswered: boolean;
  handleMyAnswer: (answerText: string) => void;
}

export function GamePlayingPhase({
  quiz,
  quizzes,
  current,
  participants,
  scores,
  nextCountdown,
  myAnswerText,
  myAnswer,
  questionAnswers,
  allAnswered,
  handleMyAnswer,
}: GamePlayingPhaseProps) {
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);

  // 새로운 문제가 출제되면 입력창 및 타이머 초기화
  useEffect(() => {
    setInputText("");
    setTimeLeft(quiz.timeLimit);
  }, [quiz]);

  // 실시간 10초 타이머 카운트다운
  useEffect(() => {
    // 라운드 종료 카운트다운 중이거나, 남은 시간이 없으면 정지
    if (nextCountdown !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, nextCountdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || myAnswer?.correct || myAnswerText !== null) return;
    handleMyAnswer(inputText.trim());
  };

  // 정답을 맞힌 사람 찾기 (내 결과가 아닐 경우 상대방 정답 알림용)
  const correctAnswer = questionAnswers.find((a) => a.correct);
  const correctParticipant = correctAnswer ? participants.find((p) => p.id === correctAnswer.participantId) : null;
  const isOpponentCorrect = Boolean(correctParticipant && !correctParticipant.isMe);

  return (
    <div className="flex flex-col gap-5">
      {/* 실시간 참가자 상태 바 */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white dark:bg-slate-950 px-4 py-3 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)]">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${p.color} text-white`}
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              {p.avatar}
            </div>
            <div className="flex flex-col">
              <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: "12px", fontWeight: 600 }}>
                {p.isMe ? "나" : p.name}
              </span>
              <StatusBadge status={p.status} />
            </div>
            <span className="ml-1 text-slate-500 dark:text-slate-400" style={{ fontSize: "12px", fontWeight: 600 }}>
              {scores[p.id] ?? 0}점
            </span>
            {p !== participants[participants.length - 1] && (
              <div className="ml-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />
            )}
          </div>
        ))}
      </div>

      {/* 메인 퀴즈 카드 */}
      <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        {/* 진행 상황 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
            {current + 1} / {quizzes.length} 문제
          </span>
          {nextCountdown !== null ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-600 dark:text-slate-400"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <Clock className="h-3.5 w-3.5" />
              {nextCountdown}초 후 다음 문제
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                timeLeft <= 3
                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              }`}
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <Clock className="h-3.5 w-3.5" />
              남은 시간 {timeLeft}초
            </span>
          )}
        </div>

        <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((current + (myAnswer !== null ? 1 : 0)) / quizzes.length) * 100}%` }}
          />
        </div>

        {/* 문제 텍스트 */}
        <div className="flex flex-col items-center text-center mt-4">
          <span className="text-blue-500 mb-2" style={{ fontSize: "14px", fontWeight: 700 }}>
            단어의 뜻을 보고 알맞은 단어를 입력하세요.
          </span>
          <p
            className="mt-3 text-slate-800 dark:text-slate-200 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-full border border-slate-100 dark:border-slate-800"
            style={{ fontSize: "18px", lineHeight: "1.7", fontWeight: 600, letterSpacing: "-0.01em", wordBreak: "keep-all" }}
          >
            "{quiz.definition}"
          </p>

          <div className="mt-8 flex gap-2 justify-center">
            {Array.from({ length: quiz.length }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-14 border-b-4 border-slate-300 dark:border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300"
              >
                {/* 힌트 블록 */}
                _
              </div>
            ))}
          </div>
          <p className="mt-4 text-slate-400 dark:text-slate-500" style={{ fontSize: "14px", fontWeight: 500 }}>
            {quiz.length}글자
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="mt-10">
          <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={myAnswer?.correct === true || myAnswerText !== null || isOpponentCorrect || nextCountdown !== null}
              placeholder="정답을 입력하세요..."
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 pr-14 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 font-bold text-lg text-center"
              maxLength={quiz.length}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || myAnswer?.correct === true || myAnswerText !== null || isOpponentCorrect || nextCountdown !== null}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-blue-500 flex items-center justify-center text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
            >
              <Send className="h-5 w-5 ml-1" />
            </button>
          </form>
        </div>

        {/* 제출 결과 피드백 */}
        {(myAnswer !== null || isOpponentCorrect) && (
          <div
            className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
              myAnswer?.correct || isOpponentCorrect ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
            } w-full max-w-md mx-auto`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                  myAnswer?.correct || isOpponentCorrect ? "bg-emerald-500" : "bg-red-500"
                } text-white shadow-lg`}
              >
                {myAnswer?.correct || isOpponentCorrect ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
              </span>
              <span
                className={myAnswer?.correct || isOpponentCorrect ? "text-emerald-700" : "text-red-700"}
                style={{ fontSize: "18px", fontWeight: 700 }}
              >
                {myAnswer?.correct
                  ? "정답입니다!"
                  : isOpponentCorrect
                  ? `${correctParticipant?.name}님이 정답을 맞혔습니다!`
                  : "아쉽게도 틀렸습니다!"}
              </span>
              
              {myAnswer && (
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  내가 입력한 답: <strong className="text-slate-900 dark:text-white">{myAnswer.answerText}</strong>
                </span>
              )}

              {isOpponentCorrect && correctAnswer && (
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  정답: <strong className="text-slate-900 dark:text-white">{correctAnswer.answerText}</strong>
                </span>
              )}

              {!allAnswered && !myAnswer?.correct && !isOpponentCorrect && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500" style={{ fontSize: "13px" }}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  다른 참가자 대기 중...
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
