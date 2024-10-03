import { z } from 'zod';

const createArticleValidationSchema = z.object({
  // authorId: z.string().nonempty({ message: 'Author ID is required' }),
  title: z.string().nonempty({ message: 'Title is required' }),
  content: z.string().nonempty({ message: 'Content is required' }),
  category: z.enum(['Tip', 'Story'], {
    required_error: 'Category must be either "Tip" or "Story"',
  }),
  images: z.string().optional(),
  upvotes: z.number().int().nonnegative().optional(),
  downvotes: z.number().int().nonnegative().optional(),
  comments: z.array(z.string()).optional(),
});

const updateArticleValidationSchema = z.object({
  authorId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.enum(['Tip', 'Story']).optional(),
  images: z.string().optional(),
  upvotes: z.number().int().nonnegative().optional(),
  downvotes: z.number().int().nonnegative().optional(),
  comments: z.array(z.string()).optional(),
});

export const ArticleValidation = {
  createArticleValidationSchema,
  updateArticleValidationSchema,
};
