import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { ArticleRoutes } from '../modules/articles/articles.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/articles', route: ArticleRoutes },
  // { path: '/rentals', route: RentalRoutes },
  // { path: '/rentals', route: RentalRoutes },
  { path: '/payments', route: PaymentRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
