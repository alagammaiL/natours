const mongoose = require('mongoose');
const TourModel = require('./tourModel');
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review is mandatory'],
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, 'min is 1'],
      max: [5, 'max is 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review for the tour is needed'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review needed for the user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
//static method
reviewSchema.statics.calcAvgRating = async function (tourId) {
  // console.log(tourId, 'tourId');
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log('stats', stats);
  if (stats.length > 0) {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    // console.log('hee');
    await TourModel.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this point to current review
  this.constructor.calcAvgRating(this.tour);
});
// PRE middleware — get access to the query object
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

// POST middleware — access result and call static method
reviewSchema.post(/^findOneAnd/, async function () {
  //await this.findOne() cannot do here
  if (this.r) {
    await this.r.constructor.calcAvgRating(this.r.tour);
  }
});
const ReviewModal = mongoose.model('ReviewModal', reviewSchema);
module.exports = ReviewModal;
