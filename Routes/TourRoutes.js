const express = require('express');
const reviewController = require('./../CONTROLLERMVC/reviewController');
const authController = require('../CONTROLLERMVC/authController');
//console.log('heyy', __dirname);
const Controller = require('../CONTROLLERMVC/tourController');
const reviewRouter = require('./ReviewRoutes');
const router = express.Router();
router.use('/:tourId/review', reviewRouter);
router.route('/top-5-tours').get(Controller.top5tours, Controller.getAllTours);
// /tours-within/300/center/-40,50/unit/miles
//we are searching from certain point ,in certain range
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(Controller.getToursWithin);
//we are calculating the distance from specific point for all tour
router.route('/distances/:latlng/unit/:unit').get(Controller.getDistance);
router.route('/tour-Stats').get(Controller.getTourStats);
router.route('/monthly-plan/:year').get(Controller.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, Controller.getAllTours)
  .post(Controller.createTour);
router
  .route('/:id')
  .get(Controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    Controller.uploadTourImages,
    Controller.resizeTourImages,
    Controller.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    Controller.deleteTour,
  );

module.exports = router;
