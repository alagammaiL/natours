const catchAsync = require('./../utils/catchAsync');
const Apperror = require('./../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./../Model/BookingModel');
const Review = require('./../Model/ReviewModel');
const Tour = require('./../Model/tourModel');
const {
  createFactory,
  updateFactory,
  deleteFactory,
  getAllFactory,
  getOneFactory,
} = require('./../CONTROLLERMVC/buildFactory');
const User = require('../Model/userModel');
const ErrorApp = require('./../utils/appError');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log('tour.imageCover', tour.imageCover);
  //2)create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // ✅ REQUIRED when using price_data
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tour`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    metadata: {
      price: tour.price,
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // price in cents
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  //3)create session as response
  res.status(200).json({
    status: 'success',
    session: session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //this is only temporary bcoz unsecure everyone can make bookings without payment
//   const { user, tour, price } = req.query;
//   if (!user && !tour && !price) return next();
//   await Booking.create({ user, tour, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });
async function createBookingCheckout(session) {
  console.log('❤️ entering createBookingCheckout');
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.metadata?.price;
  console.log('price,tour,user', price, tour, user);
  await Booking.create({ user, tour, price });
}
exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  console.log('🔔 Webhook hit!', process.env.STRIPE_WEBHOOK_SECRET);
  let event;
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    // throw new Error(
    //   'STRIPE_WEBHOOK_SECRET is undefined. Check Railway and redeploy.',
    // );
    return next(
      new ErrorApp(
        'STRIPE_WEBHOOK_SECRET is undefined. Check Railway and redeploy.',
        400,
      ),
    );
  }
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log('✅ Event verified:', event.type);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Do something with session
      await createBookingCheckout(session);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(
      '❌ Webhook Error:',
      err.message,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    res
      .status(400)
      .send(
        `webhook error ${err.message} ${process.env.STRIPE_WEBHOOK_SECRET}`,
      );
  }
};
exports.getBooking = getAllFactory(Booking);
exports.getOneBooking = getOneFactory(Booking);
exports.createBooking = createFactory(Booking);
exports.updateBooking = updateFactory(Booking);
exports.deleteBooking = deleteFactory(Booking);
