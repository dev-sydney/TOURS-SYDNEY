const catchAsyncErrors = require('./../utils/catchAsyncError');
const Review = require('./../models/reviewsModel');
const factory = require('./handlerFactory');

exports.createTourUserId = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};
exports.createReview = factory.createOne(Review);

exports.getReviews = catchAsyncErrors(async (req, res, next) => {
  let filterObj = {};

  if (req.params.tourId) filterObj = { tour: req.params.tourId };
  const reviews = await Review.find(filterObj);

  res.status(200).json({
    status: 'Success',
    data: {
      reviews,
    },
  });
});
exports.getReview = factory.getOne(Review, { path: 'user' });
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
