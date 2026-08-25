
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail';
  message?: string | undefined;
  meta?: PageMeta | undefined;
  data: T;
}