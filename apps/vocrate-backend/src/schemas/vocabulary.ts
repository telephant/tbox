import { z } from 'zod';

export const createVocabularySchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be at most 100 characters'),
  definition: z.string().min(1, 'Definition is required').max(1000, 'Definition must be at most 1000 characters'),
  pronunciation: z.string().max(200, 'Pronunciation must be at most 200 characters').optional(),
  example: z.string().max(500, 'Example must be at most 500 characters').optional(),
  difficulty: z.number().int().min(1).max(5).default(1)
});

export const updateVocabularySchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be at most 100 characters').optional(),
  definition: z.string().min(1, 'Definition is required').max(1000, 'Definition must be at most 1000 characters').optional(),
  pronunciation: z.string().max(200, 'Pronunciation must be at most 200 characters').optional(),
  example: z.string().max(500, 'Example must be at most 500 characters').optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  mastery: z.number().int().min(0).max(100).optional()
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
