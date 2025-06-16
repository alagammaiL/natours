const express = require('express');
const Controller = require('../CONTROLLERMVC/userController');
const AuthController = require('../CONTROLLERMVC/authController');
const router = express.Router();

router.post('/sign-up', AuthController.signUp);
router.post('/sign-in', AuthController.signIn);
router.get('/log-out', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.patch('/reset-password/:token', AuthController.resetPassword);

//protect all routes after this middleware
router.use(AuthController.protect);
router.patch('/update-password', AuthController.updatePassword);
router.get('/me', Controller.getMe, Controller.getUser);
router.patch(
  '/updateMe',
  Controller.userSinglePhotoUpload,
  Controller.resizeUserPhoto,
  Controller.updateMe,
);
router.patch('/deleteMe', Controller.deleteMe);

//admin can access the below routes
router.use(AuthController.restrictTo('admin'));
router.route('/').get(Controller.getAllUsers).post(Controller.createUser);
router
  .route('/:id')
  .get(Controller.getUser)
  .patch(Controller.updateUser)
  .delete(Controller.deleteUser);
module.exports = router;
