import type { Response } from 'express';

type MetaType = Record<string, unknown>;

const sendResponse = (
  res: Response,
  statusCode: number,
  data?: unknown,
  messageOrMeta?: string | MetaType | null,
  meta?: MetaType | null
) => {
  const isSuccess = statusCode >= 200 && statusCode < 300;

  const isMsg = typeof messageOrMeta === 'string';
  const message = isMsg ? messageOrMeta : null;
  const metaData = isMsg ? meta : messageOrMeta;

  const responseBody = {
    status: isSuccess ? 'success' : 'fail',
    ...(message && { message }),
    ...(metaData && { meta: metaData }),
    data,
  };
  return res.status(statusCode).json(responseBody);
};

export default sendResponse;
