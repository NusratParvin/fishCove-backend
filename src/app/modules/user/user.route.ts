import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { userValidation } from './user.validate';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
import { USER_ROLE } from './user.constants';

const router = express.Router();

router.get(
  '/me',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  UserControllers.getUser,
);
router.put(
  '/me',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  zodValidationRequest(userValidation.updateUserSchema),
  UserControllers.updateUserProfile,
);

router.get('/', auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);

router.delete('/:id', auth(USER_ROLE.ADMIN), UserControllers.deleteUser);

router.put('/:id', auth(USER_ROLE.ADMIN), UserControllers.updateUserRole);

export const UserRoutes = router;
