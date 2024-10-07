import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PaymentService } from './payment.service';

const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid or missing amount',
    });
  }

  // Call the PaymentService to create a payment intent
  const paymentIntent = await PaymentService.createPaymentIntent(amount);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Intent created successfully',
    data: paymentIntent.client_secret, // Send the client secret
  });
});

const confirmPayment = catchAsync(async (req, res) => {
  const { transactionId, articleId, amount, userId, email, authorId } =
    req.body;

  // Validate that the necessary data exists
  if (!transactionId || !articleId || !amount || !userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Missing transaction ID, article ID, amount, or user ID',
    });
  }

  // Process the payment confirmation and store the necessary details in the database
  const payment = await PaymentService.confirmPaymentIntoDB(
    transactionId,
    userId,
    articleId,
    amount,
    email,
    authorId,
  );

  console.log(payment);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: payment,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
};
