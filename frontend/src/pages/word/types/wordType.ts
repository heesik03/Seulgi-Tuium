import type { UrimalsaemItem } from "../../analysis/types/analysisType";

export interface FavoriteWordRes {
  favoriteWordId: number;
  addedAt: string;
  urimalsaemItem?: UrimalsaemItem;
  UrimalsaemItem?: UrimalsaemItem;
  word?: string;
  definition?: string;
  pos?: string;
  type?: string;
  link?: string;
}

export interface AddWordReq {
  word: string;
  targetCode: number;
  senseNo: number;
  definition: string;
  pos: string;
  link: string;
  type: string;
}

export interface CursorResponse<T> {
  content: T[];
  nextCursor: number | null;
  hasNext: boolean;
}
