import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BikeServices } from './bike.service';
import AppError from '../../errors/AppError';

const createBike = catchAsync(async (req, res) => {
  const bikeData = req.body;
  const result = await BikeServices.createBikeIntoDB(bikeData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bike added successfully',
    data: result,
  });
});

const getAllBike = catchAsync(async (req, res) => {
  const result = await BikeServices.getAllBikeFromDB();
  if (result.length === 0) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'No Data Found',
      data: result,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bikes retrieved successfully',
    data: result,
  });
});

const getSingleBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BikeServices.getSingleBikeFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bike retrieved successfully',
    data: result,
  });
});

const updateBike = catchAsync(async (req, res) => {
  const bikeId = req.params.id;
  const updateData = req.body;
  const updatedBike = await BikeServices.updateBikeIntoDB(bikeId, updateData);
  console.log(bikeId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bike updated successfully',
    data: updatedBike,
  });
});

const deleteBike = catchAsync(async (req, res) => {
  const bikeId = req.params.id;
  const deletedBike = await BikeServices.deleteBikeFromDB(bikeId);

  if (!deletedBike) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bike not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bike deleted successfully',
    data: deletedBike,
  });
});

export const BikeControllers = {
  createBike,
  getAllBike,
  getSingleBike,
  updateBike,
  deleteBike,
};
