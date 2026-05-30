import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { getErrorMessage } from "../../utils/errorUtil";

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 및 이름 중복 확인 상태 추가
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [isNameChecked, setIsNameChecked] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsEmailChecked(false);
    setIsEmailAvailable(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setIsNameChecked(false);
    setIsNameAvailable(null);
  };

  const handleCheckEmail = async () => {
    if (!email) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식이 아닙니다.");
      return;
    }
    setErrorMsg("");
    setIsCheckingEmail(true);
    try {
      const response = await axios.get<boolean>(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/email/${email}`
      );
      setIsEmailAvailable(response.data);
      setIsEmailChecked(true);
      if (!response.data) {
        setErrorMsg("이미 사용 중인 이메일입니다.");
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleCheckName = async () => {
    if (!userName) {
      setErrorMsg("이름을 입력해주세요.");
      return;
    }
    if (userName.length < 2 || userName.length > 25) {
      setErrorMsg("이름은 2~25자 사이여야 합니다.");
      return;
    }
    setErrorMsg("");
    setIsCheckingName(true);
    try {
      const response = await axios.get<boolean>(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/name/${userName}`
      );
      setIsNameAvailable(response.data);
      setIsNameChecked(true);
      if (!response.data) {
        setErrorMsg("이미 사용 중인 이름입니다.");
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsCheckingName(false);
    }
  };

  const validateForm = () => {
    if (!email || !userName || !password || !confirmPassword) {
      setErrorMsg("모든 항목을 입력해주세요.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식이 아닙니다.");
      return false;
    }

    if (!isEmailChecked || !isEmailAvailable) {
      setErrorMsg("이메일 중복 확인을 해주세요.");
      return false;
    }

    if (userName.length < 2 || userName.length > 25) {
      setErrorMsg("이름은 2~25자 사이여야 합니다.");
      return false;
    }

    if (!isNameChecked || !isNameAvailable) {
      setErrorMsg("이름 중복 확인을 해주세요.");
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/signup`, {
        email,
        userName,
        password
      });

      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 flex flex-col flex-1">
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-6">
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 lg:p-10 space-y-7">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">회원가입</h1>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-slate-700">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="이메일을 입력하세요"
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  disabled={isCheckingEmail}
                  className="px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 min-w-[80px]"
                >
                  {isCheckingEmail ? <Loader2 className="w-4 h-4 animate-spin m-auto" /> : "중복 확인"}
                </button>
              </div>
              {isEmailChecked && isEmailAvailable && (
                <p className="text-xs text-green-600">사용 가능한 이메일입니다.</p>
              )}
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-slate-700">이름</Label>
              <div className="flex gap-2">
                <Input
                  id="signup-name"
                  type="text"
                  value={userName}
                  onChange={handleNameChange}
                  placeholder="이름을 입력하세요 (2~25자)"
                  className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleCheckName}
                  disabled={isCheckingName}
                  className="px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 min-w-[80px]"
                >
                  {isCheckingName ? <Loader2 className="w-4 h-4 animate-spin m-auto" /> : "중복 확인"}
                </button>
              </div>
              {isNameChecked && isNameAvailable && (
                <p className="text-xs text-green-600">사용 가능한 이름입니다.</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-slate-700">비밀번호</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="영문, 숫자, 특수문자 조합 8자 이상"
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

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password" className="text-slate-700">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-slate-200 bg-white pr-10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-white font-medium bg-linear-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-emerald-500/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "회원가입"}
              </button>
              {errorMsg && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}
            </div>

            {/* 로그인으로 돌아가기 */}
            <p className="text-center text-sm text-slate-500">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                로그인
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
