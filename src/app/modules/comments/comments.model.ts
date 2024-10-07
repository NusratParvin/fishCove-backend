import { Schema, model } from 'mongoose';
import { TComment } from './comments.interface';

const commentSchema = new Schema<TComment>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'article',
      required: true,
    },
    commenter: {
      commenterId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      profilePhoto: {
        type: String,
        default: '',
      },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    voteInfo: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          voteType: {
            type: String,
            enum: ['upvote', 'downvote'],
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Comment = model<TComment>('Comment', commentSchema);
