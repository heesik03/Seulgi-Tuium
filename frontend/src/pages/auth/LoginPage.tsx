import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      setAccessToken(res.data.accessToken);
      navigate("/");
    } catch (err) {
      setErrorMsg("이메일 또는 비밀번호가 올바르지 않거나 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/oauth2/authorization/kakao`;
  };

  return (
    <div className="w-full bg-slate-50 flex flex-col flex-1">
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-6">
        <div className="w-full max-w-105 bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 lg:p-10 space-y-7">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">로그인</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" aria-label="비밀번호" className="text-slate-700">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-slate-200 bg-white pr-10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg text-white font-medium bg-linear-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-emerald-500/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "로그인"}
                </button>
                {errorMsg && (
                  <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                )}
              </div>

              {/* 구분선 */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 shrink-0">또는</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* 카카오 로그인 */}
              <button
                type="button"
                onClick={handleKakaoLogin}
                className="w-full h-12 rounded-lg font-medium flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#F5DC00] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3C7.029 3 3 6.243 3 10.267c0 2.57 1.638 4.833 4.118 6.188l-1.05 3.896c-.092.34.306.614.604.404l4.584-3.081C11.415 17.756 11.706 17.767 12 17.767c4.971 0 9-3.243 9-7.267C21 6.243 16.971 3 12 3z"
                    fill="#191919"
                  />
                </svg>
                <span className="text-[#191919] text-sm">카카오로 로그인</span>
              </button>

              <p className="text-center text-sm text-slate-500">
                아직 계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  회원가입
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
