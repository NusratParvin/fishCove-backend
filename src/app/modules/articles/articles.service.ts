import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Article } from './articles.model';
import { TArticle } from './articles.interface';
import { User } from '../user/user.model';

// Create an article
const createArticleIntoDB = async (payload: TArticle) => {
  console.log(payload);
  const result = await Article.create(payload);
  return result;
};

// Get all articles (for the feed)
const getAllArticlesFromDB = async () => {
  // const result = await Article.find();
  const result = await Article.find().populate({
    path: 'authorId',
    select: 'name profilePhoto',
  });
  return result;
};

// Get a single article by ID
const getSingleArticleFromDB = async (
  articleId: string,
): Promise<TArticle | null> => {
  const article = await Article.findById(articleId).populate('authorId');

  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  return article;
};

const updateArticleVotesIntoDB = async (
  articleId: string,
  action: 'upvote' | 'downvote',
) => {
  const article = await Article.findById(articleId);

  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
  }

  if (action === 'upvote') {
    article.upvotes += 1;
  } else if (action === 'downvote') {
    article.downvotes += 1;
  }

  const updatedArticle = await article.save();

  if (!updatedArticle) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Vote update failed');
  }

  return updatedArticle;
};

// Update an article
const updateArticleIntoDB = async (
  articleId: string,
  updateData: Partial<TArticle>,
) => {
  const isArticleExists = await Article.findById(articleId);

  if (!isArticleExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const updatedArticle = await Article.findByIdAndUpdate(
    articleId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedArticle) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Update Failed');
  }

  return updatedArticle;
};

// Delete an article
const deleteArticleFromDB = async (articleId: string) => {
  const isArticleExists = await Article.findById(articleId);

  if (!isArticleExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const deletedArticle = await Article.deleteOne({ _id: articleId });

  if (!deletedArticle) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Delete Failed');
  }
  return deletedArticle;
};

// Get authors sorted by most followers
const getAuthorsByMostFollowers = async () => {
  const result = await User.find().sort({ followers: -1 }).limit(10);

  return result;
};

// Get dashboard feed (articles + authors sorted by followers)
const getDashboardFeed = async () => {
  const articles = await Article.find().populate('authorId');
  const topAuthors = await getAuthorsByMostFollowers();

  return {
    articles,
    topAuthors,
  };
};

export const ArticleServices = {
  createArticleIntoDB,
  getAllArticlesFromDB,
  getSingleArticleFromDB,
  updateArticleIntoDB,
  deleteArticleFromDB,
  getAuthorsByMostFollowers,
  getDashboardFeed,
  updateArticleVotesIntoDB,
};
