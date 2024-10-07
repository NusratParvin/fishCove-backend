import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { ArticleRoutes } from '../modules/articles/articles.route';
import { CommentRoutes } from '../modules/comments/comments.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/articles', route: ArticleRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/payments', route: PaymentRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
