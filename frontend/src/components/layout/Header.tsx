import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Sparkles, User, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { axiosInstance } from "../../app/apiClient";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName: propUserName }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName: storeUserName } = useAuthStore();
  
  const userName = storeUserName || propUserName || "사용자명";

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
