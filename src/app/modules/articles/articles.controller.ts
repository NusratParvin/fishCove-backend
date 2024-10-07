import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { ArticleServices } from './articles.service';

const createArticle = catchAsync(async (req, res) => {
  const authorId = req.user.id;

  const articleData = {
    ...req.body,
  };

  console.log(articleData, authorId, 'Controller ');

  const result = await ArticleServices.createArticleIntoDB(
    articleData,
    authorId,
  );

  console.log(result, 'Article Created');

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Article created successfully',
      data: result,
    });
  }
});

// Get all articles
const getAllArticles = catchAsync(async (req, res) => {
  const result = await ArticleServices.getAllArticlesFromDB();
  if (result.length === 0) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'No articles found',
      data: result,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Articles retrieved successfully',
    data: result,
  });
});

// Get a single article
const getSingleArticle = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ArticleServices.getSingleArticleFromDB(id);
  // console.log(result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article retrieved successfully',
    data: result,
  });
});

const getMyArticles = catchAsync(async (req, res) => {
  const userId = req.user.id;
  // console.log(userId);
  const result = await ArticleServices.getMyArticlesFromDB(userId);
  if (result.length) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'MY Articles fetched successfully',
      data: result,
    });
  }
});

const getFollowingArticles = catchAsync(async (req, res) => {
  const userId = req.user.id;
  // console.log(userId);
  const articles = await ArticleServices.getArticlesByFollowingFromDB(userId);
  // console.log(articles.length);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Articles from followed users fetched successfully',
    data: articles,
  });
});

// const getFollowingArticles = catchAsync(async (req, res) => {
//   const userId = req.user.id;
//   console.log(userId);
//   const articles = await ArticleServices.getArticlesByFollowingFromDB(userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Articles from followed users fetched successfully',
//     data: articles,
//   });
// });

// Update an article
const updateArticle = catchAsync(async (req, res) => {
  const articleId = req.params.id;
  const updateData = req.body;
  const updatedArticle = await ArticleServices.updateArticleIntoDB(
    articleId,
    updateData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article updated successfully',
    data: updatedArticle,
  });
});

const voteArticle = catchAsync(async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.id;
  const { action } = req.body;

  const updatedArticle = await ArticleServices.updateArticleVotesIntoDB(
    articleId,
    action,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vote updated successfully',
    data: updatedArticle,
  });
});

// Delete an article
const deleteArticle = catchAsync(async (req, res) => {
  const articleId = req.params.id;
  const deletedArticle = await ArticleServices.deleteArticleFromDB(articleId);

  if (!deletedArticle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article deleted successfully',
    data: deletedArticle,
  });
});

// Get dashboard feed (articles + most followed authors)
const getDashboardFeed = catchAsync(async (req, res) => {
  const result = await ArticleServices.getDashboardFeed();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard feed retrieved successfully',
    data: result,
  });
});

export const ArticleControllers = {
  createArticle,
  getAllArticles,
  getSingleArticle,
  updateArticle,
  deleteArticle,
  getDashboardFeed,
  voteArticle,
  getMyArticles,
  getFollowingArticles,
};
