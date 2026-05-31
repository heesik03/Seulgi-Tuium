import { Outlet } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignUpPage } from "../pages/auth/SignUpPage";
import { TranslatorPage } from "../pages/analysis/TranslatorPage";
import { VocabularyPage } from "../pages/word/VocabularyPage";
import { QuizPage } from "../pages/quiz/QuizPage";
import { QuizRoomPage } from "../pages/quiz/QuizRoomPage";
import { ReadingTrainingPage } from "../pages/word/ReadingTrainingPage";
import IntroPage from "../pages/IntroPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export const routes = [
  // Public Routes (비로그인, 로그인 모두 접근 가능. 원할 경우 비로그인 전용 가드도 추가 가능)
  { path: "/", element: <IntroPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },

  // Protected Routes (로그인 사용자만)
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "translator", element: <TranslatorPage /> },
      { path: "vocabulary", element: <VocabularyPage /> },
      { path: "quiz", element: <QuizPage /> },
      { path: "quiz-room", element: <QuizRoomPage /> },
      { path: "reading-training", element: <ReadingTrainingPage /> },
      { path: "*", element: <TranslatorPage /> },
    ]
  }
];
