const axios = require('axios');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/notificationModel');
require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

console.log('OneSignal App ID:', ONESIGNAL_APP_ID);
console.log('OneSignal API Key:', ONESIGNAL_API_KEY);

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, message, confirmation, tier, reportId } = req.body;

  if (!reportId) {
    throw { statusCode: STATUS_CODES.BAD_REQUEST, message: 'Report ID is required' };
  }

  const report = await Report.findById(reportId);
  if (!report || report.status !== 'Confirmed') {
    throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.REPORT_NOT_FOUND };
  }

  const notificationMessage = `
    Name: ${report.missingPerson.firstname} ${report.missingPerson.lastname}
    Age: ${report.missingPerson.age}
    Last Known Location: ${report.missingPerson.lastKnownLocation}
    Last Known Clothing: ${report.missingPerson.lastKnownClothing}
    Last Seen: ${report.missingPerson.lastSeen}
  `;

  const users = await User.find({
    preferred_notifications: 'push',
  });

  console.log('Users found:', users);

  if (users.length === 0) {
    console.log('No users found for notifications.');
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'No users found for notifications.' });
  }

  const userIds = users.map(user => user._id.toString());
  const userDetails = users.map(user => ({
    name: `${user.firstname} ${user.lastname}`,
    city: user.address.city.trim(),
  }));

  const notification = new Notification({
    reportId: report._id,
    tier: tier || 'high',
    confirmation: confirmation || 'verified',
    description: notificationMessage,
    images: report.missingPerson.images,
  });

  await notification.save();

  const imageUrl = report.missingPerson.images.length > 0 ? report.missingPerson.images[0].url : null;

  const oneSignalNotification = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["All"],
    headings: { en: title },
    contents: { en: notificationMessage },
    data: { reportId: report._id, images: report.missingPerson.images },
    big_picture: imageUrl, // For Android
    ios_attachments: { id1: imageUrl }, // For iOS
  };

  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      oneSignalNotification,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ONESIGNAL_API_KEY}`,
        },
      }
    );
    console.log('OneSignal response:', response.data);
  } catch (error) {
    console.error('Error sending push notification:', error.response ? error.response.data : error.message);
    return res.status(STATUS_CODES.FORBIDDEN).json({
      message: 'Failed to send push notification',
      error: error.response ? error.response.data : error.message,
      headers: error.response ? error.response.headers : {},
      status: error.response ? error.response.status : 'Unknown status',
      statusText: error.response ? error.response.statusText : 'Unknown status text',
    });
  }

  res.status(STATUS_CODES.CREATED).json({
    message: MESSAGES.NOTIFICATION_CREATED,
    notification,
    users: userDetails,
  });
});