import { useCallback, useEffect } from "react";
import { create } from "zustand";
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

interface SearchHistoryState {
  history: ISearchHistoryItem[];
  setHistory: (history: ISearchHistoryItem[]) => void;
}

// 전역 상태 동기화를 위한 Zustand 스토어 생성
const useSearchHistoryStore = create<SearchHistoryState>((set) => ({
  history: [],
  setHistory: (history) => set({ history }),
}));

const BASE_STORAGE_KEY = "seulgi_search_history";
const MAX_HISTORY_LIMIT = 10;

export function useSearchHistory() {
  const { userName } = useAuthStore();
  const { history, setHistory } = useSearchHistoryStore();
  
  // 사용자별로 독립된 스토리지 키 관리 (공용 PC 등에서 검색 기록 혼선 방지)
  const storageKey = userName 
    ? `${BASE_STORAGE_KEY}_${encodeURIComponent(userName)}` 
    : `${BASE_STORAGE_KEY}_guest`;

  // 스토리지 키가 변경될 때 (로그인 사용자 전환 등) 로컬스토리지를 읽어와 전역 스토어 상태 리프레시
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(storageKey);
      setHistory(data ? (JSON.parse(data) as ISearchHistoryItem[]) : []);
    } catch (error) {
      console.error("Failed to parse search history:", error);
      setHistory([]);
    }
  }, [storageKey, setHistory]);

  // 검색어 추가 로직 (최근 10개 제한 및 중복 제거 후 맨 앞으로 이동)
  const addKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    try {
      const currentHistoryStr = localStorage.getItem(storageKey);
      const currentHistory = currentHistoryStr ? (JSON.parse(currentHistoryStr) as ISearchHistoryItem[]) : [];
      
      // 기존에 존재하는 검색어 중복 제거
      const filtered = currentHistory.filter((item) => item.keyword !== trimmed);
      
      const newItem: ISearchHistoryItem = {
        id: Date.now().toString(),
        keyword: trimmed,
        searchedAt: new Date().toISOString(),
      };

      // 최근 10개만 유지 (MAX_HISTORY_LIMIT = 10)
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_LIMIT);
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error("Failed to add search history item:", error);
    }
  }, [storageKey, setHistory]);

  // 특정 검색어 삭제
  const removeKeyword = useCallback((id: string) => {
    try {
      const currentHistoryStr = localStorage.getItem(storageKey);
      const currentHistory = currentHistoryStr ? (JSON.parse(currentHistoryStr) as ISearchHistoryItem[]) : [];
      
      const updated = currentHistory.filter((item) => item.id !== id);
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error("Failed to remove search history item:", error);
    }
  }, [storageKey, setHistory]);

  // 전체 검색 기록 삭제
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  }, [storageKey, setHistory]);

  return {
    history,
    addKeyword,
    removeKeyword,
    clearHistory,
  };
}
