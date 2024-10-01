import { Stripe } from 'stripe';

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

const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string,
) => {
  // Ensure paymentIntentId and paymentMethodId are strings
  if (
    typeof paymentIntentId !== 'string' ||
    typeof paymentMethodId !== 'string'
  ) {
    throw new Error('Both paymentIntentId and paymentMethodId must be strings');
  }

  // Make the API request to Stripe
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });

  return paymentIntent;
};

export const PaymentService = {
  createPaymentIntent,
  confirmPayment,
};
