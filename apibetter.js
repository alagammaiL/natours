const fs = require('fs');
const Tour = require('./../Model/tourModel');
const e = require('express');
//controller or handlers
exports.top5tours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingAverage,-price';
  req.query.fields = 'name,ratingAverage,price';
  //console.log('hello', req.query);
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //console.log('req', req.query);
    //BUILD QUERY

    const queryObj = { ...req.query };
    //filtering

    const rejectFields = ['sort', 'page', 'limit', 'fields'];
    rejectFields.forEach((element) => delete queryObj[element]);

    //advanced filtering
    //Tour.find({difficutly:easy,duration:{$gte:5}})
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|lt|gte|lte)\b/g,
      (value) => `$${value}`,
    );
    //console.log(JSON.parse(queryString));
    let query = Tour.find(JSON.parse(queryString));
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    //SORTING
    if (req.query.sort) {
      let sortString = req.query.sort.split(',').join(' ');
      //console.log(sortString);
      query = query.sort(sortString);
    } else {
      query = query.sort('-createdAt');
    }
    //Limiting the fields

    if (req.query.fields) {
      let fieldString = req.query.fields.split(',').join(' ');
      //console.log(fieldString);
      query = query.select(fieldString);
    } else {
      query = query.select('-__v');
    }

    //PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // //console.log(skip);
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const totalNumOfDocuments = await Tour.countDocuments();
      // //console.log(totalNumOfDocuments);
      if (skip >= totalNumOfDocuments) throw new Error('no records found');
    }

    //EXECUTE QUERY
    const tours = await query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestAt: req.requestTime,
      result: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    // const testTour = new Tour({
    //   name: 'ada',
    //   price: 6000,
    // });
    // testTour
    //   .save()
    //   .then((doc) => //console.log(doc))
    //   .catch((err) => //console.log(err));
    const newTour = await Tour.create(req.body);
    //console.log(newTour);
    res.status(201).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err,
    });
  }
};

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

exports.getTour = async (req, res) => {
  // //console.log(req.params.id);
  // const id = req.params.id * 1; //convert string to number
  try {
    const tour = await Tour.findById(req.params.id);
    //findOne({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tours: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tours: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      data: err,
    });
  }
};
