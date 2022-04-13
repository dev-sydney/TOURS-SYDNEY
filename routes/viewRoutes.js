const express = require('express');

const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.isLoggedIn);

router.get('/login', viewsController.getLoginForm);

router.get('/', viewsController.getOverview);
router.get('/tour/:tourSlug', viewsController.getTour);

module.exports = router;
