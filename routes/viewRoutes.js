const express = require('express');

const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get('/ME', authController.protectRoute, viewsController.displayAccount);

router.post(
  '/submit-user-data',
  authController.protectRoute,
  viewsController.updateUserData
);

module.exports = router;
