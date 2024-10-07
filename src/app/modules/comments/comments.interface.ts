import { Types } from 'mongoose';
import { TVoteInfo } from '../articles/articles.interface';

export type TComment = {
  articleId: Types.ObjectId;
  commenter: {
    commenterId: Types.ObjectId;
    name: string;
    profilePhoto?: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  voteInfo: TVoteInfo[];
};
