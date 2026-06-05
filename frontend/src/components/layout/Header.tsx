import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Moon, Sun, Sparkles, User, LogOut, Search, Clock, Trash2, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { axiosInstance } from "../../app/apiClient";
import { useSearchHistory } from "../../pages/word/hooks/useSearchHistory";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName: propUserName }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName: storeUserName } = useAuthStore();
  
  const userName = storeUserName || propUserName || "사용자명";
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
        { to: "/quiz-room", label: "멀티 퀴즈" },
      ]
    : [
        { to: "/login", label: "로그인" },
        { to: "/signup", label: "회원가입" },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-emerald-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-slate-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            슬기틔움
          </span>
        </Link>

        {/* 단어 사전 검색 필드 (로그인 시 상단에 자연스럽게 배치) */}
        {isAuthenticated && (
          <div className="hidden sm:block relative max-w-xs w-full mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                placeholder="단어 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full h-9 pl-9 pr-4 rounded-xl text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden transition-all duration-200 focus:w-64 w-48"
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

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === link.to
                  ? "bg-linear-to-r from-blue-500 to-emerald-500 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white dark:text-white"
              }`}
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            aria-label="다크 모드 전환"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white dark:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-slate-700 dark:text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span style={{ fontSize: "13px" }}>{userName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-slate-600 dark:text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block" style={{ fontSize: "14px", fontWeight: 500 }}>로그아웃</span>
              </button>
            </>
          ) : (
            <div className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
