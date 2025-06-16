const express = require('express');
const authController = require('./../CONTROLLERMVC/authController');
const Controller = require('./../CONTROLLERMVC/bookingController');
const router = express.Router();
router.use(authController.protect);
router.get(
  '/checkout-session/:tourId',

  Controller.getCheckoutSession,
);
router.use(authController.restrictTo('admin', 'lead-guide'));
router.route('/').get(Controller.getBooking).post(Controller.createBooking);
router
  .route('/:id')
  .get(Controller.getOneBooking)
  .patch(Controller.updateBooking)
  .delete(Controller.deleteBooking);
module.exports = router;
