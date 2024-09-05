const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { userSchema } = require('../helpers/validationHelper');
const cloudinary = require('../config/cloudinaryConfig');
const upload = require('../config/multer');
const { createToken, setTokenCookie } = require('../helpers/tokenHelper');
const asyncHandler = require('../helpers/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');

// Signup function
exports.signup = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
    }

    const { firstname, lastname, email, password, address } = req.body;

    // Validate the request body against the schema
    const { error } = userSchema.validate({ firstname, lastname, email, password, address });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(STATUS_CODES.CONFLICT).json({ message: 'User already exists' });
    }

    let avatarData = {};
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
      });
      avatarData = {
        public_id: uploadResponse.public_id,
        url: uploadResponse.secure_url,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      avatar: avatarData,
      address,
    });
    await user.save();

    const token = createToken(user);
    setTokenCookie(res, token);
    res.status(STATUS_CODES.CREATED).json({ user, token });
  });
});

// Login function
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user);
  setTokenCookie(res, token);
  res.status(STATUS_CODES.OK).json({ user, token });
});