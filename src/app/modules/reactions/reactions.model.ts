import { model, Schema } from 'mongoose';
import { REACTION_TYPE, TReaction } from './reactions.interface';

const reactionSchema = new Schema<TReaction>(
  {
    targetType: { type: String, enum: ['Article', 'Post'], required: true },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    reactionType: {
      type: String,
      enum: Object.values(REACTION_TYPE),
      required: true,
    },
  },
  { timestamps: true },
);

reactionSchema.index(
  { targetType: 1, targetId: 1, userId: 1 },
  { unique: true },
);

export const Reaction = model<TReaction>('reaction', reactionSchema);
