const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { userSchema } = require('../helpers/validationHelper');
const { createToken, setTokenCookie } = require('../helpers/tokenHelper');
const cloudinary = require('../config/cloudinaryConfig');
const upload = require('../config/multer');
const STATUS_CODES = require('../constants/statusCodes');

exports.signup = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
    }

    const { firstname, lastname, email, password, address } = req.body;

    const { error } = userSchema.validate({ firstname, lastname, email, password, address });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.details[0].message });
    }

    try {
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
      const user = new User({ firstname, lastname, email, password: hashedPassword, avatar: avatarData, address });
      await user.save();

      const token = createToken(user);
      setTokenCookie(res, token);
      res.status(STATUS_CODES.CREATED).json({ user, token });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
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
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};