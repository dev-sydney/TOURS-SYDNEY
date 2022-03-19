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
//READING REVIEW DOCS
exports.getReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review, { path: 'user' });
//UPDATING DOCS
exports.updateReview = factory.updateOne(Review);

//DELETING DOCS
exports.deleteReview = factory.deleteOne(Review);
