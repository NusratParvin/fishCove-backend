import { Schema, model } from 'mongoose';
import { TBike } from './bike.interface';

const bikeSchema = new Schema<TBike>(
  {
    name: {
      type: String,
      required: [true, 'Bike Name is required'],
    },
    description: {
      type: String,
      required: [true, 'Bike Description is required'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Bike pricePerHour is required'],
    },
    image: {
      type: String,
      required: [true, 'Bike image is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    cc: {
      type: Number,
      required: [true, 'Bike CC is required'],
    },
    year: {
      type: Number,
      required: [true, 'Bike Year is required'],
    },
    model: {
      type: String,
      required: [true, 'Bike Model is required'],
    },
    brand: {
      type: String,
      required: [true, 'Bike Brand is required'],
    },
  },
  {
    timestamps: false,
  },
);

export const Bike = model<TBike>('bike', bikeSchema);
