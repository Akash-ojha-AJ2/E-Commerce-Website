class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // 1) If err is a string (or not an Error object), convert to ErrorHandler
  if (typeof err === "string") {
    err = new ErrorHandler(err, 500);
  } else if (!(err instanceof Error)) {
    // handles other non-error types (just in case)
    err = new ErrorHandler(JSON.stringify(err), 500);
  }

  // 2) Now it's safe to read / set properties
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  // 3) Handle known error types (keep these AFTER conversion)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again.`;
    err = new ErrorHandler(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again.`;
    err = new ErrorHandler(message, 401);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // 4) Send response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
