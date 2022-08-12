const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const toursSchema = new mongoose.Schema(
  {
    name: {
      unique: true,
      required: [true, 'Tour Must Have A Name'],
      type: String,
      trim: true,
      minlength: [10, 'Tour name must contain atleast 10 characters and above'],
      maxlength: [40, 'Tour name must be less than 40 characters'],
    },
    slug: String,
    duration: {
      required: [true, 'Tour Must Have A Duration'],
      type: Number,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour Must Have A Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Must Have A Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour Difficulty must be either easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The least tour rating must be 1.0'],
      max: [5, 'The Max Tour Rating Must Be 5.0'],
      set: (val) => Math.round(val * 10) / 10, //Function runs each time a new value is set for this field
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      required: [true, 'Tour Must Have A Price'],
      type: Number,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'priceDiscount Must less than the actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour Must Have A Summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour Must Have An Image Cover'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    rating: {
      required: [true, 'Tour Must Have A Rating'],
      default: 4.7,
      type: Number,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//CREATING AN INDEX TO IMPROVE THE READ PERFORMANCE
//toursSchema.index({ price: 1 }); //1:Asc___-1:desc
toursSchema.index({ price: 1, ratingsAverage: -1 }); //1:Asc___-1:desc
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });

//CREATING THE VIRTUAL PROPERTIES
toursSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

toursSchema.pre('save', async function (next) {
  this.guides = await User.find({ _id: { $in: this.guides } });
  next();
});
//QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
//AGGREGATION MIDDLEWARE
// toursSchema.pre('aggregate', function (next) {
//   console.log(this.pipeline());
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//Custom validator
//handler for undhandled routes
//Implement the global error handling middleware
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
