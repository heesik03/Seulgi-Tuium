import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Sparkles, User } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "사용자명(xxx)" }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  const navLinks = [
    { to: "/", label: "번역기" },
    { to: "/vocabulary", label: "단어장" },
    { to: "/reading-training", label: "읽기 훈련" },
    { to: "/quiz", label: "퀴즈" },
    { to: "/quiz-room", label: "멀티 퀴즈" },
    { to: "/login", label: "로그인" },
    { to: "/signup", label: "회원가입" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-emerald-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-slate-900" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
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
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <User className="h-3.5 w-3.5" />
            </span>
            <span style={{ fontSize: "13px" }}>{userName}</span>
          </div>

          <div className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
