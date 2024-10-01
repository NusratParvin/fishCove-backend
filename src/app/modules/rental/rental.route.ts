import express from 'express';
import auth from '../../middlewares/auth';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { RentalValidation } from './rental.validate';
import { RentalControllers } from './rental.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),
  zodValidationRequest(RentalValidation.createRentalValidationSchema),
  RentalControllers.createRental,
);

router.put('/:id/return', auth(USER_ROLE.admin), RentalControllers.returnBike);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),
  RentalControllers.getUserRentals,
);
router.get('/', auth(USER_ROLE.user), RentalControllers.getUserRentals);
router.get('/get', auth(USER_ROLE.admin), RentalControllers.getAllRentals);

router.put(
  '/:id/payments',
  auth(USER_ROLE.user),
  RentalControllers.completeRentalPayment,
);

export const RentalRoutes = router;
