import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const getUser = catchAsync(async (req, res) => {
  const { id } = req.user;
  console.log(id);
  const result = await UserServices.getUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const { id } = req.user;

  const { _id, role, ...updatedData } = req.body;
  console.log(_id, role);

  const result = await UserServices.updateUserIntoDB(id, updatedData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await UserServices.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: 'User deleted successfully',
    data: deletedUser,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const updatedUser = await UserServices.updateUserRoleInDB(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User role updated to ${role} successfully`,
    data: updatedUser,
  });
});

const followUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const followUserId = req.params.id;
  console.log(followUserId);

  const result = await UserServices.followUserIntoDB(userId, followUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

export const UserControllers = {
  getUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  followUser,
};
