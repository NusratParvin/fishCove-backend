import { z } from 'zod';

const createBikeValidationSchema = z.object({
  name: z.string().nonempty({ message: 'Bike Name is required' }),
  description: z.string().nonempty({ message: 'Bike Description is required' }),
  pricePerHour: z
    .number()
    .positive({ message: 'Bike Price per hour must be a positive number' }),
  image: z.string().nonempty({ message: 'Bike image is required' }),
  isAvailable: z.boolean().optional().default(true),
  cc: z.number().positive({
    message: 'Bike Engine capacity (cc) must be a positive number',
  }),
  year: z
    .number()
    .int()
    .positive({ message: 'Bike Year must be a positive integer' }),
  model: z.string().nonempty({ message: 'Bike Model is required' }),
  brand: z.string().nonempty({ message: 'Bike Brand is required' }),
});

// const updateBikeValidationSchema = z.object({
//   name: z.string().nonempty({ message: 'Bike Name is required' }).optional(),
//   description: z
//     .string()
//     .nonempty({ message: 'Bike Description is required' })
//     .optional(),
//   pricePerHour: z
//     .number()
//     .positive({ message: 'Bike Price per hour must be a positive number' })
//     .optional(),
//   isAvailable: z.boolean().optional(),
//   cc: z
//     .number()
//     .positive({
//       message: 'Bike Engine capacity (cc) must be a positive number',
//     })
//     .optional(),
//   year: z
//     .number()
//     .int()
//     .positive({ message: 'Bike Year must be a positive integer' })
//     .optional(),
//   model: z.string().nonempty({ message: 'Bike Model is required' }).optional(),
//   brand: z.string().nonempty({ message: 'Bike Brand is required' }).optional(),
// });

const updateBikeValidationSchema = z.object({
  name: z.string().nonempty({ message: 'Bike Name is required' }).optional(),
  description: z
    .string()
    .nonempty({ message: 'Bike Description is required' })
    .optional(),
  pricePerHour: z
    .number()
    .positive({ message: 'Bike Price per hour must be a positive number' })
    .optional(),
  image: z.string().nonempty({ message: 'Bike image is required' }).optional(), // Ensure image is validated during update
  isAvailable: z.boolean().optional(),
  cc: z
    .number()
    .positive({
      message: 'Bike Engine capacity (cc) must be a positive number',
    })
    .optional(),
  year: z
    .number()
    .int()
    .positive({ message: 'Bike Year must be a positive integer' })
    .optional(),
  model: z.string().nonempty({ message: 'Bike Model is required' }).optional(),
  brand: z.string().nonempty({ message: 'Bike Brand is required' }).optional(),
});

export const BikeValidation = {
  createBikeValidationSchema,
  updateBikeValidationSchema,
};
