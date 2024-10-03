import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { ArticleValidation } from './articles.validate';
import { ArticleControllers } from './articles.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(ArticleValidation.createArticleValidationSchema),
  ArticleControllers.createArticle,
);

router.get('/', ArticleControllers.getAllArticles);

router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.getSingleArticle,
);

router.put(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(ArticleValidation.updateArticleValidationSchema),
  ArticleControllers.updateArticle,
);

router.patch(
  '/:id/vote',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.voteArticle,
);

router.delete('/:id', auth(USER_ROLE.ADMIN), ArticleControllers.deleteArticle);

router.get(
  '/dashboard-feed',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.getDashboardFeed,
);

export const ArticleRoutes = router;
