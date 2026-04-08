class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500);
    this.name = "DatabaseError";
  }
}

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found with id: ${err.value}`;
    err = new NotFoundError(message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err = new ConflictError(message);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    err = new AuthenticationError(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired";
    err = new AuthenticationError(message);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    err = new ValidationError(messages);
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  globalErrorHandler,
  asyncHandler,
};
