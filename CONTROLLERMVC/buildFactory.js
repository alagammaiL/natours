const catchAsync = require('../utils/catchAsync');
const ErrorApp = require('../utils/appError');
const { Model } = require('mongoose');
const APIfeatures = require('./../utils/apiFeatures');
exports.deleteFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ErrorApp('No documnet found with that id ', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};
exports.updateFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!doc) {
      return next(new ErrorApp('No documnet found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
exports.createFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
exports.getOneFactory = (Model, populateOption) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate('reviews');
    const doc = await query;
    //findOne({_id:req.params.id})
    if (!doc) {
      return next(new ErrorApp('Id not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
exports.getAllFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    //BUILD QUERY
    let filterObj = {};
    if (req.params.tourId) filterObj = { tour: req.params.tourId };
    const apiFeatures = new APIfeatures(Model.find(filterObj), req.query)
      .filter()
      .sorting()
      .limiting()
      .paginate();

    //EXECUTE QUERY
    // const doc = await apiFeatures.query.explain();
    const doc = await apiFeatures.query;
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestAt: req.requestTime,
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
};
