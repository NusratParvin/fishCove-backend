import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReactionServices } from './reactions.service';
import { REACTION_TYPE, TTargetType } from './reactions.interface';

const getAllReactions = catchAsync(async (req, res) => {
  const result = await ReactionServices.getAllReactionsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Reactions retrieved successfully',
    data: result,
  });
});

// GET /reactions/:targetType/:targetId?type=&page=&limit=
const getReactionsForTarget = catchAsync(async (req, res) => {
  const { targetType, targetId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const reactionType = req.query.type as REACTION_TYPE | undefined;

  const result = await ReactionServices.getReactionsForTargetFromDB(
    targetType as TTargetType,
    targetId,
    page,
    limit,
    reactionType,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reactions retrieved successfully',
    data: result,
  });
});

export const ReactionControllers = {
  getAllReactions,
  getReactionsForTarget,
};
