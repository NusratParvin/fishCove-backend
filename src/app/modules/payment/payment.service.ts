import { Stripe } from 'stripe';
import { User } from '../user/user.model';
import { Article } from '../articles/articles.model';
import mongoose from 'mongoose';
import { Payment } from './payment.model';

const stripe = new Stripe(process.env.PAYMENT_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

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

  // Start a session for transaction handling
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Confirm the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    // Find the user and article, attach the session for the transaction
    const user = await User.findById(userId).session(session);
    const article = await Article.findById(articleId).session(session);

    if (!user || !article) {
      throw new Error('User or article not found');
    }

    // Update user's purchasedArticles list
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

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PaymentService = {
  createPaymentIntent,
  confirmPaymentIntoDB,
};
