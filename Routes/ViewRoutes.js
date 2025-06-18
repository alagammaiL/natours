const express = require('express');
const {
  overview,
  tour,
  login,
  getMyAccount,
  submitData,
  getMyTour,
} = require('./../CONTROLLERMVC/viewController');
const { protect, LoggedInOrNot } = require('./../CONTROLLERMVC/authController');
const {
  createBookingCheckout,
} = require('./../CONTROLLERMVC/bookingController');
const router = express.Router();

router.get('/', createBookingCheckout, LoggedInOrNot, overview);
// router.get('/', LoggedInOrNot, overview);
router.get('/login', LoggedInOrNot, login);
router.get('/tour/:slug', LoggedInOrNot, tour);
router.get('/myAccount', protect, getMyAccount);
router.get('/my-tour', protect, getMyTour);
router.post('/submit-data', protect, submitData);
module.exports = router;
