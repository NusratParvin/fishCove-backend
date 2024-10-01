import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { userValidation } from './user.validate';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
import { USER_ROLE } from './user.constants';

const router = express.Router();

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUser,
);
router.put(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.user),
  zodValidationRequest(userValidation.updateUserSchema),
  UserControllers.updateUserProfile,
);

router.get('/', auth(USER_ROLE.admin), UserControllers.getAllUsers);

router.delete('/:id', auth(USER_ROLE.admin), UserControllers.deleteUser);

router.put('/:id', auth(USER_ROLE.admin), UserControllers.updateUserRole);

export const UserRoutes = router;
