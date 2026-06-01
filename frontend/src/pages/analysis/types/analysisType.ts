export interface AnalysisTranslateReq {
  text: string;
  tone: "DEFAULT" | "CHILD" | "FRIENDLY" | "OFFICIAL";
}

export interface AnalysisTranslateRes {
  convertedText: string;
  aiDifficultWords: string[];
  komoranKeywords: string[];
}

export interface UrimalsaemReq {
  q: string;
  start?: number;
  num?: number;
}

export interface UrimalsaemItem {
  word: string;
  targetCode: number;
  senseNo: number;
  definition: string;
  pos: string;
  link: string;
  type: string;
}

export interface UrimalsaemRes {
  total: number;
  start: number;
  num: number;
  items: UrimalsaemItem[];
}
