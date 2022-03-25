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

//CREATING TOUR DOC
exports.createNewTour = factory.createOne(Tour);

//READING TOUR DOC
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//UPDATING TOUR DOC
exports.updateTour = factory.updateOne(Tour);
// exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour)
//     return next(new AppError('Could not find any tour with that ID', 404));

//   res.status(204).json({
//     data: null,
//   });
// });

//DELETING TOUR DOC
exports.deleteTour = factory.deleteOne(Tour);

//AGGREGATION

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

//
exports.getToursWithin = catchAsyncErrors(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      new AppError(
        'Please provide a latitude and a longitude in the format lat,lng',
        400
      )
    );
  //$geoWithin - used to find documents within a specific geometery
  //To specify that geometery we use $centerSphere (it defines a sphere)
  //mongodb expects the radius to be in a special unit called radians
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  //console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsyncErrors(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide a latitude and a longitude in the format lat,lng',
        400
      )
    );

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    //near is the GEO-SPATIAL point from which to calculate the distances from all the tours
    {
      //1st STAGE
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distances',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distances: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
