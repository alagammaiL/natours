const express = require('express');
const ReviewController = require('./../CONTROLLERMVC/reviewController');
const authController = require('./../CONTROLLERMVC/authController');
const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .get(ReviewController.getAllReview)
  .post(
    authController.restrictTo('user'),
    ReviewController.getTourIdAndUser,
    ReviewController.checkedBookedOrNot,
    ReviewController.createReview,
  );
router
  .route('/:id')
  .delete(
    authController.restrictTo('user', 'admin'),
    ReviewController.deleteReview,
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    ReviewController.updateReview,
  )
  .get(ReviewController.getOneReview);
module.exports = router;
