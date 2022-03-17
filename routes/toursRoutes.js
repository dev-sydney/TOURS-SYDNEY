const express = require('express');
const {
  getAllTours,
  getTour,
  createNewTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/toursController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewsRoutes');

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protectRoute,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

const router = express.Router();
//RESTED ROUTES WITH EXPRESS
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(authController.protectRoute, getAllTours)
  .post(createNewTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protectRoute,
    authController.restrictTo('lead-guide', 'admin'),
    deleteTour
  );

module.exports = router;
