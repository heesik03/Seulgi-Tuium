export interface ParticipantType {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  status: "waiting" | "ready" | "answering" | "submitted" | "correct" | "wrong";
  isMe: boolean;
}

interface StatusBadgeProps {
  status: ParticipantType["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<ParticipantType["status"], { label: string; cls: string }> = {
    waiting: { label: "대기 중", cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" },
    ready: { label: "준비 완료", cls: "bg-emerald-50 text-emerald-600" },
    answering: { label: "문제 풀이 중", cls: "bg-blue-50 text-blue-600" },
    submitted: { label: "정답 제출 완료", cls: "bg-violet-50 text-violet-600" },
    correct: { label: "정답", cls: "bg-emerald-50 text-emerald-600" },
    wrong: { label: "오답", cls: "bg-red-50 text-red-600" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 ${cls}`}
      style={{ fontSize: "11px", fontWeight: 600 }}
    >
      {status === "answering" && (
        <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
      )}
      {label}
    </span>
  );
}

interface ParticipantCardProps {
  p: ParticipantType;
  showScore?: boolean;
}

export function ParticipantCard({ p, showScore }: ParticipantCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${
        p.isMe ? "border-blue-200 bg-blue-50/50 shadow-sm" : "border-slate-100 bg-white dark:bg-slate-950"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${p.color} text-white shadow-sm`}
        style={{ fontSize: "13px", fontWeight: 700 }}
      >
        {p.avatar}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-slate-800 dark:text-slate-200" style={{ fontSize: "14px", fontWeight: 600 }}>
            {p.name}
          </span>
          {p.isMe && (
            <span
              className="shrink-0 rounded-full bg-blue-100 px-1.5 py-px text-blue-600 font-bold"
              style={{ fontSize: "10px" }}
            >
              나
            </span>
          )}
        </div>
        <StatusBadge status={p.status} />
      </div>
      {showScore && (
        <span className="shrink-0 text-slate-700 dark:text-slate-300 font-bold" style={{ fontSize: "15px" }}>
          {p.score}점
        </span>
      )}
    </div>
  );
}
