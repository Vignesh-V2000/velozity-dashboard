import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('20'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
