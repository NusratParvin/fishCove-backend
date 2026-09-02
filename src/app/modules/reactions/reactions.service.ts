import mongoose, { Model } from 'mongoose';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Reaction } from './reactions.model';
import { REACTION_TYPE, TTargetType } from './reactions.interface';

const getAllReactionsFromDB = async () => {
  const reactions = await Reaction.find();
  if (!reactions || reactions.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No reactions found');
  }
  return reactions;
};

// Generic toggle/replace, used by any module with a reactionSummary field
// (Post, Article, ...). Caller passes its own Model to avoid a circular
// import between reactions <-> posts <-> articles.
const toggleReactionInDB = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TargetModel: Model<any>,
  targetType: TTargetType,
  targetId: string,
  userId: string,
  reactionType: REACTION_TYPE,
) => {
  const target = await TargetModel.findById(targetId);
  if (!target) {
    throw new AppError(httpStatus.NOT_FOUND, `${targetType} not found`);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existing = await Reaction.findOne({
      targetType,
      targetId,
      userId,
    }).session(session);

    let action: 'added' | 'removed' | 'changed';

    if (!existing) {
      await Reaction.create([{ targetType, targetId, userId, reactionType }], {
        session,
      });
      await TargetModel.findByIdAndUpdate(
        targetId,
        { $inc: { [`reactionSummary.${reactionType}`]: 1 } },
        { session },
      );
      action = 'added';
    } else if (existing.reactionType === reactionType) {
      // Same reaction clicked again → un-react
      await existing.deleteOne({ session });
      await TargetModel.findByIdAndUpdate(
        targetId,
        { $inc: { [`reactionSummary.${reactionType}`]: -1 } },
        { session },
      );
      action = 'removed';
    } else {
      // Different reaction clicked → replace
      const oldType = existing.reactionType;
      existing.reactionType = reactionType;
      await existing.save({ session });
      await TargetModel.findByIdAndUpdate(
        targetId,
        {
          $inc: {
            [`reactionSummary.${oldType}`]: -1,
            [`reactionSummary.${reactionType}`]: 1,
          },
        },
        { session },
      );
      action = 'changed';
    }

    await session.commitTransaction();
    return { action, reactionType: action === 'removed' ? null : reactionType };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// "Who reacted" list — paginated, optionally filtered to one reaction type
const getReactionsForTargetFromDB = async (
  targetType: TTargetType,
  targetId: string,
  page = 1,
  limit = 20,
  reactionType?: REACTION_TYPE,
) => {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { targetType, targetId };
  if (reactionType) filter.reactionType = reactionType;

  const [reactions, total] = await Promise.all([
    Reaction.find(filter)
      .populate({ path: 'userId', select: 'name profilePhoto' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reaction.countDocuments(filter),
  ]);

  return { reactions, total, page, limit };
};

// Batch lookup — "what did THIS user react with" for a page of feed items,
// so the frontend can highlight the active emoji without one query per post.
const getMyReactionsForTargetsFromDB = async (
  targetType: TTargetType,
  targetIds: string[],
  userId: string,
) => {
  const reactions = await Reaction.find({
    targetType,
    targetId: { $in: targetIds },
    userId,
  }).select('targetId reactionType');

  return reactions.reduce(
    (acc, r) => {
      acc[r.targetId.toString()] = r.reactionType;
      return acc;
    },
    {} as Record<string, REACTION_TYPE>,
  );
};

export const ReactionServices = {
  getAllReactionsFromDB,
  toggleReactionInDB,
  getReactionsForTargetFromDB,
  getMyReactionsForTargetsFromDB,
};
