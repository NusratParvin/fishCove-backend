import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { USER_ROLE } from './user.constants';
import { TUser, UserModel } from './user.interface';
import config from '../../config';

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(USER_ROLE),
      default: 'user',
    },
    profilePhoto: {
      type: String,
      required: false,
    },
    terms: {
      type: Boolean,
      required: false,
    },
    //   track password change times
    // passwordChangedAt: {
    //   type: Date,
    // },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const user = this;

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email });
};

userSchema.statics.isUserExistsById = async function (id: string) {
  return await User.findById(id);
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model<TUser, UserModel>('user', userSchema);
