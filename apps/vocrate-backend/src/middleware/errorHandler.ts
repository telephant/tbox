import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation',
      message: 'A record with this data already exists'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
};
