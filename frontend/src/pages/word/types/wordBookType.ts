import type { UrimalsaemItem } from "../../analysis/types/analysisType";
import type { AddWordReq, CursorResponse } from "./wordType";

export interface WordBookRes {
  wordBookId: number;
  title: string;
  description: string;
  wordCount: number;
  createdAt: string;
}

export interface WordBookWordRes {
  wordBookWordId: number;
  addedAt: string;
  UrimalsaemItem?: UrimalsaemItem;
  urimalsaemItem?: UrimalsaemItem;
}

export interface CreateWordBookReq {
  title: string;
  description: string;
}

export interface CreateWordBookWithWordsReq {
  words: AddWordReq[];
}

export interface UpdateWordBookReq {
  title: string;
  description: string;
}
