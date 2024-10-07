import { z } from 'zod';

const createCommentValidationSchema = z.object({
  articleId: z.string().nonempty({ message: 'Article ID is required' }),
  commenter: z.object({
    commenterId: z.string().nonempty({ message: 'Commenter ID is required' }),
    name: z.string().nonempty({ message: 'Commenter name is required' }),
    profilePhoto: z.string().optional().nullable().default(''),
  }),
  content: z.string().nonempty({ message: 'Comment content is required' }),
  upvotes: z.number().int().optional(),
  downvotes: z.number().int().optional(),
});

const updateCommentValidationSchema = z.object({
  content: z.string().nonempty({ message: 'Comment content is required' }),
});
export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
