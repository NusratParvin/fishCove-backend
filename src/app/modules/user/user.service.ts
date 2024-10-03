import httpStatus from 'http-status';
import { User } from './user.model';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import mongoose from 'mongoose';

const getUserFromDB = async (id: string) => {
  const result = await User.findById(id).select('-password');

  return result;
};

const updateUserIntoDB = async (userId: string, payload: Partial<TUser>) => {
  if (payload.email) {
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
    throw new Error('User not found');
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

const followUserIntoDB = async (userId: string, followUserId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(userId, followUserId);
  try {
    const user = await User.findById(userId).session(session);
    const followUser = await User.findById(followUserId).session(session);

    if (!user || !followUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if user is already following the followUser
    const isFollowing = user.following.includes(followUserId);
    console.log(isFollowing);
    if (isFollowing) {
      user.following = user.following.filter(
        (id) => id.toString() !== followUserId,
      );
      followUser.followers = followUser.followers.filter(
        (id) => id.toString() !== userId,
      );

      console.log(user.following, followUser.followers);
    } else {
      console.log('else');
      user.following.push(followUserId);
      console.log('object already');
      followUser.followers.push(userId);
    }

    await user.save({ session });
    await followUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: isFollowing
        ? 'Unfollowed successfully'
        : 'Followed successfully',
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction failed');
  }
};

export const UserServices = {
  getUserFromDB,
  updateUserIntoDB,
  getAllUsersFromDB,
  deleteUserFromDB,
  updateUserRoleInDB,
  followUserIntoDB,
};
