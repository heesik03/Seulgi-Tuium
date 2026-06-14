import React, { useState, useEffect } from "react";
import { Search, UserPlus, Loader2, Check, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Button } from "../../../../components/ui/button";
import { axiosInstance } from "../../../../app/apiClient";

interface InviteUserPopoverProps {
  roomId: number;
}

interface UserSearchItem {
  id: number;
  name: string;
}

export function InviteUserPopover({ roomId }: InviteUserPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitingUsers, setInvitingUsers] = useState<Record<string, boolean>>({});
  const [invitedUsers, setInvitedUsers] = useState<Record<string, boolean>>({});

  // 디바운스를 활용한 실시간 사용자 검색 API 연동
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/user/search?name=${encodeURIComponent(trimmed)}`);
        setResults(response.data || []);
      } catch (err) {
        console.error("유저 검색 오류:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms 디바운스 적용

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isOpen]);

  const handleInvite = async (nickname: string) => {
    if (invitingUsers[nickname] || invitedUsers[nickname]) return;

    setInvitingUsers((prev) => ({ ...prev, [nickname]: true }));
    try {
      await axiosInstance.post("/api/game/invite", {
        receiverNickname: nickname,
        roomId: roomId,
      });
      setInvitedUsers((prev) => ({ ...prev, [nickname]: true }));
      // 3초 후 초대 성공 상태 표시 리셋
      setTimeout(() => {
        setInvitedUsers((prev) => ({ ...prev, [nickname]: false }));
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "초대 발송에 실패했습니다. 유저가 오프라인일 수 있습니다.";
      alert(msg);
    } finally {
      setInvitingUsers((prev) => ({ ...prev, [nickname]: false }));
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <UserPlus className="h-4 w-4 text-blue-500" />
          친구 초대하기
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white/95 dark:bg-slate-950/95 shadow-xl backdrop-blur-md z-50 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">친구 초대</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">함께 게임할 사용자의 이름을 검색하세요.</p>
        </div>

        {/* 검색 입력란 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="사용자 이름 입력..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden transition"
          />
        </div>

        {/* 검색 결과 영역 (ScrollArea 적용) */}
        <ScrollArea className="h-48 w-full rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 p-1">
          {loading ? (
            <div className="flex h-full items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <User className="h-5 w-5 text-slate-300 dark:text-slate-700 mb-1" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {searchQuery.trim() ? "검색 결과가 없습니다." : "이름을 입력해 검색하세요."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 pr-1.5">
              {results.map((user) => {
                const isInviting = invitingUsers[user.name];
                const isInvited = invitedUsers[user.name];
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800/60"
                  >
                    <div className="flex items-center gap-2 max-w-45">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-850 dark:text-slate-200 truncate">
                        {user.name}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleInvite(user.name)}
                      disabled={isInviting || isInvited}
                      className={`h-7 rounded-lg text-[11px] px-2.5 font-bold transition-all cursor-pointer ${
                        isInvited
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-xs"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-xs"
                      }`}
                    >
                      {isInviting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isInvited ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          초대됨
                        </span>
                      ) : (
                        "초대"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
