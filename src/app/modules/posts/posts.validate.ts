import { z } from 'zod';
import { REACTION_TYPE } from '../reactions/reactions.interface';

export const createPostValidationSchema = z.object({
  petId: z.string().optional(),
  caption: z.string().optional(),
  media: z
    .array(
      z.object({
        url: z.string().nonempty({ message: 'Media URL is required' }),
        type: z.enum(['image', 'video']),
      }),
    )
    .optional(),
  isMilestone: z.boolean().optional(),
  milestoneCategory: z
    .enum(['adoption', 'birthday', 'vet-visit', 'health', 'other'])
    .optional(),
});

export const createShareValidationSchema = z.object({
  refId: z.string().nonempty({ message: 'refId is required' }),
  refType: z.enum(['Article', 'Post'], {
    required_error: 'refType must be either "Article" or "Post"',
  }),
  caption: z.string().optional(),
});

export const updatePostValidationSchema = z.object({
  caption: z.string().optional(),
});

export const reactToPostValidationSchema = z.object({
  reactionType: z.nativeEnum(REACTION_TYPE),
});
