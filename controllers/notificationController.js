const axios = require('axios');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/notificationModel');
const twilio = require('twilio');
const { transporter } = require('../utils/sendEmail');
const notificationEmailTemplate = require('../views/notificationEmailTemplate');
require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;


console.log('OneSignal App ID:', ONESIGNAL_APP_ID);
console.log('OneSignal API Key:', ONESIGNAL_API_KEY);

console.log('infoBip API Key:', INFOBIP_API_KEY);
console.log('infoBip Base URL:', INFOBIP_BASE_URL);

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);



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

//ok na to kaso need verify yung number
exports.sendSmsNotification = asyncHandler(async (req, res) => {
  const { title, message, reportId } = req.body;

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
    preferred_notifications: 'sms',
  });

  if (users.length === 0) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'No users found for SMS notifications.' });
  }

  const smsMessages = users
    .filter(user => user.phoneNo) // Ensure phoneNo is not empty
    .map(user => {
      let phoneNumber = user.phoneNo;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+63${phoneNumber.slice(1)}`; // Ensure phone number includes country code
      }
      return {
        to: phoneNumber,
        body: notificationMessage,
        from: TWILIO_PHONE_NUMBER,
      };
    });

  if (smsMessages.length === 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'No valid phone numbers found for SMS notifications.' });
  }

  console.log('SMS Messages:', smsMessages); // Log the SMS messages to verify the phone_number

  try {
    const responses = await Promise.all(smsMessages.map(async (sms) => {
      console.log('Sending SMS to:', sms.to); // Log the phone number being sent
      const response = await client.messages.create(sms);
      return response;
    }));

    console.log('Twilio responses:', responses);

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.NOTIFICATION_CREATED,
      responses,
      users: users.map(user => ({
        name: `${user.firstname} ${user.lastname}`,
        phoneNumber: user.phoneNo,
      })),
    });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to send SMS notification',
      error: error.message,
    });
  }
});


exports.sendSmsNotification = asyncHandler(async (req, res) => {
  const { title, message, reportId } = req.body;

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
    preferred_notifications: 'sms',
  });

  if (users.length === 0) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'No users found for SMS notifications.' });
  }

  const smsMessages = users
    .filter(user => user.phoneNo) // Ensure phoneNo is not empty
    .map(user => ({
      to: user.phoneNo.startsWith('+') ? user.phoneNo : `+63${user.phoneNo.slice(1)}`, // Ensure phone number includes country code
      body: notificationMessage,
      from: TWILIO_PHONE_NUMBER,
    }));

  if (smsMessages.length === 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'No valid phone numbers found for SMS notifications.' });
  }

  console.log('SMS Messages:', smsMessages); // Log the SMS messages to verify the phone_number

  try {
    const responses = await Promise.all(smsMessages.map(async (sms) => {
      console.log('Sending SMS to:', sms.to); // Log the phone number being sent
      const response = await client.messages.create(sms);
      return response;
    }));

    console.log('Twilio responses:', responses);

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.NOTIFICATION_CREATED,
      responses,
      users: users.map(user => ({
        name: `${user.firstname} ${user.lastname}`,
        phoneNumber: user.phoneNo,
      })),
    });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to send SMS notification',
      error: error.message,
    });
  }
});


exports.sendEmailNotification = asyncHandler(async (req, res) => {
  const { title, message, reportId } = req.body;

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

  const imageUrl = report.missingPerson.images.length > 0 ? report.missingPerson.images[0].url : null;

  const users = await User.find({
    preferred_notifications: { $in: ['email'] },
  });

  if (users.length === 0) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'No users found for email notifications.' });
  }

  const emailMessages = users
    .filter(user => user.email) 
    .map(user => ({
      from: '"Agapay Alert" <no-reply@agapayalert.com>',
      to: user.email,
      subject: title,
      html: notificationEmailTemplate(notificationMessage, imageUrl),
    }));

  if (emailMessages.length === 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'No valid email addresses found for email notifications.' });
  }

  console.log('Email Messages:', emailMessages); 
  try {
    const responses = await Promise.all(emailMessages.map(async (email) => {
      console.log('Sending Email to:', email.to); 
      const response = await transporter.sendMail(email);
      return response;
    }));

    console.log('Mailtrap responses:', responses);

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.NOTIFICATION_CREATED,
      responses,
      users: users.map(user => ({
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
      })),
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to send email notification',
      error: error.message,
    });
  }
});

exports.sendInfobipSms = asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Phone number and message are required' });
  }

  const smsPayload = {
    messages: [
      {
        from: 'InfoSMS', // Updated sender ID
        destinations: [{ to }],
        text: message,
      },
    ],
  };

  try {
    const response = await axios.post(
      `${INFOBIP_BASE_URL}/sms/2/text/advanced`,
      smsPayload,
      {
        headers: {
          'Authorization': `App ${INFOBIP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Infobip response:', response.data);
    response.data.messages.forEach(msg => {
      console.log('Message status:', msg.status);
    });
    res.status(STATUS_CODES.OK).json({ message: 'SMS sent successfully', response: response.data });
  } catch (error) {
    console.error('Error sending SMS via Infobip:', error.response ? error.response.data : error.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to send SMS via Infobip',
      error: error.response ? error.response.data : error.message,
    });
  }
});


exports.getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.status(STATUS_CODES.OK).json(notifications);
});