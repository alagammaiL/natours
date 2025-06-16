const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is mandatory'],
      unique: true,
      trim: true,
      maxlength: [40, 'name should be 40 or less than 40 characters'],
      minlength: [10, 'name should be 10 or more than 10 characters'],
      // validate: [validator.isAlpha, 'no space,no number only text'],
    },
    secret_tour: {
      type: Boolean,
      default: false,
    },
    slugs: String,
    duration: {
      type: Number,
      required: [true, 'Duration is mandatory'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'groupsize is mandatory'],
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is mandatory'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty value either easy,medium or difficult',
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is mandatory'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'priceDiscount ({VALUE}) should be less than price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'greter that 1'],
      max: [5.0, 'less than 5'],
      set: (val) => Math.round(val * 10) / 10, //4.7777=>47.777=>48=>48/10=>4.8
    },

    summary: {
      type: String,
      required: [true, 'Summary is mandatory'],
      trim: true,
    },
    description: {
      type: String,

      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'imageCover is mandatory'],
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //geojson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //longitude,latitude =>but in maps pos=>latitude ,longitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], //longitude,latitude =>but in maps pos=>latitude ,longitude
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'ReviewModal',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slugs: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//this document middleware call right before the document get save and document get created
tourSchema.pre('save', function (next) {
  this.slugs = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre('save', function (next) {
  //console.log('2nd middleware');
  next();
});
// tourSchema.pre('save', async function (next) {
//   const userPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(userPromises);
//   next();
// });
tourSchema.post('save', function (doc, next) {
  //console.log(doc);
  next();
});

tourSchema.pre(/^find/, function (next) {
  //here this pointing to query
  this.find({ secret_tour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  //console.log('post find hook', Date.now() - this.start);
  next();
});
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secret_tour: {
//         $ne: true,
//       },
//     },
//   });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
// const testTour = new Tour({
//   name: 'ada',
//   price: 6000,
// });
// testTour
//   .save()
//   .then((doc) => //console.log(doc))
//   .catch((err) => //console.log(err));
module.exports = Tour;
