import { Schema, model } from 'mongoose';
import { TRental } from './rental.interface';

const rentalSchema = new Schema<TRental>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    bikeId: {
      type: Schema.Types.ObjectId,
      ref: 'bike',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    returnTime: {
      type: Date,
      default: null,
    },
    totalCost: {
      type: Number,
      default: 100,
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'advanced'],
      default: 'advanced',
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Rental = model<TRental>('Rental', rentalSchema);
