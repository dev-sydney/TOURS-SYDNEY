const mongoose = require('mongoose');
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
const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;
