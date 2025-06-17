const fs = require('fs');
const Tour = require('./../../Model/tourModel');
const User = require('./../../Model/userModel');
const Review = require('./../../Model/ReviewModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
console.log(process.env.DATABASE);
// connecting to atlas
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('db connected successfully'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const Users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const Reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);
// console.log(tours);
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(Users, { validateBeforeSave: false });
    await Review.create(Reviews);
    // console.log('mport success');
  } catch (err) {
    console.log('import error', err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('delete success');
  } catch (err) {
    console.log('delete error');
  }
  process.exit();
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
