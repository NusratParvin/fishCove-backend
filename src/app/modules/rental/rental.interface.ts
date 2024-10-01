import { Types } from 'mongoose';

export type TRental = {
  userId: Types.ObjectId;
  bikeId: Types.ObjectId;
  startTime: Date;
  returnTime?: Date;
  totalCost?: number;
  isReturned?: boolean;
  paymentStatus?: 'paid' | 'advanced';
  transactionId?: string;
};
