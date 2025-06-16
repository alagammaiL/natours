const fs = require('fs');
const Tour = require('./../Model/tourModel');
const e = require('express');
const catchAsync = require('../utils/catchAsync');
const APIfeatures = require('../utils/apiFeatures');
const ErrorApp = require('../utils/appError');
const buildFactory = require('./buildFactory');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ErrorApp('Only image file can upload', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // 1)Cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //2)images Array
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (eachImage, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i}.jpeg`;
      await sharp(eachImage.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});

//controller or handlers
exports.top5tours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingAverage,-price';
  req.query.fields = 'name,ratingAverage,price';
  //console.log('hello', req.query);
  next();
};

exports.getAllTours = buildFactory.getAllFactory(Tour);
exports.createTour = buildFactory.createFactory(Tour);

// exports.checkBody = (req, res, next) => {
//   const { name, price } = req.body;

//   if (!name || !price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'bad request',
//     });
//   }
//   next();
// };

exports.getTour = buildFactory.getOneFactory(Tour, { path: 'reviews' });
exports.updateTour = buildFactory.updateFactory(Tour);
exports.deleteTour = buildFactory.deleteFactory(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { duration: { $gte: 1 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingAverage' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'MEDIUM' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  console.log(distance, lat, lng, unit);
  //divide by earth radius in miles
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 65378.1;
  if (!lat || !lng) {
    next(new ErrorApp('lat and lng must pass', 400));
  }
  //searching within that miles where specifying the lat and lng
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(new ErrorApp('please enter lat longotude', 400));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year} - 01 - 01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          monthTotal: { $sum: 1 },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          monthTotal: -1,
        },
      },
      {
        $limit: 6,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan: plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      data: err,
    });
  }
};
