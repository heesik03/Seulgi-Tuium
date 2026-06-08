import { Sparkles, ArrowRight, Users } from "lucide-react";
import { Button } from "../../../../components/ui/button";

// GameLobbyPhase 컴포넌트 프롭스 인터페이스
interface GameLobbyPhaseProps {
  roomTitle: string;
  setRoomTitle: (title: string) => void;
  handleCreateRoom: (title: string) => Promise<number>;
}

export function GameLobbyPhase({
  roomTitle,
  setRoomTitle,
  handleCreateRoom,
}: GameLobbyPhaseProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 방 설정 섹션 */}
      <section className="rounded-3xl border border-slate-100 bg-white dark:bg-slate-950 p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
            새로운 게임방 만들기
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* 방 제목 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px", fontWeight: 500 }}>
              방 제목 <span className="text-slate-400 dark:text-slate-500" style={{ fontWeight: 400 }}>(선택)</span>
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="예: 헌법 단어 마스터"
              maxLength={30}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-100"
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* 인원 정보 표시 */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400" style={{ fontSize: "14px" }}>
              최대 <strong className="text-slate-800 dark:text-slate-200">3명</strong>까지 참가할 수 있으며, <strong className="text-slate-800 dark:text-slate-200">랜덤 4단어</strong>가 출제됩니다.
            </span>
          </div>
        </div>
      </section>

      {/* 하단 생성 버튼 영역 */}
      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => handleCreateRoom(roomTitle)}
          className="group h-11 rounded-xl border-0 bg-linear-to-r from-blue-500 to-emerald-500 px-6 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:from-blue-600 hover:to-emerald-600 disabled:opacity-60 cursor-pointer"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          퀴즈 방 생성하기
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

