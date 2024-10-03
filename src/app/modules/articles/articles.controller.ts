import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { ArticleServices } from './articles.service';

// Create an article
const createArticle = catchAsync(async (req, res) => {
  const authorId = req.user.id;
  console.log(authorId);
  const articleData = {
    authorId,
    ...req.body,
    // title: req.body.title,
    // content: req.body.content,
    // category: req.body.category,
    // images: req.body.images,
    // isPremium: req.body.isPremium,
    // price: req.body.price,
  };
  console.log(articleData, 'controller');
  const result = await ArticleServices.createArticleIntoDB(articleData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article created successfully',
    data: result,
  });
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

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article retrieved successfully',
    data: result,
  });
});

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
  // const userId = req.user.id;
  const { action } = req.body;

  const updatedArticle = await ArticleServices.updateArticleVotesIntoDB(
    articleId,
    action,
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
};
