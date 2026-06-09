export interface AdminDashboardRes {
  totalUserCount: number;
  totalWordCount: number;
}

export interface AdminUserListRes {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isLocked: boolean;
  failedAttempts: number;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
