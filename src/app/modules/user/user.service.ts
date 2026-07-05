/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { User } from './user.model';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import mongoose from 'mongoose';
import { Pet } from '../pets/pets.model';

const getUserFromDB = async (id: string) => {
  const result = await User.findById(id).select('-password');

  return result;
};
const getFriendFromDB = async (id: string) => {
  try {
    console.log('Fetching user...');
    const result = await User.findById(id)
      .select('-password')
      .populate({
        path: 'articles',
        match: { isDeleted: false, isPublish: true }, // Optional: Apply conditions
        // select: 'title content createdAt',
      });

    if (!result) {
      console.log('User not found.');
      return null;
    }

    console.log(result, 'User with articles');
    return result;
  } catch (error) {
    console.error('Error fetching user with articles:', error);
    throw error;
  }
};

const updateUserIntoDB = async (userId: string, payload: Partial<TUser>) => {
  // Find the user to get the current email
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the email is being updated
  if (payload.email && payload.email !== currentUser.email) {
    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true },
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

const getAllUsersFromDB = async () => {
  const users = await User.find().select('-password');
  return users;
};

const deleteUserFromDB = async (userId: string) => {
  console.log(userId);
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No user ID provided');
  }
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return deletedUser;
};

const updateUserRoleInDB = async (userId: string, role: string) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true },
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

const followUserIntoDB = async (
  currentUserId: string,
  targetUserId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the current user and the target user
    const currentUser = await User.findById(currentUserId).session(session);
    const targetUser = await User.findById(targetUserId).session(session);

    // If either user is not found, throw an error
    if (!currentUser || !targetUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if the current user is already following the target user
    const isAlreadyFollowing = currentUser.following.includes(targetUserId);

    if (isAlreadyFollowing) {
      // If already following, remove the targetUserId from the following array
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId,
      );

      // Remove currentUserId from the target user's followers array
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId,
      );
    } else {
      // If not already following, add targetUserId to the following array
      currentUser.following.push(targetUserId);

      // Add currentUserId to the target user's followers array
      targetUser.followers.push(currentUserId);
    }

    // Save both users' data within the session
    await currentUser.save({ session });
    await targetUser.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: isAlreadyFollowing
        ? 'Unfollowed successfully'
        : 'Followed successfully',
    };
  } catch (error) {
    // Abort transaction if there is an error
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction failed');
  }
};

const getMostFollowedAuthorsFromDB = async () => {
  const authors = await User.find().sort({ followers: -1 });
  // .limit(4);
  // .select('name profilePhoto followers articles');
  // console.log(authors);
  return authors;
};

const getUsersByEmirate = async () => {
  const grouped = await User.aggregate([
    { $match: { emirate: { $exists: true } } },
    { $group: { _id: '$emirate', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return grouped.map((g) => ({ emirate: g._id, count: g.count }));
};

const getSingleUserForAdminFromDB = async (id: string) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const getUserDashboardStatsFromDB = async () => {
  const totalUsers = await User.countDocuments();

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const newThisWeek = await User.countDocuments({
    createdAt: { $gte: startOfWeek },
  });

  const petOwnerIds: any[] = await Pet.distinct('owner', { isDeleted: false });
  const usersWithPetCount = petOwnerIds.length;
  const totalPets = await Pet.countDocuments({ isDeleted: false });

  const percentWithPet = totalUsers
    ? Math.round((usersWithPetCount / totalUsers) * 100)
    : 0;
  const avgPetsPerUser = usersWithPetCount
    ? Math.round((totalPets / usersWithPetCount) * 10) / 10
    : 0;

  const emirateCounts = await getUsersByEmirate();
  const topEmirate = emirateCounts[0] || null;

  const usersWithoutPet = totalUsers - usersWithPetCount;

  return {
    totalUsers,
    newThisWeek,
    percentWithPet,
    avgPetsPerUser,
    topEmirate,
    usersWithoutPet,
  };
};

const getUserStatsFromDB = async () => {
  const totalUsers = await User.countDocuments();

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7);
  const weeklySignups = await User.aggregate([
    { $match: { createdAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$createdAt', unit: 'week' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const petOwnerIds: any[] = await Pet.distinct('owner', { isDeleted: false });
  const usersWithPetCount = petOwnerIds.length;
  const percentWithPet = totalUsers
    ? Math.round((usersWithPetCount / totalUsers) * 100)
    : 0;

  const usersWithArticle = await User.countDocuments({
    'articles.0': { $exists: true },
  });
  const percentWithArticle = totalUsers
    ? Math.round((usersWithArticle / totalUsers) * 100)
    : 0;

  const articleAuthorIds = (
    await User.find({ 'articles.0': { $exists: true } })
      .select('_id')
      .lean()
  ).map((u) => u._id.toString());
  const petOwnerIdStrings = petOwnerIds.map((id) => id.toString());
  const engagedUserIds = new Set([...articleAuthorIds, ...petOwnerIdStrings]);
  const neverEngagedCount = totalUsers - engagedUserIds.size;
  const percentNeverEngaged = totalUsers
    ? Math.round((neverEngagedCount / totalUsers) * 100)
    : 0;

  const usersByEmirate = await getUsersByEmirate();

  return {
    totalUsers,
    percentWithPet,
    userGrowth: weeklySignups.map((w) => ({ week: w._id, count: w.count })),
    engagement: {
      addedPet: percentWithPet,
      postedArticle: percentWithArticle,
      neverEngaged: percentNeverEngaged,
    },
    usersByEmirate,
  };
};

export const UserServices = {
  getUserFromDB,
  getFriendFromDB,
  updateUserIntoDB,
  getAllUsersFromDB,
  deleteUserFromDB,
  updateUserRoleInDB,
  followUserIntoDB,
  getMostFollowedAuthorsFromDB,

  getSingleUserForAdminFromDB,
  getUserDashboardStatsFromDB,
  getUserStatsFromDB,
};
