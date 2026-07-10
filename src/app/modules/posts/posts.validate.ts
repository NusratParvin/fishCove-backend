import { z } from 'zod';

// For regular posts: photo, video, or milestone.
// Requires at least a caption OR media — an empty post makes no sense.
export const createPostValidationSchema = z.object({
  petId: z.string().optional(),
  type: z.enum(['photo', 'video', 'milestone']),
  caption: z.string().optional(),
  media: z
    .array(
      z.object({
        url: z.string().nonempty({ message: 'Media URL is required' }),
        type: z.enum(['image', 'video']),
      }),
    )
    .optional(),
});

// For sharing an existing Article or Post into the feed.
// The controller derives type ('shared_article' | 'shared_post') from refType,
// so the client only ever sends refType + refId, not the derived type.
export const createShareValidationSchema = z.object({
  refId: z.string().nonempty({ message: 'refId is required' }),
  refType: z.enum(['Article', 'Post'], {
    required_error: 'refType must be either "Article" or "Post"',
  }),
  caption: z.string().optional(), // optional "quote" text added when sharing
});

export const updatePostValidationSchema = z.object({
  caption: z.string().optional(),
});
