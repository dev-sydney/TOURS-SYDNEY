const mongoose = require('mongoose');
const Tour = require('./toursModel');

// review/ rating/ createdAt/ ref to user & tour
const reviewsSchema = new mongoose.Schema(
  {
    review: String,
    rating: {
      type: Number,
      min: [1, 'Rating must not be lesser than 1.0'],
      max: [5, 'Rating cannot be greater than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviewsSchema.pre(/^find/, function (next) {
//   this.populate('user');

//   next();
// });
reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  //This function is ONLY available on the Review model & NOT the doc itself
  //THIS here points to the current model
  const stats = await this.aggregate([
    {
      //1st STAGE
      $match: { tour: tourId }, //filter obj
    },
    {
      //2nd STAGE
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewsSchema.post('save', function (next) {
  //THIS here points to the current review
  this.constructor.calcAverageRatings(this.tour);
});
const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;
