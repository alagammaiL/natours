const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
);
//controller or handlers

exports.getAllTours = (req, res) => {
  //console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours: tours,
    },
  });
};
exports.createTour = (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  //console.log(newId);
  const newTour = { ...req.body, id: newId };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    },
  );
};
exports.checkId = (req, res, next, val) => {
  if (val * 1 > tours.length) {
    res.status(404).json({
      status: 'failure',
      message: 'Invalid Id',
    });
  }
  next();
};
exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'bad request',
    });
  }
  next();
};

exports.getTour = (req, res) => {
  //console.log(req.params.id);
  const id = req.params.id * 1; //convert string to number
  const tour = tours.find((el) => el.id === id);
  //console.log(tour);
  //1st way where id not found
  if (!tour) {
    res.status(404).json({
      status: 'failure',
      message: 'Invalid Id',
    });
  }
  //2nd way where id not found
  if (req.params.id * 1 > tours.length) {
    res.status(404).json({
      status: 'failure',
      message: 'Invalid Id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours: tour,
    },
  });
};
exports.updateTour = (req, res) => {
  //console.log(req.params.id);
  //console.log(req.body);
  const Update = req.body;
  const id = req.params.id * 1; //convert string to number
  const tourId = tours.findIndex((el) => el.id === id);
  tours[tourId].duration = Update.duration;
  // //console.log(tours);

  //2nd way where id not found
  if (id > tours.length) {
    res.status(404).json({
      status: 'failure',
      message: 'Invalid Id',
    });
  }
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tours: tours[tourId],
        },
      });
    },
  );
};
exports.deleteTour = (req, res) => {
  //console.log(req.params.id);
  const id = req.params.id * 1;
  const tour = tours.filter((item) => item.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tour),
    'utf-8',
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );
};
