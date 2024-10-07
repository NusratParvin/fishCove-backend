import { z } from 'zod';

const createArticleValidationSchema = z.object({
  // authorId: z.string().nonempty({ message: 'Author ID is required' }),
  title: z.string().nonempty({ message: 'Title is required' }),
  content: z.string().nonempty({ message: 'Content is required' }),
  category: z.enum(['Tip', 'Story'], {
    required_error: 'Category must be either "Tip" or "Story"',
  }),
  // images: z.string().optional(),
  images: z.string().nullable().optional(),

  upvotes: z.number().int().nonnegative().optional(),
  downvotes: z.number().int().nonnegative().optional(),
  comments: z.array(z.string()).optional(),
  isPremium: z.boolean(),
  price: z.number().optional().default(0), // Default to 0 if price is not provided
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
  voteInfo: z
    .array(
      z.object({
        userId: z.string().nonempty({ message: 'User ID is required' }),
        voteType: z.enum(['upvote', 'downvote'], {
          required_error: 'Vote type must be either "upvote" or "downvote"',
        }),
      }),
    )
    .optional(),
});

export const ArticleValidation = {
  createArticleValidationSchema,
  updateArticleValidationSchema,
};
