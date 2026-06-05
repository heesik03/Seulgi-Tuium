import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";

/**
 * 최근 검색어 항목의 데이터 인터페이스 정의
 * strict interface 원칙 준수
 */
export interface ISearchHistoryItem {
  id: string;        // 고유 식별값 (타임스탬프)
  keyword: string;   // 검색 키워드
  searchedAt: string; // 검색 일시 (ISO string)
}

const BASE_STORAGE_KEY = "seulgi_search_history";
const MAX_HISTORY_LIMIT = 10;

export function useSearchHistory() {
  const { userName } = useAuthStore();
  
  // 사용자별로 독립된 스토리지 키 관리 (공용 PC 등에서 검색 기록 혼선 방지)
  const storageKey = userName 
    ? `${BASE_STORAGE_KEY}_${encodeURIComponent(userName)}` 
    : `${BASE_STORAGE_KEY}_guest`;

  // Lazy Initialization을 적용하여 매 렌더링 주기마다 localStorage I/O가 동기적으로 실행되는 현상 차단
  const [history, setHistory] = useState<ISearchHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(storageKey);
      return data ? (JSON.parse(data) as ISearchHistoryItem[]) : [];
    } catch (error) {
      console.error("Failed to parse search history:", error);
      return [];
    }
  });

  // 스토리지 키가 변경될 때 (로그인 사용자 전환 등) 로컬 상태 초기화
  useEffect(() => {
    try {
      const data = localStorage.getItem(storageKey);
      setHistory(data ? (JSON.parse(data) as ISearchHistoryItem[]) : []);
    } catch (error) {
      console.error("Failed to sync search history on user change:", error);
      setHistory([]);
    }
  }, [storageKey]);

  // 스토리지 변경 사항 반영 및 동기화 함수
  const saveHistory = useCallback((newHistory: ISearchHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history to localStorage:", error);
    }
  }, [storageKey]);

  // 검색어 추가 로직 (최근 10개 제한 및 중복 제거 후 맨 앞으로 이동)
  const addKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // 기존에 존재하는 검색어 중복 제거
      const filtered = prev.filter((item) => item.keyword !== trimmed);
      
      const newItem: ISearchHistoryItem = {
        id: Date.now().toString(),
        keyword: trimmed,
        searchedAt: new Date().toISOString(),
      };

      // 최근 10개만 유지 (MAX_HISTORY_LIMIT = 10)
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_LIMIT);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save search history within updater:", error);
      }
      
      return updated;
    });
  }, [storageKey]);

  // 특정 검색어 삭제
  const removeKeyword = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to remove search history item:", error);
      }
      return updated;
    });
  }, [storageKey]);

  // 전체 검색 기록 삭제
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  }, [storageKey]);

  return {
    history,
    addKeyword,
    removeKeyword,
    clearHistory,
  };
}
