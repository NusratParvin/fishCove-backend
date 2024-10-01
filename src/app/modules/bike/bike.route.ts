import express from 'express';
import auth from '../../middlewares/auth';
import { BikeControllers } from './bike.controller';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { BikeValidation } from './bike.validate';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(BikeValidation.createBikeValidationSchema),
  BikeControllers.createBike,
);
router.get(
  '/',
  // auth(USER_ROLE.admin, USER_ROLE.user),
  BikeControllers.getAllBike,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  // zodValidationRequest(BikeValidation.updateBikeValidationSchema),
  BikeControllers.getSingleBike,
);

router.put(
  '/:id',

  auth(USER_ROLE.admin),
  zodValidationRequest(BikeValidation.updateBikeValidationSchema),
  BikeControllers.updateBike,
);

router.delete('/:id', auth(USER_ROLE.admin), BikeControllers.deleteBike);

export const BikeRoutes = router;
