import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TRental } from './rental.interface';
import { Rental } from './rental.model';
import { Bike } from '../bike/bike.model';
import mongoose, { Types } from 'mongoose';
import { TPayment } from '../payment/payment.interface';
import { Payment } from '../payment/payment.model';

const createRentalIntoDB = async (
  userId: string,
  payload: TRental,
  transactionId: string,
) => {
  // Check if the bike exists and is available
  const bike = await Bike.findById(payload.bikeId);
  if (!bike) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  } else if (!bike.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Bike not available');
  }

  const userIdObjectId = new Types.ObjectId(userId);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Update bike availability status
    const rentedBike = await Bike.findByIdAndUpdate(
      bike._id,
      { isAvailable: false },
      { session, new: true },
    );
    if (!rentedBike) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Failed to update bike's availability`,
      );
    }

    // Create rental with payment status set to "advanced" initially
    const rentalData = {
      userId: userIdObjectId,
      bikeId: payload.bikeId,
      startTime: payload.startTime,
      returnTime: payload.returnTime || null,
      totalCost: 100,
      isReturned: false,
      paymentStatus: 'advanced',
      transactionId: transactionId,
    };

    const rentalResult = await Rental.create([rentalData], { session });

    // Create payment record for the advanced payment
    const paymentData: TPayment = {
      userId: userIdObjectId,
      amount: 100,
      paymentMethod: 'card',
      paymentDate: new Date(),
      paymentStatus: 'pending',
      transactionId: transactionId,
      rentalId: rentalResult[0]._id,
    };

    const paymentResult = await Payment.create([paymentData], { session });

    if (!paymentResult) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Failed to create payment record`,
      );
    }

    await session.commitTransaction();
    session.endSession();

    return rentalResult;
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

const getUserRentalsFromDB = async (userId: string) => {
  const rentals = await Rental.find({ userId }).populate({
    path: 'bikeId',
    select: 'name image',
  });

  if (rentals.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No rentals found for this user');
  }

  return rentals;
};

const getAllRentalsFromDB = async () => {
  const rentals = await Rental.find()
    .populate({
      path: 'bikeId',
      select: 'name',
    })
    .populate({
      path: 'userId',
      select: 'name email',
    });

  if (rentals.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No rentals found for this user');
  }

  return rentals;
};

const returnBikeIntoDB = async (rentalId: string, returnTime: Date) => {
  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid rental ID');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the rental details
    const rental = await Rental.findById(rentalId).session(session);
    if (!rental) {
      throw new AppError(httpStatus.NOT_FOUND, 'Rental info not found');
    }

    if (rental.isReturned) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Bike is already returned');
    }

    const bike = await Bike.findById(rental.bikeId).session(session);
    if (!bike) {
      throw new AppError(httpStatus.NOT_FOUND, 'Bike not found');
    }

    // Calculate the rental duration in hours
    const rentalDuration =
      (returnTime.getTime() - rental.startTime.getTime()) / (1000 * 60 * 60);

    // Calculate the total cost
    const totalCost = Number((rentalDuration * bike.pricePerHour).toFixed(2));

    let paymentStatus = rental.paymentStatus;

    if (totalCost <= 100) {
      paymentStatus = 'paid';
    }

    // const updatedRental = await Rental.findByIdAndUpdate(
    //   rentalId,
    //   {
    //     returnTime,
    //     totalCost,
    //     isReturned: true,
    //   },
    //   { session, new: true },
    // );
    const updatedRental = await Rental.findByIdAndUpdate(
      rentalId,
      {
        returnTime,
        totalCost,
        isReturned: true,
        paymentStatus: paymentStatus,
      },
      { session, new: true },
    );

    await Bike.findByIdAndUpdate(
      rental.bikeId,
      { isAvailable: true },
      { session, new: true },
    );

    await session.commitTransaction();
    session.endSession();

    return updatedRental;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to return bike',
    );
  }
};

// const returnBikeIntoDB = async (rentalId: string, returnTime: Date) => {
//   const rental = await Rental.findById(rentalId);

//   if (!rental) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Rental info not found');
//   } else if (rental.isReturned) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Bike is already returned');
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Calculate the total cost
//     const returnTime = new Date();
//     const rentalDuration =
//       (returnTime.getTime() - rental.startTime.getTime()) / (1000 * 60 * 60);
//     const bike = await Bike.findById(rental.bikeId).session(session);
//     if (!bike) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Bike not found');
//     }
//     const totalCost = Number((rentalDuration * bike.pricePerHour).toFixed(2));

//     // Update rental and bike availability
//     await Rental.findByIdAndUpdate(
//       rentalId,
//       {
//         returnTime,
//         totalCost,
//         isReturned: true,
//       },
//       { session, new: true },
//     );

//     await Bike.findByIdAndUpdate(
//       rental.bikeId,
//       { isAvailable: true },
//       { session, new: true },
//     );

//     await session.commitTransaction();
//     session.endSession();

//     const updatedRental = await Rental.findById(rentalId);

//     return updatedRental;
//   } catch (error: any) {
//     await session.abortTransaction();
//     session.endSession();
//     throw new Error(error);
//   }
// };

const completeRentalPaymentIntoDB = async (
  rentalId: string,
  paymentData: {
    transactionId: string;
    amount: number;
    bikeId: string;
    userId: string;
    email: string;
  },
) => {
  const rental = await Rental.findById(rentalId);

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental not found');
  }

  if (rental.paymentStatus === 'paid') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Rental is already fully paid');
  }

  // Find and update the existing payment record, or create a new one if it doesn't exist
  const updatedPaymentRecord = await Payment.findOneAndUpdate(
    {
      rentalId: rental._id,
      userId: paymentData.userId,
      // bikeId: paymentData.bikeId,
      transactionId: paymentData.transactionId,
    },
    {
      $inc: { amount: paymentData.amount },
      paymentStatus: 'completed',
      paymentDate: new Date(),
    },
    { new: true, upsert: true },
  );

  // Update the rental payment status
  rental.paymentStatus = 'paid';
  await rental.save();

  return updatedPaymentRecord;
};

export const RentalServices = {
  createRentalIntoDB,
  getUserRentalsFromDB,
  getAllRentalsFromDB,
  returnBikeIntoDB,
  completeRentalPaymentIntoDB,
};
