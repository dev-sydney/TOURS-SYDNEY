const fs = require('fs');

const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appErrors');
const catchAsyncErrors = require('../utils/catchAsyncError');

const factory = require('./handlerFactory');
/////////////////////////////////////////////////
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,ratingsAverage,difficulty';

  next();
};

exports.getAllTours = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fieldLimit()
    .paginate();

  const tours = await features.query;
  //TODO:
  //implement field limiting
  //implement pagination

  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: tours,
  });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createNewTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
// exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour)
//     return next(new AppError('Could not find any tour with that ID', 404));

//   res.status(204).json({
//     data: null,
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        results: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsyncErrors(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: { plan },
  });
});
