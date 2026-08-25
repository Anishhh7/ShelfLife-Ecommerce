import type { Response } from 'express';
import type { ApiResponse, Page, PageMeta } from '../types/api';

type NotPaginated<T> = T extends { data: unknown; meta: unknown } ? never : T;

const envelope = <T>(
  statusCode: number,
  data: T,
  message?: string,
  meta?: PageMeta
): ApiResponse<T> => ({
  status: statusCode >= 200 && statusCode < 300 ? 'success' : 'fail',
  message,
  meta,
  data,
});

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: NotPaginated<T>,
  message?: string
): Response => res.status(statusCode).json(envelope(statusCode, data, message));

export const sendPage = <T>(
  res: Response,
  statusCode: number,
  page: Page<T>,
  message?: string
): Response =>
  res.status(statusCode).json(
    envelope(statusCode, page.data, message, page.meta)
  );