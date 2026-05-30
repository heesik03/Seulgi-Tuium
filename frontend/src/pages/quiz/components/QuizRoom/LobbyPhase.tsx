import { Check, Sparkles, ArrowRight, Users } from "lucide-react";
import { Button } from "../../../../components/ui/button";

// Vocab 타입 인터페이스 정의
interface Vocab {
  word: string;
  meaning: string;
}

// LobbyPhase 컴포넌트 프롭스 인터페이스
interface LobbyPhaseProps {
  selectedWords: string[];
  toggleWord: (word: string) => void;
  roomTitle: string;
  setRoomTitle: (title: string) => void;
  quizCount: number;
  setQuizCount: (count: number) => void;
  handleCreateRoom: () => void;
  vocabBank: Vocab[];
  quizCountOptions: number[];
  quizBank: any[]; // 문제 은행 필터링 계산용
}

export function LobbyPhase({
  selectedWords,
  toggleWord,
  roomTitle,
  setRoomTitle,
  quizCount,
  setQuizCount,
  handleCreateRoom,
  vocabBank,
  quizCountOptions,
  quizBank,
}: LobbyPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 단어 선택 섹션 */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <h2 className="text-slate-900" style={{ fontSize: "16px", fontWeight: 600 }}>
            단어 선택
          </h2>
        </div>
        <p className="mb-5 text-slate-500" style={{ fontSize: "14px" }}>
          퀴즈에 사용할 어려운 단어를 하나 이상 선택하세요.
        </p>

        <div className="flex flex-wrap gap-2">
          {vocabBank.map((v) => {
            const active = selectedWords.includes(v.word);
            return (
              <button
                key={v.word}
                type="button"
                onClick={() => toggleWord(v.word)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                  active
                    ? "bg-blue-500 text-white shadow-[0_4px_12px_-4px_rgba(59,130,246,0.5)]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
                style={{ fontSize: "14px" }}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {v.word}
              </button>
            );
          })}
        </div>

        {selectedWords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selectedWords.map((w) => {
              const vocab = vocabBank.find((v) => v.word === w);
              return vocab ? (
                <div key={w} className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2">
                  <span className="text-blue-700" style={{ fontSize: "13px", fontWeight: 600 }}>
                    {vocab.word}
                  </span>
                  <span className="ml-1.5 text-slate-500" style={{ fontSize: "12px" }}>
                    {vocab.meaning}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </section>

      {/* 방 설정 섹션 */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h2 className="text-slate-900" style={{ fontSize: "16px", fontWeight: 600 }}>
            방 설정
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* 방 제목 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-600" style={{ fontSize: "14px", fontWeight: 500 }}>
              방 제목 <span className="text-slate-400" style={{ fontWeight: 400 }}>(선택)</span>
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="예: 헌법 단어 마스터"
              maxLength={30}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* 문제 수 설정 */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-600" style={{ fontSize: "14px", fontWeight: 500 }}>
              문제 수
            </label>
            <div className="flex gap-2">
              {quizCountOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuizCount(n)}
                  className={`rounded-xl border px-4 py-2 transition ${
                    quizCount === n
                      ? "border-blue-400 bg-blue-50 text-blue-700 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  {n}문제
                </button>
              ))}
            </div>
          </div>

          {/* 인원 정보 표시 */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600" style={{ fontSize: "14px" }}>
              최대 <strong className="text-slate-800">3명</strong>까지 참가할 수 있습니다.
            </span>
          </div>
        </div>
      </section>

      {/* 하단 생성 버튼 영역 */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400" style={{ fontSize: "13px" }}>
          {selectedWords.length === 0
            ? "단어를 하나 이상 선택해주세요."
            : `선택된 단어 ${selectedWords.length}개 · ${quizCount}문제 출제 예정`}
        </span>
        <Button
          onClick={handleCreateRoom}
          disabled={selectedWords.length === 0}
          className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600 disabled:opacity-60"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          퀴즈 방 생성하기
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
