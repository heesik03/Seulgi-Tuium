import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function PublicRoute() {
  const { isAuthenticated, isAuthInitialized } = useAuthStore();

  if (!isAuthInitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
        로그인 상태를 확인하는 중...
      </div>
    );
  }

  // 이미 로그인된 상태라면 메인 서비스(예: /translator)로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/translator" replace />;
  }

  return <Outlet />;
}
