//start server
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Review = require('./Model/ReviewModel');
process.on('uncaughtException', (err) => {
  console.log('hello', err.name, err.message);
  console.log('uncaughtException');

  process.exit(1);
});
async function fixReviewIndex() {
  try {
    // Drop old index if it exists
    await Review.collection.dropIndex({ tour: 1, user: 1 });
    console.log('Old (possibly non-unique) index dropped');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index not found, skipping drop');
    } else {
      console.error('Error dropping index:', err.message);
    }
  }

  try {
    // Sync index from schema definition (unique)
    await Review.syncIndexes();
    console.log('Review indexes synced (including unique index)');
  } catch (err) {
    console.error('Error syncing indexes:', err.message);
  }
}
dotenv.config({ path: './config.env' });
console.log(process.env);
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
console.log(process.env.DATABASE);
// connecting to atlas
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('db connected successfully');
    fixReviewIndex();
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening to the port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('hello', err.name);
  console.log('unhandledrejection');
  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('receiving sigterm signal');
  server.close(() => {
    console.log('all process will terminated');
  });
});
