import { Types } from 'mongoose';

export type TPayment = {
  transactionId: string;
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  amount: number;
  email: string;
  status: 'pending' | 'completed' | 'failed';
  authorId?: Types.ObjectId;
};
