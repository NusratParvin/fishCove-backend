import { Stripe } from 'stripe';
import { User } from '../user/user.model';
import { Article } from '../articles/articles.model';
import mongoose from 'mongoose';
import { Payment } from './payment.model';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

const stripe = new Stripe(process.env.PAYMENT_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const getAllPaymentsFromDB = async () => {
  const payments = await Payment.find();
  return payments;
};

const createPaymentIntent = async (amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  return paymentIntent;
};

const confirmPaymentIntoDB = async (
  transactionId: string,
  userId: string,
  articleId: string,
  amount: number,
  email: string,
  authorId: string,
) => {
  console.log(transactionId, userId, articleId, amount, email, authorId);
  if (typeof transactionId !== 'string') {
    throw new Error('transactionId must be a string');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    const user = await User.findById(userId).session(session);
    const article = await Article.findById(articleId).session(session);

    if (!user || !article) {
      throw new Error('User or article not found');
    }

    if (article.isPremium) {
      user.purchasedArticles.push(article._id);
      await user.save({ session });
    }

    // Create a new payment record
    const payment = await Payment.create(
      [
        {
          transactionId,
          userId,
          articleId,
          amount,
          email,
          status: 'completed',
          authorId,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deletePaymentFromDB = async (transactionId: string) => {
  console.log(transactionId);
  if (!transactionId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No transaction ID provided');
  }
  const deletedUser = await Payment.findByIdAndDelete(transactionId);

  if (!deletedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  return deletedUser;
};

export const PaymentService = {
  createPaymentIntent,
  confirmPaymentIntoDB,
  getAllPaymentsFromDB,
  deletePaymentFromDB,
};
