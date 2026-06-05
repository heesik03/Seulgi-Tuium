export type TrainingDifficulty = "EASY" | "NORMAL" | "HARD";
export type SemanticRole = "SUBJECT" | "OBJECT" | "PREDICATE" | "CAUSE" | "RESULT" | "OTHER";

export interface SentenceTrainingReq {
  text: string;
  difficulty: TrainingDifficulty;
}

export interface SentenceComponentRes {
  text: string;
  keywords: string[];
  role: SemanticRole;
  roleDescription: string;
}

export interface SentenceGroupRes {
  groupIndex: number;
  fullText: string;
  components: SentenceComponentRes[];
}

// UI 표시에 사용할 Role 매핑 정보
export const CHUNK_ROLE_MAP: Record<SemanticRole, { label: string; description: string }> = {
  SUBJECT: { label: "주어", description: "행동 또는 상태의 주체 (누가, 무엇이)" },
  OBJECT: { label: "목적어", description: "행동의 대상 (무엇을, 누구를)" },
  PREDICATE: { label: "서술어", description: "행동 또는 상태 (동사, 형용사 중심)" },
  CAUSE: { label: "원인", description: "이유, 근거, 배경, 조건 (~해서, ~때문에, ~하여, ~하자 등)" },
  RESULT: { label: "결과", description: "원인으로 인해 발생한 결과 (~되었다, ~나타났다, ~발생했다 등)" },
  OTHER: { label: "기타", description: "시간, 장소, 수식어, 접속, 인용 등 위 5개에 속하지 않는 모든 요소" },
};
