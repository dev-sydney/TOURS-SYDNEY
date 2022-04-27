const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('./../controllers/authController');

// const upload = multer({
//   dest: '/public/img/users',
// });

const router = express.Router();

router.post('/signUp', authController.signup);
router.post('/login', authController.signIn);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protectRoute); //PROTECTING ALL THE ROUTES THAT COME AFTER THIS POINT

router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));
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
