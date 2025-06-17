import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { registerSchema, loginSchema } from '../schemas/auth';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export const authRoutes: Router = Router();

// Register
authRoutes.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === validatedData.email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login
authRoutes.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please check your email or register for a new account.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
authRoutes.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});
