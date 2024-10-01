import { z } from 'zod';
import { USER_ROLE } from './user.constants';

const createUserSchema = z.object({
  // id: z.string().nonempty({ message: 'Name is required' }),
  name: z.string().nonempty({ message: 'Name is required' }),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .nonempty({ message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .nonempty({ message: 'Password is required' }),
  phone: z.string().nonempty({ message: 'Phone is required' }),
  address: z.string().nonempty({ message: 'Address is required' }),

  role: z.nativeEnum(USER_ROLE),
});

const updateUserSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  // password: z
  //   .string()
  //   .min(6, { message: 'Password must be at least 6 characters long' })
  //   .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const userValidation = {
  createUserSchema,
  updateUserSchema,
};
