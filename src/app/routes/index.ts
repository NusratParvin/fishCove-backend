import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { BikeRoutes } from '../modules/bike/bike.route';
import { UserRoutes } from '../modules/user/user.route';
import { RentalRoutes } from '../modules/rental/rental.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/bikes', route: BikeRoutes },
  { path: '/rentals', route: RentalRoutes },
  { path: '/rentals', route: RentalRoutes },
  { path: '/payments', route: PaymentRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
