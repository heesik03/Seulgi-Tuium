type Difficulty = "easy" | "normal" | "hard";

interface InputPhaseProps {
  inputText: string;
  setInputText: (text: string) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  handleStart: () => void;
  difficultyLabels: Record<Difficulty, string>;
  difficultyDesc: Record<Difficulty, string>;
}

export function InputPhase({
  inputText,
  setInputText,
  difficulty,
  setDifficulty,
  handleStart,
  difficultyLabels,
  difficultyDesc,
}: InputPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-slate-800" style={{ fontSize: "15px", fontWeight: 600 }}>
            훈련할 텍스트
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="읽기 훈련을 시작할 문장을 입력하세요."
            rows={7}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            style={{ fontSize: "15px", lineHeight: "1.8" }}
          />
          <span className="absolute bottom-3 right-4 text-slate-400" style={{ fontSize: "12px" }}>
            {inputText.length} / 1000
          </span>
        </div>

        {/* 난이도 설정 */}
        <div className="mt-6 flex flex-col gap-3">
          <span className="text-slate-700" style={{ fontSize: "14px", fontWeight: 600 }}>
            훈련 난이도
          </span>
          <div className="flex flex-wrap gap-2">
            {(["easy", "normal", "hard"] as Difficulty[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDifficulty(opt)}
                className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition ${
                  difficulty === opt
                    ? "border-blue-400 bg-blue-50 shadow-[0_0_0_2px_rgba(59,130,246,0.12)]"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                }`}
                style={{ minWidth: "96px" }}
              >
                <span
                  className={difficulty === opt ? "text-blue-700" : "text-slate-700"}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  {difficultyLabels[opt]}
                </span>
                <span
                  className={difficulty === opt ? "text-blue-500" : "text-slate-400"}
                  style={{ fontSize: "12px", marginTop: "2px" }}
                >
                  {difficultyDesc[opt]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={inputText.trim().length === 0}
          className="mt-6 w-full h-12 rounded-xl text-white bg-linear-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontSize: "15px", fontWeight: 600 }}
        >
          읽기 훈련 시작
        </button>
      </section>

      {/* 정보 바 */}
      <div className="flex flex-wrap gap-6 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)]">
        {[
          { label: "단계별 읽기", desc: "긴 글을 작은 단위로 분해" },
          { label: "키워드 강조", desc: "핵심 개념을 노란 하이라이트로 표시" },
          { label: "이해도 확인", desc: "읽기 완료 후 퀴즈로 점검" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-slate-800" style={{ fontSize: "13px", fontWeight: 600 }}>
              {item.label}
            </span>
            <span className="text-slate-400" style={{ fontSize: "12px" }}>
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
