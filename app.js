//core module &third party module impot
const express = require('express');
const path = require('path');
const app = express();
const AppError = require('./utils/appError');
const tourRouter = require('./Routes/TourRoutes');
const userRouter = require('./Routes/UserRoutes');
const reviewRouter = require('./Routes/ReviewRoutes');
const bookingRouter = require('./Routes/BookingRoutes');
const errorController = require('./CONTROLLERMVC/errorController');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const viewRouter = require('./Routes/ViewRoutes');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
console.log('dirname', __dirname);
//console.log(process.env.NODE_ENV);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//middleware serving static files
// app.use(express.static(`${__dirname}/public`));
app.enable('trust proxy');
app.use(express.static(path.join(__dirname, 'public')));
//global middleware
//set security http headers middleware
// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});
app.use(compression());
//development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//body parser,reading data from body to req.body
//allow to parse the request less than 10kb
app.use(express.json({ limit: '10kb' })); //middleware
app.use(cookieParser());
//1)data sanitization against nosql query injection
app.use(mongoSanitize());
//2)data sanitization against XSS cross site attack
app.use(xss());
//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingQuantity',
      'maxGroupSize',
      'price',
      'difficulty',
    ],
  }),
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip Please try again after an hour',
});
//limit request from same api
app.use('/api', limiter);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  // //console.log(req.headers);
  next();
});
//routing middleware

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);
app.all('*', (req, res, next) => {
  // const err = new Error(`not found ${req.originalUrl} path`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`not found ${req.originalUrl} path`, 404));
});
//global error handling middleware automatically when there is 4 params express identify it
app.use(errorController);
module.exports = app;
