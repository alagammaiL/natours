const ErrorApp = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../Model/tourModel');
const User = require('./../Model/userModel');
const Booking = require('./../Model/BookingModel');
exports.overview = catchAsync(async (req, res, next) => {
  //getting all tour from Tour collection

  const tours = await Tour.find();
  //Now pass the pass data into the template
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});
exports.tour = catchAsync(async (req, res, next) => {
  const tourData = await Tour.findOne({ slugs: req.params.slug }).populate({
    path: 'reviews',
    fields: 'rating user review',
  });
  // console.log('tourData', tourData);
  if (!tourData) {
    return next(new ErrorApp('There is no tour name with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tourData.name} tour`,
    tour: tourData,
  });
});
exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});
exports.getMyAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('about_me', {
    title: 'aboutme',
  });
});
exports.submitData = catchAsync(async (req, res, next) => {
  // console.log('hello', req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      runValidators: true,
      new: true,
    },
  );
  res.status(200).render('about_me', {
    title: 'updated',
    user: updatedUser,
  });
});

exports.getMyTour = catchAsync(async (req, res, next) => {
  //find all the bookings for user
  console.log('sadasd', req.user.id);
  if (!req.user) {
    return next(new ErrorApp('authorized error', 401));
  }
  const bookings = await Booking.find({ user: req.user.id });
  //find tour with the return id
  // console.log('bookingss', bookings);
  const tourIds = bookings.map((el) => el.tour);
  // console.log('tourIds', tourIds);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  // console.log('tours', tours);
  res.status(200).render('overview', {
    title: 'my tour',
    tours,
  });
});
