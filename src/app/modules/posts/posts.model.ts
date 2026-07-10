import { Schema, model } from 'mongoose';
import { TPost } from './posts.interface';

const postSchema = new Schema<TPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'pet',
      required: false,
    },
    type: {
      type: String,
      enum: ['photo', 'video', 'milestone', 'shared_article', 'shared_post'],
      required: true,
    },
    caption: {
      type: String,
      required: false,
    },
    media: {
      type: [
        {
          url: { type: String, required: true },
          type: { type: String, enum: ['image', 'video'], required: true },
        },
      ],
      default: [],
    },

    // Polymorphic share reference: refType tells Mongoose which collection
    // to populate refId from at query time. Same trick you used for
    // Comments (targetType/targetId), just named for this context.
    refId: {
      type: Schema.Types.ObjectId,
      refPath: 'refType',
      required: false,
    },
    refType: {
      type: String,
      enum: ['Article', 'Post'],
      required: false,
    },

    reactionSummary: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Post = model<TPost>('Post', postSchema);
