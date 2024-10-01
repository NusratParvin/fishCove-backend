import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PaymentService } from './payment.service';

const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;
  console.log(amount);
  if (amount <= 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid amount',
    });
  }

  const paymentIntent = await PaymentService.createPaymentIntent(amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Intent created successfully',
    // data: { clientSecret: paymentIntent. },
    data: paymentIntent.client_secret,
  });
});

const confirmPayment = catchAsync(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  if (!paymentIntentId || !paymentMethodId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Missing payment intent ID or payment method ID',
    });
  }

  // Confirm the payment intent with the payment method ID
  const paymentIntent = await PaymentService.confirmPayment(
    paymentIntentId,
    paymentMethodId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: paymentIntent,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
};
