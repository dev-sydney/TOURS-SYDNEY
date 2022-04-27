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
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
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
router
  .route('/monthly-plan/:year')
  .get(
    authController.protectRoute,
    authController.restrictTo('lead-guide', 'admin', 'guide'),
    getMonthlyPlan
  );
//GEO-SPATIAL ROUTE FOR GETTING TOURS WITHIN A RADIUS
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

//GEO-SPATIAL ROUTE FOR CALCULATING DISTANCES
//latlng is the coordinate of the user here
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protectRoute,
    authController.restrictTo('lead-guide', 'admin'),
    createNewTour
  );

router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protectRoute,
    authController.restrictTo('lead-guide', 'admin'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('lead-guide', 'admin'),
    deleteTour
  );

module.exports = router;
