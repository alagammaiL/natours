const User = require('../Model/userModel');
const ErrorApp = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const buildFactory = require('../CONTROLLERMVC/buildFactory');
const multer = require('multer');
const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
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
exports.userSinglePhotoUpload = upload.single('photo');
//resizing the user image in square format
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
function filterObj(reqvalue, ...acceptedValues) {
  const newObj = {};

  Object.keys(reqvalue).forEach((el) => {
    if (acceptedValues.includes(el)) {
      newObj[el] = reqvalue[el];
    }
  });
  return newObj;
}
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  //console.log('123445', req.user._id);
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('req,body', req.body);
  // console.log('req.file.', req.file);
  //1)create error if try to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ErrorApp(
        'This route is not for password updates,Please use/update-password',
        400,
      ),
    );
  }
  //2)filter the allowed field name that are not allowed to update
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  //3)update user document
  //this filterbody is for not allowing the user to update some fields like role.eg:user cant change to admin
  //allowing the user to update name ,email
  const userUpdate = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: userUpdate,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    message: 'Internal Server Error',
  });
};
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'failure',
//     message: 'Internal Server Error',
//   });
// };
exports.getAllUsers = buildFactory.getAllFactory(User);
exports.getUser = buildFactory.getOneFactory(User);
exports.updateUser = buildFactory.updateFactory(User);
exports.deleteUser = buildFactory.deleteFactory(User);
