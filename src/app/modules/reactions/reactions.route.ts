import express from 'express';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middlewares/auth';
import { ReactionControllers } from './reactions.controller';

const router = express.Router();

router.get('/', auth(USER_ROLE.ADMIN), ReactionControllers.getAllReactions);

// Shared "who reacted" endpoint — used by Post and Article reaction popovers
router.get(
  '/:targetType/:targetId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ReactionControllers.getReactionsForTarget,
);

export const ReactionsRoutes = router;
