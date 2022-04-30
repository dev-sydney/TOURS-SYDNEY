const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
/////////////////////////////////////////////////////////////////////////////

const router = express.Router();
//params 'tourID' cos we want the client to send along the tour that is being booked
router.get(
  '/checkout-session/:tourID',
  authController.protectRoute,
  bookingController.getCheckoutSession
);

module.exports = router;
