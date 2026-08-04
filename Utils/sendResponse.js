const sendResponse = (res, statusCode, data=null, message='', meta=null) => {
  const isSuccess = statusCode >= 200 && statusCode<400;

  const responseBody = {
    status: isSuccess ? 'success' : 'fail',
    ...(message && { message }),
    ...(meta && { meta }),
    data,
  }
  return res.status(statusCode).json(responseBody);
};

export default sendResponse;
