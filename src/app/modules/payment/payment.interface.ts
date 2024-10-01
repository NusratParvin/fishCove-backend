import { Types } from 'mongoose';

export type TPayment = {
  userId: Types.ObjectId;
  amount: number;
  paymentMethod: 'card';
  paymentDate: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId: string;
  rentalId?: Types.ObjectId;
};
