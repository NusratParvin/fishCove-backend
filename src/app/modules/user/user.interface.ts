import { Model, Types } from 'mongoose';
import { USER_ROLE } from './user.constants';

export type TUserRole = keyof typeof USER_ROLE;

export type TUser = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  phone: string;
  address?: string;
  role: TUserRole;
  profilePhoto?: string;
  terms?: boolean;
  followers: string[];
  following: string[];
  articles: string[];
  purchasedArticles: Types.ObjectId[];
};

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;
  isUserExistsById(id: string): Promise<TUser>;
  isPasswordMatched(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}
