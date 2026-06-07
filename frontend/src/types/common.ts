export interface CursorResponse<T> {
  content: T[];
  nextCursor: number | null;
  hasNext: boolean;
}
