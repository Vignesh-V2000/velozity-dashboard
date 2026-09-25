import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  clientId: z.string().uuid('Invalid client ID'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  clientId: z.string().uuid().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
