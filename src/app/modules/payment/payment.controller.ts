import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PaymentService } from './payment.service';

const getAllPayments = catchAsync(async (req, res) => {
  const payments = await PaymentService.getAllPaymentsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: payments,
  });
});

const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid or missing amount',
    });
  }

  const paymentIntent = await PaymentService.createPaymentIntent(amount);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Intent created successfully',
    data: paymentIntent.client_secret,
  });
});

const confirmPayment = catchAsync(async (req, res) => {
  const { transactionId, articleId, amount, userId, email, authorId } =
    req.body;

  if (!transactionId || !articleId || !amount || !userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Missing transaction ID, article ID, amount, or user ID',
    });
  }

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

const deletePayment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await PaymentService.deletePaymentFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: 'Transaction deleted successfully',
    data: deletedUser,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
  deletePayment,
};
