export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: Error | AppError | unknown): { 
  success: false; 
  error: string; 
  statusCode: number;
  isOperational?: boolean;
} {
  // Log the actual error for debugging
  console.error('API Error:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : 'Unknown',
  });

  // If it's an operational error, return the message
  if (error instanceof AppError && error.isOperational) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      isOperational: true
    };
  }

  // For non-operational errors, return generic message in production
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
      isOperational: false
    };
  }

  // In development, return the actual error
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
    statusCode: error instanceof AppError ? error.statusCode : 500,
    isOperational: false
  };
}

export function asyncHandler(fn: Function) {
  return (req: unknown, res: unknown, next: unknown) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      if (typeof next === 'function') {
        next(error);
      }
    });
  };
}
