const Tour = require('./../models/toursModel');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const AppError = require('./../utils/appErrors');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  //1. GEt the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  //2.creeate the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`, //This url will get called(user gets redirected to it) as soon a CC has been successfully charged
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //Basically the page the client will be redirected to if they choose to cancel payment
    customer_email: req.user.email,
    client_reference_id: req.params.tourID, //This field allows us to pass in some data about the session we currently creating
    line_items: [
      {
        name: `${tour.name} Tour`,
        amount: tour.price * 100, // price expected in CENTS so we multiply by 100
        currency: 'usd',
        quantity: 1,
      },
    ],
    metadata: {
      name: `${tour.name} Tour`,
      description: tour.summary,
      images: `https://www.natours.dev/img/tours/${tour.imageCover}`,
    },
    mode: 'payment',
  });
  //3. send it to the client
  res.status(200).json({
    status: 'success',
    session,
  });
});
