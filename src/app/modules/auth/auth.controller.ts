import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import config from '../../config';
import AppError from '../../errors/AppError';

// const signUp = catchAsync(async (req, res) => {
//   const result = await AuthServices.signUp(req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'User registered successfully',
//     data: result,
//   });
// });

const signUp = catchAsync(async (req, res) => {
  // const { name, email, password, phone, address, profilePhoto, terms } =
  //   req.body;

  const userData = {
    ...req.body,
    followers: [],
    following: [],
    articles: [],
  };

  const result = await AuthServices.signUp(userData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { accessToken, refreshToken, userExists } = await AuthServices.login(
    req.body,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    // secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  // console.log(userExists);
  // const loggedInUser = {
  //   _id: userExists._id,
  //   name: userExists.name,
  //   email: userExists.email,
  //   phone: userExists.phone,
  //   address: userExists.address,
  //   role: userExists.role,
  // };

  // sendResponse(res, {
  //   statusCode: httpStatus.OK,
  //   success: true,
  //   message: 'User is logged in successfully!',
  //   data: {
  //     accessToken,
  //     refreshToken,
  //   },
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    token: accessToken,
    data: userExists,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const userEmail = req.body.email;
  // console.log(userEmail);
  const result = await AuthServices.forgetPassword(userEmail);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log(token);

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token missing or invalid!');
  }

  const result = await AuthServices.resetPassword(req.body, token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

export const AuthControllers = {
  signUp,
  login,
  changePassword,
  forgetPassword,
  resetPassword,
};
