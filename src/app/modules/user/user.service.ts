import httpStatus from 'http-status';
import { User } from './user.model';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';

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

export const UserServices = {
  getUserFromDB,
  updateUserIntoDB,
  getAllUsersFromDB,
  deleteUserFromDB,
  updateUserRoleInDB,
};
