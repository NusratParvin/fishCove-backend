import { model, Schema } from 'mongoose';

const insuranceRecommendationLogSchema = new Schema(
  {
    topProvider: {
      type: String,
      required: true,
    },
    petSpecies: {
      type: String,
    },
    budget: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const InsuranceRecommendationLog = model(
  'InsuranceRecommendationLog',
  insuranceRecommendationLogSchema,
);
