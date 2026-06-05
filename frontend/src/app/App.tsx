import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { routes } from "./router";
import { AuthInitializer } from "./AuthInitializer";
import { Loader2 } from "lucide-react";

/**
 * 청크 파일 로드 대기 시 노출할 폴백 컴포넌트
 */
function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-slate-50/20 dark:bg-slate-950/10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          페이지를 불러오는 중입니다...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const element = useRoutes(routes);

  return (
    <div className="flex flex-col min-h-screen">
      <AuthInitializer />
      
      <Header />

      <main className="flex-1 flex flex-col">
        <Suspense fallback={<LoadingFallback />}>
          {element}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}