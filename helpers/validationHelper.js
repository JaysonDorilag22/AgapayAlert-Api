const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  avatar: Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  }).optional(),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }).optional(),
  phoneNo: Joi.string().allow(''),
  current_location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
  }).optional(),
  role: Joi.string().valid('user', 'admin').default('user'),
  preffered_notification: Joi.string().valid('email', 'sms', 'push').default('email'),
  verified: Joi.boolean().default(false),
  verification: Joi.string().allow(''),
});

// Feedback validation schema
const feedbackSchema = Joi.object({
  userId: Joi.string().required(),
  comment: Joi.string().required(),
  ratings: Joi.number().min(1).max(5).required(),
});

// Report validation schema
const reportSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  age: Joi.number().required(),
  type: Joi.string().valid('missing', 'abducted', 'wanted', 'kidnapped').required(),
  last_seen_location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
  }).optional(),
  images: Joi.array().items(Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  })).optional(),
  video: Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  }).optional(),
  description: Joi.string().required(),
  reward: Joi.number().optional(),
  contact_information: Joi.string().required(),
  status: Joi.string().valid('Verified', 'Closed', 'Pending').default('Pending'),
});

// Notification validation schema
const notificationSchema = Joi.object({
  reportId: Joi.string().required(),
  tier: Joi.string().valid('low', 'medium', 'high').required(),
  confirmation: Joi.string().valid('verified', 'not verified').required(),
  description: Joi.string().required(),
});

// Comment validation schema
const commentSchema = Joi.object({
  notificationId: Joi.string().required(),
  userId: Joi.string().required(),
  description: Joi.string().required(),
  images: Joi.array().items(Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  })).optional(),
  video: Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  }).optional(),
});

// ALPR validation schema
const alprSchema = Joi.object({
  reportId: Joi.string().required(),
  model: Joi.string().required(),
  color: Joi.string().required(),
  type: Joi.string().required(),
  plateno: Joi.string().required(),
});

// Chat validation schema
const chatSchema = Joi.object({
  user1: Joi.string().required(),
  user2: Joi.string().required(),
  lastMessage: Joi.string().optional(),
});

// Message validation schema
const messageSchema = Joi.object({
  chatId: Joi.string().required(),
  sender: Joi.string().required(),
  content: Joi.string().required(),
  images: Joi.array().items(Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  })).optional(),
  video: Joi.object({
    public_id: Joi.string().allow(''),
    url: Joi.string().allow(''),
  }).optional(),
});


//reset password
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(4).required(),
  password: Joi.string().min(8).required(),
});

const validateResetPasswordInput = (data) => {
  return resetPasswordSchema.validate(data);
};

module.exports = {
  validateResetPasswordInput,
  userSchema,
  feedbackSchema,
  reportSchema,
  notificationSchema,
  commentSchema,
  alprSchema,
  chatSchema,
  messageSchema,
};