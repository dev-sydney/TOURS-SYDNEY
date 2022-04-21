const path = require('path');

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const toursRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewsRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appErrors');
const errorController = require('./controllers/errorController');
const req = require('express/lib/request');

const app = express();
//SETTING UP PUG IN EXPRESS
//By first defing the view engine which well be using
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//SERVE THE STATIC ASSETS
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//SET SECURITY HTTP HEADERS
app.use(helmet());

//lIMIT REQUEST FROM THE SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //60 min here
  message: 'Too many requests from this IP please try again in an hour',
});
app.use('/api', limiter);

//BODY PARSER, Reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

//THE MIDDLEWARE BELOW PARSES THE DATA FROM THE URL-ENCODED HTML FORM
app.use(express.urlencoded({ extended: true }));
//COOKIE PARSER, Reading data from the cookie into req.cookie
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
//PARAMTER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// app.use((req, res, next) => {
//   console.log(`This is the cookie${req.cookies}`);
//   next();
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', function (req, res, next) {
  next(new AppError(`Can't Find ${req.originalUrl} On This Server...`, 404));
});

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorController);
//make the above its own module
//create a function that tackles the repetition of the catch blocks and move it into the utils
//The error status code to be more robust for different errors
module.exports = app;
