import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { AuthValidation } from './auth.validate';
import { AuthControllers } from './auth.controller';
import { userValidation } from '../user/user.validate';

const router = express.Router();

router.post(
  '/signup',
  zodValidationRequest(userValidation.createUserSchema),
  AuthControllers.signUp,
);

router.post(
  '/login',
  zodValidationRequest(AuthValidation.loginValidationSchema),

  AuthControllers.login,
);

export const AuthRoutes = router;
