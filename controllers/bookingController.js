const Tour = require('./../models/toursModel');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const AppError = require('./../utils/appErrors');
const APIFeatures = require('./../utils/apiFeatures');
const Booking = require('./../models/bookingsModel');

const handlerFactory = require('./../controllers/handlerFactory');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  //1. GEt the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  //2.creeate the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`, //This url will get called(user gets redirected to it) as soon a CC has been successfully charged
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //Basically the page the client will be redirected to if they choose to cancel payment
    customer_email: req.user.email,
    client_reference_id: req.params.tourID, //This field allows us to pass in some data about the session we currently creating
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    metadata: {
      name: `${tour.name} Tour`,
      description: tour.summary,
    },
    mode: 'payment',
  });
  //3. send it to the client
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsyncErrors(async (req, res, next) => {
  const { user, tour, price } = req.query;
  if (!user && !price && !tour) return next();
  await Booking.create({ tour: tour, user: user, price: price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = catchAsyncErrors(async (req, res, next) => {
  const { user, tour, price } = req.body;
  if (!user || !price || !tour)
    return next(new AppError('Missing price,user or tour', 400));
  const booking = await Booking.create({ user, tour, price });

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
  next();
});

exports.getBookings = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .filter()
    .sort()
    .fieldLimit()
    .paginate();

  const docs = await features.query;

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: docs,
  });
});
exports.deleteBooking = catchAsyncErrors(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.bookingID);

  if (!booking)
    return next(new AppError('Theres no booking with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
/*
line_items: [
      {
        name: `${tour.name} Tour`,
        amount: tour.price * 100, // price expected in CENTS so we multiply by 100
        currency: 'usd',
        quantity: 1,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      },
    ],
*/
