import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TLoginUser } from './auth.interface';
import { User } from '../user/user.model';
import { createJwtToken } from './auth.utils';
import config from '../../config';
import { TUser } from '../user/user.interface';

const signUp = async (payload: TUser) => {
  const userExists = await User.isUserExistsByEmail(payload.email);

  if (userExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const result = await User.create(payload);
  const user = result.toJSON();

  return user;
};

const login = async (payload: TLoginUser) => {
  //   console.log(payload);
  const userExists = await User.isUserExistsByEmail(payload.email);

  if (!userExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    userExists.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match!');
  }
  // if (!userExists._id) {
  //   throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'User ID not found');
  // }
  const jwtPayload = {
    email: userExists.email,
    id: userExists._id as string,
    role: userExists.role,
  };

  const accessToken = createJwtToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  // console.log(accessToken);
  const refreshToken = createJwtToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
    userExists,
  };
};

export const AuthServices = {
  signUp,
  login,
};
