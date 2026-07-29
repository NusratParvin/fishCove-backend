import { Types } from 'mongoose';

export enum REACTION_TYPE {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export type TReactionSummary = {
  [key in REACTION_TYPE]: number;
};

export type TTargetType = 'Article' | 'Post';

export type TReaction = {
  targetType: TTargetType;
  targetId: Types.ObjectId;
  userId: Types.ObjectId;
  reactionType: REACTION_TYPE;
};
