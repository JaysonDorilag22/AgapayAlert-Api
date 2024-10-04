const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages'); 
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const { handleError } = require('../utils/errorHandler');

// Display users function
exports.displayUsers = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.INVALID_PAGINATION_PARAMETERS });
    }

    const skip = (page - 1) * pageSize;
    const totalUsers = await User.countDocuments();
    const users = await User.find({}, 'firstname lastname email') 
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(STATUS_CODES.OK).json({
      page,
      pageSize,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      users,
    });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.FETCHING_ERROR);
  }
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.USER_ID_REQUIRED });
    }

    const user = await User.findById(userId, 'firstname lastname email profilePicture address').lean();

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    res.status(STATUS_CODES.OK).json({ user });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.FETCHING_ERROR);
  }
});

// Edit user information
exports.editUserInfo = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { firstname, lastname, email, address, phoneNo, preferred_notifications } = req.body;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.USER_ID_REQUIRED });
    }

    // Validate preferred_notifications
    const validNotifications = ['sms', 'push', 'email'];
    if (preferred_notifications && !preferred_notifications.every(notification => validNotifications.includes(notification))) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Invalid preferred notifications' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
      }

      // Handle profile picture update
      let newProfilePictureUrl = user.profilePicture;
      if (req.file) {
        // Delete old profile picture from Cloudinary
        if (user.profilePicture) {
          const publicId = user.profilePicture.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new profile picture to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
        });
        newProfilePictureUrl = uploadResult.secure_url;
      }

      // Update user information
      user.firstname = firstname;
      user.lastname = lastname;
      user.email = email;
      user.profilePicture = newProfilePictureUrl;
      user.address = address;
      user.phoneNo = phoneNo;
      user.preferred_notifications = preferred_notifications;

      await user.save();

      res.status(STATUS_CODES.OK).json({ user });
    } catch (error) {
      handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.UPDATING_ERROR);
    }
  });
});

// Delete user account
exports.deleteUserAccount = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.USER_ID_REQUIRED });
    }

    const deletedUser = await User.findByIdAndDelete(userId).lean();

    if (!deletedUser) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json({ message: 'User account deleted successfully' });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.DELETING_ERROR);
  }
});