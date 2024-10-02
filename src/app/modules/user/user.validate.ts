import { z } from 'zod';

const createUserSchema = z.object({
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
  address: z.string().optional(),

  profilePhoto: z.string().url({ message: 'Invalid URL' }).optional(),
  terms: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().url({ message: 'Invalid URL' }).optional(),
});

export const userValidation = {
  createUserSchema,
  updateUserSchema,
};
