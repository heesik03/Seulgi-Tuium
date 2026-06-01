import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
  const { isAuthenticated, isAuthInitialized } = useAuthStore();

  if (!isAuthInitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
        로그인 상태를 확인하는 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
