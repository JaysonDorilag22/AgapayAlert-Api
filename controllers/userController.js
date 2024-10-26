const User = require('../models/userModel');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages'); 
const upload = require('../utils/multer');
const asyncHandler = require('../utils/asyncHandler');
const { successHandler } = require("../utils/successHandler");
const {uploadAvatar} = require('../utils/avatarUpload');
const cloudinary = require('../utils/cloudinary');
const paginate = require('../utils/pagination');


// Display users function
exports.displayUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const sort = req.query.sort ? JSON.parse(req.query.sort) : {};
  const filter = req.query.filter ? JSON.parse(req.query.filter) : {};

  const paginationResult = await paginate(User, filter, page, pageSize, 'firstname lastname email verified', sort);

  successHandler(res, STATUS_CODES.OK, 'Users retrieved successfully', {
    page: paginationResult.page,
    pageSize: paginationResult.pageSize,
    totalUsers: paginationResult.totalDocuments,
    totalPages: paginationResult.totalPages,
    users: paginationResult.documents,
  });
});

// Get user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!userId) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.USER_ID_REQUIRED };

  const user = await User.findById(userId, 'firstname lastname email profilePicture address avatar').lean();
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  successHandler(res, STATUS_CODES.OK, 'User profile retrieved successfully', { user });
});

// Edit user information
exports.editUserInfo = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log('Upload Error:', err);
      throw { statusCode: STATUS_CODES.BAD_REQUEST, message: err.message };
    }

    const userId = req.params.id;
    if (!userId) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.USER_ID_REQUIRED };

    const { firstname, lastname, email, address, phoneNo, preferred_notifications } = req.body;

    const validNotifications = ['sms', 'push', 'email'];
    if (preferred_notifications && !preferred_notifications.every(notification => validNotifications.includes(notification))) {
      throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.INVALID_NOTIFICATIONS };
    }

    const user = await User.findById(userId);
    if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

    let newAvatar = user.avatar;
    if (req.file) {
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
      const uploadResult = await uploadAvatar(req.file);
      newAvatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
      };
    }

    const fieldsToUpdate = { firstname, lastname, email, address, phoneNo, preferred_notifications, avatar: newAvatar };
    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field] !== undefined) {
        user[field] = fieldsToUpdate[field];
      }
    });

    await user.save();
    successHandler(res, STATUS_CODES.OK, 'User information updated successfully', { user });
  });
});

// Delete user account
exports.deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!userId) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.USER_ID_REQUIRED };

  const user = await User.findByIdAndDelete(userId).lean();
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  successHandler(res, STATUS_CODES.OK, MESSAGES.DELETED_SUCCESSFULLY);
});