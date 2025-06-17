import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { createVocabularySchema, updateVocabularySchema } from '../schemas/vocabulary';

export const vocabularyRoutes: Router = Router();

// All vocabulary routes require authentication
vocabularyRoutes.use(authenticateToken);

// Get all vocabularies for the authenticated user
vocabularyRoutes.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user!.userId,
      ...(search && {
        OR: [
          { word: { contains: search as string, mode: 'insensitive' as const } },
          { definition: { contains: search as string, mode: 'insensitive' as const } }
        ]
      })
    };

    const [vocabularies, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vocabulary.count({ where })
    ]);

    res.json({
      vocabularies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific vocabulary
vocabularyRoutes.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const vocabulary = await prisma.vocabulary.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    res.json({ vocabulary });
  } catch (error) {
    next(error);
  }
});

// Create a new vocabulary
vocabularyRoutes.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = createVocabularySchema.parse(req.body);

    const vocabulary = await prisma.vocabulary.create({
      data: {
        ...validatedData,
        userId: req.user!.userId
      }
    });

    res.status(201).json({
      message: 'Vocabulary created successfully',
      vocabulary
    });
  } catch (error) {
    next(error);
  }
});

// Update a vocabulary
vocabularyRoutes.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = updateVocabularySchema.parse(req.body);

    const vocabulary = await prisma.vocabulary.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    const updatedVocabulary = await prisma.vocabulary.update({
      where: { id: req.params.id },
      data: validatedData
    });

    res.json({
      message: 'Vocabulary updated successfully',
      vocabulary: updatedVocabulary
    });
  } catch (error) {
    next(error);
  }
});

// Delete a vocabulary
vocabularyRoutes.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const vocabulary = await prisma.vocabulary.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    await prisma.vocabulary.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    next(error);
  }
});
