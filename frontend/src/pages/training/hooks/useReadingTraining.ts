import { useState, useCallback, useTransition } from "react";
import { readingTrainingApi } from "../api/readingTrainingApi";
import type { SentenceGroupRes, TrainingDifficulty } from "../types/readingTraining";

export type Phase = "input" | "training" | "quiz" | "review";

export function useReadingTraining() {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputText, setInputText] = useState("");
  const [difficulty, setDifficulty] = useState<TrainingDifficulty>("NORMAL");
  const [sentenceGroups, setSentenceGroups] = useState<SentenceGroupRes[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // React 19의 useTransition을 사용하여 로딩 상태 관리 및 렌더링 블로킹 방지
  const [isPending, startTransition] = useTransition();

  const handleStartTraining = useCallback(async () => {
    if (!inputText.trim()) return;

    setError(null);

    // API 호출을 transition으로 감싸서 부드러운 UI 업데이트 제공
    startTransition(async () => {
      try {
        const data = await readingTrainingApi.postSentenceChunk({
          text: inputText,
          difficulty,
        });

        if (data && data.length > 0) {
          setSentenceGroups(data);
          setPhase("training");
        } else {
          setError("분할된 문장 데이터가 없습니다.");
        }
      } catch (err: any) {
        console.error("문장 훈련 분할 API 에러:", err);
        setError(err.response?.data?.message || "문장을 분할하는 데 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }, [inputText, difficulty]);

  const resetTraining = useCallback(() => {
    setPhase("input");
    setSentenceGroups([]);
    setError(null);
  }, []);

  return {
    phase,
    setPhase,
    inputText,
    setInputText,
    difficulty,
    setDifficulty,
    sentenceGroups,
    isPending,
    error,
    handleStartTraining,
    resetTraining,
  };
}
