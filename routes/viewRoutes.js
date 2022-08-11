const express = require('express');

const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignUpForm);
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get('/ME', authController.protectRoute, viewsController.displayAccount);

router.get(
  '/my-tours',
  //bookingController.createBookingCheckout,
  authController.protectRoute,
  viewsController.getMyTours
);

router.post(
  '/submit-user-data',
  authController.protectRoute,
  viewsController.updateUserData
);

module.exports = router;
