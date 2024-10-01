import { z } from 'zod';

const createRentalValidationSchema = z.object({
  bikeId: z.string().nonempty({ message: 'Bike ID is required' }),
  startTime: z
    .string()
    .nonempty({ message: 'Start time is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Expected date, received string',
    }),
  transactionId: z.string().optional(),
  amount: z
    .number()
    .positive({ message: 'Amount must be a positive number' })
    .optional(),
  userId: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
});

export const RentalValidation = {
  createRentalValidationSchema,
};
