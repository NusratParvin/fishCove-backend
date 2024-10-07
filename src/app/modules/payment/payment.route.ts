import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

router.post(
  '/create-payment-intent',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PaymentController.createPaymentIntent,
);
router.post(
  '/confirm-payment',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PaymentController.confirmPayment,
);

export const PaymentRoutes = router;
