const Tour = require('./../models/toursModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingsModel');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const AppError = require('./../utils/appErrors');

exports.getOverview = catchAsyncErrors(async (req, res, next) => {
  //TODO:
  //.1 Get The Tour Data From the Collection
  const tours = await Tour.find();
  //2. Build out the template

  //3.Render out the template using the tour data from 1.
  res.status(200).render('overview', { title: 'All The Tours', tours });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  //TODO:
  //1) Get the data for the requested tour (including the reviews & guides)
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews guides',
    fields: 'reviews rating user',
  });

  if (!tour) return next(new AppError('There is no tour with name!', 404));

  //2) Build the template

  //3)Render the template using the data from 1)
  res
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .status(200)
    .render('tour', {
      title: `${tour.name} tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getMyTours = catchAsyncErrors(async (req, res, next) => {
  //1. Find all bookings
  const bookings = await Booking.find({ user: req.user._id });
  //2. find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.displayAccount = (req, res) => {
  res.status(200).render('accountt', { title: 'Your account' });
};

exports.updateUserData = catchAsyncErrors(async (req, res, next) => {
  //console.log('UPDATING USER', req.body);
  console.log(req.body);
  //UPDATE THE USER DATA IN THE DB
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //SEND BACK THE ACCOUNT INFO PAGE
  res
    .status(200)
    .render('accountt', { title: 'Your account', user: updatedUser });
});

exports.getSignUpForm = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up for free',
  });
};
