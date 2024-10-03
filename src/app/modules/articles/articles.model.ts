import { Schema, model } from 'mongoose';
import { TArticle } from './articles.interface';

// Define the Article schema
const articleSchema = new Schema<TArticle>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: ['Tip', 'Story'],
      required: [true, 'Category is required'],
    },
    images: {
      type: String,
      required: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default: [],
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: function () {
        return this.isPremium;
      },
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

// Export the Article model
export const Article = model<TArticle>('Article', articleSchema);
