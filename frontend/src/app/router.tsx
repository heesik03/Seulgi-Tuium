import { LoginPage } from "../pages/auth/LoginPage";
import { SignUpPage } from "../pages/auth/SignUpPage";
import { TranslatorPage } from "../pages/analysis/TranslatorPage";
import { VocabularyPage } from "../pages/word/VocabularyPage";
import { QuizPage } from "../pages/quiz/QuizPage";
import { QuizRoomPage } from "../pages/quiz/QuizRoomPage";
import { ReadingTrainingPage } from "../pages/word/ReadingTrainingPage";

export const routes = [
  { path: "/", element: <TranslatorPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/vocabulary", element: <VocabularyPage /> },
  { path: "/quiz", element: <QuizPage /> },
  { path: "/quiz-room", element: <QuizRoomPage /> },
  { path: "/reading-training", element: <ReadingTrainingPage /> },
  { path: "*", element: <TranslatorPage /> },
];
