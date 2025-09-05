/**
 * 공통 타입 정의
 */

export type YMDDate = {
  year: number;
  month: number;
  day: number;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
