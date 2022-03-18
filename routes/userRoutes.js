const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signup);
router.post('/login', authController.signIn);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updatePassword',
  authController.protectRoute,
  authController.updatePassword
);
router.patch('/updateMe', authController.protectRoute, userController.updateMe);
router.get(
  '/me',
  authController.protectRoute,
  userController.getMe,
  userController.getUser
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
