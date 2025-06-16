const Review = require('./../Model/ReviewModel');
const buildFactory = require('./buildFactory');
const Booking = require('./../Model/BookingModel');
const ErrorApp = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const catchAsync = require('./../utils/catchAsync');

exports.getTourIdAndUser = (req, res, next) => {
  // console.log('entering or not');
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.checkedBookedOrNot = catchAsync(async (req, res, next) => {
  if (req.body.user && req.body.tour) {
    const booking = await Booking.findOne({
      user: req.body.user,
      tour: req.body.tour,
    });
    if (!booking || !booking.paid)
      return next(new ErrorApp('you need to pay then proceed to review', 400));
    return next();
  }
  return next(new ErrorApp('cant create review', 400));
});
exports.getAllReview = buildFactory.getAllFactory(Review);
exports.deleteReview = buildFactory.deleteFactory(Review);
exports.updateReview = buildFactory.updateFactory(Review);
exports.createReview = buildFactory.createFactory(Review);
exports.getOneReview = buildFactory.getOneFactory(Review);
