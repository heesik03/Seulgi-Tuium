import { lazy } from "react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";

// 페이지 컴포넌트 지연 로딩 (Lazy Loading)
const IntroPage = lazy(() => import("../pages/IntroPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage"));
const TranslatorPage = lazy(() => import("../pages/analysis/TranslatorPage"));
const VocabularyPage = lazy(() => import("../pages/word/VocabularyPage"));
const WordBookDetailPage = lazy(() => import("../pages/word/WordBookDetailPage"));
const WordSearchPage = lazy(() => import("../pages/word/WordSearchPage"));
const QuizPage = lazy(() => import("../pages/quiz/QuizPage"));
const GameRoomPage = lazy(() => import("../pages/game/GameRoomPage"));
const ReadingTrainingPage = lazy(() => import("../pages/training/ReadingTrainingPage"));
const MyPage = lazy(() => import("../pages/auth/MyPage"));
const AdminPage = lazy(() => import("../pages/admin/AdminPage"));

export const routes = [
  // Public Routes (비로그인, 로그인 모두 접근 가능)
  { path: "/", element: <IntroPage /> },

  // Guest Only Routes (로그인된 사용자는 메인으로 리다이렉트)
  {
    path: "/",
    element: <PublicRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
    ]
  },

  // Protected Routes (로그인 사용자만)
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "translator", element: <TranslatorPage /> },
      { path: "vocabulary", element: <VocabularyPage /> },
      { path: "vocabulary/:wordBookId", element: <WordBookDetailPage /> },
      { path: "search", element: <WordSearchPage /> },
      { path: "quiz", element: <QuizPage /> },
      { path: "game-room", element: <GameRoomPage /> },
      { path: "reading-training", element: <ReadingTrainingPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "*", element: <TranslatorPage /> },
    ]
  }
];
