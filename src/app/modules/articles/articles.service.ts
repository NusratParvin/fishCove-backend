import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Article } from './articles.model';
import { TArticle, TVoteType } from './articles.interface';
import { User } from '../user/user.model';
import mongoose, { Types } from 'mongoose';

const createArticleIntoDB = async (payload: TArticle, userId: string) => {
  const articleData = { ...payload, authorId: userId };
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const article = await Article.create([articleData], { session });
    if (!article || article.length === 0) {
      throw new Error('Article creation failed');
    }

    const articleId = article[0]._id;

    await User.findByIdAndUpdate(
      userId,
      { $push: { articles: articleId } },
      { session, new: true },
    );

    await session.commitTransaction();

    return article[0];
  } catch (error) {
    console.error('Error creating article:', error);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllArticlesFromDB = async () => {
  const result = await Article.find().populate({
    path: 'authorId',
    select: 'name profilePhoto followers',
  });
  return result;
};

// Get a single article by ID
const getSingleArticleFromDB = async (articleId: string) => {
  const article = await Article.findById(articleId)
    .populate({
      path: 'comments',
      model: 'Comment',
      select:
        'content commenter upvotes downvotes createdAt updatedAt voteInfo',
    })
    .populate({
      path: 'authorId',
      select: 'name profilePhoto followers following ',
    });
  // .exec();

  // const article = await Article.findById(articleId).populate;
  // .populate({
  //   path: 'authorId',
  //   select: 'name profilePhoto followers',
  // });
  // .populate('comments');
  // if ((article?.comments?.length || 0) > 0) {
  //   await article?.populate(
  //     comments,
  //     // path: 'comments',
  //     // populate: {
  //     //   path: 'commenter',
  //     // },
  //   );
  // }
  console.log(article, 'service');
  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  return article;
};

const updateArticleVotesIntoDB = async (
  articleId: string,
  action: TVoteType,
  userId: string,
) => {
  const article = await Article.findById(articleId);

  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
  }

  const existingVote = article.voteInfo.find(
    (vote) => vote.userId.toString() === userId,
  );

  // If user has already voted
  if (existingVote) {
    if (existingVote.voteType === action) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already cast this vote',
      );
    } else {
      if (action === 'upvote') {
        article.upvotes += 1;
        article.downvotes -= 1;
      } else if (action === 'downvote') {
        article.downvotes += 1;
        article.upvotes -= 1;
      }

      existingVote.voteType = action;
    }
  } else {
    if (action === 'upvote') {
      article.upvotes += 1;
    } else if (action === 'downvote') {
      article.downvotes += 1;
    }

    article.voteInfo.push({
      userId: new Types.ObjectId(userId),
      voteType: action,
    });
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
  // Check if the article exists
  const isArticleExists = await Article.findById(articleId);

  if (!isArticleExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  // If isPremium is set to false, set price to 0
  if (updateData.isPremium === false) {
    updateData.price = 0;
  }

  console.log('Update Data:', updateData, 'bhbmnbmbn,n,m'); // Debugging - Log updateData

  try {
    // Update the article
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validators run on update
      },
    );

    if (!updatedArticle) {
      throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Update Failed');
    }

    return updatedArticle;
  } catch (error) {
    console.error('Update Error:', error); // Debugging - Log errors
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Update Failed');
  }
};

// Update publish status of an article
const updatePublishArticleIntoDB = async (
  articleId: string,
  isPublish: boolean,
) => {
  const isArticleExists = await Article.findById(articleId);
  console.log(isPublish, 'check');
  if (!isArticleExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const updateData: Partial<TArticle> = {
    isPublish: isPublish,
  };

  console.log('  Publish Status:', updateData);

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedArticle) {
      throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Publish Update Failed');
    }

    return updatedArticle;
  } catch (error) {
    console.error('Publish   Error:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Publish Update Failed',
    );
  }
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

const getMyArticlesFromDB = async (userId: string) => {
  const articles = await Article.find({ authorId: userId }).populate({
    path: 'authorId',
    select: 'name profilePhoto followers',
  });
  console.log(articles);
  if (!articles || articles.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No articles found for this user');
  }

  return articles;
  // return false;
};

const getArticlesByFollowingFromDB = async (userId: string) => {
  const user = await User.findById(userId).select('following');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const followingIds = user.following;

  const articles = await Article.find({
    authorId: { $in: followingIds },
  }).populate('authorId', 'name profilePhoto followers');

  if (!articles.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No articles found from followed users',
    );
  }

  return articles;
};

export const ArticleServices = {
  createArticleIntoDB,
  getAllArticlesFromDB,
  getSingleArticleFromDB,
  updateArticleIntoDB,
  updatePublishArticleIntoDB,
  deleteArticleFromDB,
  getAuthorsByMostFollowers,
  getDashboardFeed,
  updateArticleVotesIntoDB,
  getMyArticlesFromDB,
  getArticlesByFollowingFromDB,
};
