import { Types } from 'mongoose';

export type TArticle = {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  category: 'Tip' | 'Story';
  // images?: string[];
  images?: string;
  upvotes: number;
  downvotes: number;
  comments: string[];
  isPremium: boolean;
  price?: number;
  isDeleted?: boolean;
};
