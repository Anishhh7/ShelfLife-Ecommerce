const sendResponse = (res, statusCode, data, message, meta) => {
  const status = statusCode < 400 ? 'success' : 'fail';

  res.status(statusCode).json({ status, ...meta, message, data });
};

export default sendResponse;
