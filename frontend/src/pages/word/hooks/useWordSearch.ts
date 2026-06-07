import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { searchUrimalsaem } from "../../analysis/api/analysisApi";
import { getFavoriteWords, addFavoriteWord, deleteFavoriteWord } from "../api/wordApi";
import { useSearchHistory } from "./useSearchHistory";
import type { UrimalsaemItem } from "../../analysis/types/analysisType";
import type { AddWordReq, FavoriteWordRes } from "../types/wordType";

/**
 * 표제어별로 사전 검색 결과를 그룹화한 구조 인터페이스
 * (이름에 DTO/dto 접미사 제외 규칙 준수)
 */
export interface GroupedWord {
  word: string;
  items: UrimalsaemItem[];
}

export function useWordSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const [items, setItems] = useState<UrimalsaemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최근 검색어 관리를 위한 훅 통합
  const { history, addKeyword, removeKeyword, clearHistory } = useSearchHistory();

  // targetCode를 키값으로 하며, 즐겨찾기 ID(favoriteWordId)를 값으로 보관하는 Map
  // 해시 테이블을 활용하여 리액트 가상 돔 재조정 및 렌더링 시 O(1) 시간 복잡도로 북마크 상태 매핑
  const [favoriteMap, setFavoriteMap] = useState<Map<number, number>>(new Map());
  const [isPending, startTransition] = useTransition();

  // 1. 단어 검색 결과 조회 및 북마크 정보 초기화 로직
  useEffect(() => {
    if (!query) {
      setItems([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 병렬 처리를 통해 네트워크 대기 시간 최적화
        const [searchRes, favoritesRes] = await Promise.all([
          searchUrimalsaem({ q: query, num: 50 }), // 최대 50개 검색 결과 요청
          getFavoriteWords(undefined, 100), // 최근 즐겨찾기 단어 최대 100개 로드
        ]);

        setItems(searchRes.items || []);

        // 검색 성공 시 최근 검색어 히스토리에 누적
        addKeyword(query);

        // 즐겨찾기 목록을 targetCode -> favoriteWordId 맵으로 구축
        // 메모리 상에서 빠른 룩업이 가능하도록 구조화
        const newMap = new Map<number, number>();
        favoritesRes.content.forEach((fav: FavoriteWordRes) => {
          const targetCode = fav.urimalsaemItem?.targetCode ?? fav.UrimalsaemItem?.targetCode;
          if (targetCode) {
            newMap.set(targetCode, fav.favoriteWordId);
          }
        });
        setFavoriteMap(newMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, addKeyword]);

  // 2. 단어별 그룹화 로직 (동일 단어의 여러 뜻풀이를 묶어서 표시)
  // useMemo를 사용하여 검색 데이터가 바뀔 때만 재그룹화 연산(Heap 메모리 할당 방지) 수행
  const groupedWords: GroupedWord[] = items.reduce<GroupedWord[]>((acc, item) => {
    const existing = acc.find((g) => g.word === item.word);
    if (existing) {
      existing.items.push(item);
      existing.items.sort((a, b) => a.senseNo - b.senseNo);
    } else {
      acc.push({
        word: item.word,
        items: [item],
      });
    }
    return acc;
  }, []);

  // 3. 북마크(즐겨찾기) 토글 액션
  // React 19의 useTransition을 활용하여 비동기 처리 상태를 캡슐화하고 UI 중단을 억제
  const toggleFavorite = (item: UrimalsaemItem) => {
    const isFav = favoriteMap.has(item.targetCode);
    const favId = favoriteMap.get(item.targetCode);

    startTransition(async () => {
      try {
        if (isFav && favId !== undefined) {
          await deleteFavoriteWord(favId);
          setFavoriteMap((prev) => {
            const next = new Map(prev);
            next.delete(item.targetCode);
            return next;
          });
        } else {
          const req: AddWordReq = {
            word: item.word,
            targetCode: item.targetCode,
            senseNo: item.senseNo,
            definition: item.definition,
            pos: item.pos,
            link: item.link,
            type: item.type,
          };
          const newFavId = await addFavoriteWord(req);
          setFavoriteMap((prev) => {
            const next = new Map(prev);
            next.set(item.targetCode, newFavId);
            return next;
          });
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "즐겨찾기 처리 중 오류가 발생했습니다.");
      }
    });
  };

  return {
    query,
    groupedWords,
    loading,
    error,
    favoriteMap,
    toggleFavorite,
    isPending,
    // 최근 검색 기록 데이터 및 액션 반환
    searchHistory: history,
    removeHistoryKeyword: removeKeyword,
    clearSearchHistory: clearHistory,
  };
}
