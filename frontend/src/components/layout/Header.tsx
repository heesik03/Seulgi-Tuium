import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Moon, Sun, Sparkles, User, LogOut, Search, Clock, Trash2, X, Bell, Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { axiosInstance } from "../../app/apiClient";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useSearchHistory } from "../../pages/word/hooks/useSearchHistory";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName: propUserName }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName: storeUserName, accessToken } = useAuthStore();
  
  const userName = storeUserName || propUserName || "사용자명";
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // 실시간 게임 초대 알림 SSE 연결 수립
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setNotifications([]);
      return;
    }

    // SSE 구독 엔드포인트 연결 (JWT 인증 토큰 실어서 전송)
    const eventSource = new EventSourcePolyfill(`${API_BASE_URL}/api/game/invite/connect`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      heartbeatTimeout: 60 * 10 * 1000, // 백엔드 기본 10분 타임아웃 대응
    });

    eventSource.addEventListener("invite", (event: any) => {
      try {
        const data = JSON.parse(event.data);
        // data 형식: { senderId, senderName, roomId, invitedAt }
        setNotifications((prev) => [data, ...prev]);
      } catch (err) {
        console.error("초대 데이터 파싱 실패:", err);
      }
    });

    eventSource.addEventListener("error", (err: any) => {
      console.warn("SSE 연결 오류 또는 타임아웃 발생 (재연결 대기):", err);
    });

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, accessToken]);

  const {
    history: searchHistory,
    removeKeyword: removeHistoryKeyword,
    clearHistory: clearSearchHistory,
  } = useSearchHistory();

  const handleHistoryClick = (keyword: string) => {
    setSearchQuery(keyword);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // URL 검색어 변화 감지 및 헤더 입력 필드 동기화
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      logout();
      navigate("/");
    }
  };

  const navLinks = isAuthenticated
    ? [
        { to: "/translator", label: "번역기" },
        { to: "/vocabulary", label: "단어장" },
        { to: "/reading-training", label: "읽기 훈련" },
        { to: "/quiz", label: "퀴즈" },
        { to: "/game-room", label: "단어 게임" },
      ]
    : [
        { to: "/login", label: "로그인" },
        { to: "/signup", label: "회원가입" },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950/80 backdrop-blur-md flex flex-col">
      {/* ─── 상단 행: 로고, 알림, 다크모드, 프로필, 로그아웃 ─── */}
      <div className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-100/80 dark:border-slate-900/60">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-emerald-500 text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            슬기틔움
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 실시간 알림 벨 아이콘 및 드롭다운 */}
          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="알림 열기"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white dark:text-white cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white/95 dark:bg-slate-950/95 shadow-xl backdrop-blur-md p-4 z-50 flex flex-col gap-2"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">초대 알림</span>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer"
                      >
                        모두 지우기
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      새로운 초대 알림이 없습니다.
                    </div>
                  ) : (
                    <ul className="flex flex-col max-h-64 overflow-y-auto gap-2">
                      {notifications.map((item, index) => (
                        <li
                          key={index}
                          className="flex flex-col gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 text-xs"
                        >
                          <div className="text-slate-700 dark:text-slate-300 leading-normal">
                            <strong className="text-slate-900 dark:text-white">{item.senderName}</strong>님이
                            단어 게임방에 초대하셨습니다.
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setNotifications((prev) => prev.filter((_, i) => i !== index));
                              }}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                            >
                              거절
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNotifications((prev) => prev.filter((_, i) => i !== index));
                                setShowNotifications(false);
                                navigate(`/game-room?roomId=${item.roomId}`, { state: { roomTitle: item.roomTitle } });
                              }}
                              className="rounded-lg bg-blue-500 text-white px-2.5 py-1 hover:bg-blue-600 font-semibold shadow-xs cursor-pointer"
                            >
                              수락 및 입장
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 다크모드 전환 */}
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            aria-label="다크 모드 전환"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white dark:text-white cursor-pointer"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* 사용자 정보 배지 */}
          {isAuthenticated ? (
            <>
              <Link to="/mypage" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <User className="h-3 w-3" />
                </span>
                <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{userName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 text-slate-600 dark:text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline-block" style={{ fontSize: "12.5px", fontWeight: 500 }}>로그아웃</span>
              </button>
            </>
          ) : (
            <div className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5" />
            </div>
          )}

          {/* 모바일 메뉴 토글 버튼 (md 미만) */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-950/50 hover:text-slate-900 dark:hover:text-white dark:text-white md:hidden cursor-pointer"
              aria-label="메뉴 토글"
            >
              {isMobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ─── 하단 행: 단어 검색창, 네비게이션 링크 ─── */}
      <div className="mx-auto flex h-11 w-full max-w-300 items-center px-4 sm:px-6 lg:px-8 py-1 gap-4 md:gap-6">
        {/* 단어 사전 검색 필드 (모바일은 좌우 꽉차게, 데스크톱은 좌측 정렬) */}
        {isAuthenticated && (
          <div className="relative w-full md:max-w-xs flex-1 md:flex-initial">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                placeholder="단어 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full h-8 pl-8.5 pr-3 rounded-lg text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden transition-all duration-200"
              />
            </form>

            {/* 최근 검색어 드롭다운 레이어 */}
            {isFocused && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white/95 dark:bg-slate-950/95 shadow-xl backdrop-blur-md p-3.5 z-50 flex flex-col gap-2"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span className="text-[11px] font-bold tracking-wider">최근 검색어</span>
                  </div>
                  {searchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="text-[10px] font-semibold text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      전체 삭제
                    </button>
                  )}
                </div>

                {searchHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    최근 검색 기록이 없습니다.
                  </div>
                ) : (
                  <ul className="flex flex-col max-h-60 overflow-y-auto">
                    {searchHistory.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleHistoryClick(item.keyword)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer transition-colors group"
                      >
                        <span className="truncate pr-2">{item.keyword}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistoryKeyword(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-opacity p-0.5 rounded-md hover:bg-slate-200/40 dark:hover:bg-slate-800/40 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* 데스크톱/태블릿 메뉴 링크 (로그인 전에는 중앙 정렬 및 모바일에서도 표시) */}
        <nav className={`flex items-center gap-1.5 md:gap-2.5 ${isAuthenticated ? "hidden md:flex ml-5 md:ml-9" : "w-full justify-center"}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                location.pathname === link.to
                  ? "bg-linear-to-r from-blue-500 to-emerald-500 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={{ fontSize: "13px", fontWeight: 550 }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 모바일 뷰 전용 세로 메뉴 레이어 (md 미만) */}
      {isMobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 px-4 py-3 flex flex-col gap-1.5 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full px-4 py-2.5 rounded-xl transition-colors ${
                location.pathname === link.to
                  ? "bg-linear-to-r from-blue-500 to-emerald-500 text-white font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}
              style={{ fontSize: "14px" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
