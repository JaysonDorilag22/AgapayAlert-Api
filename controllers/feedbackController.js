// feedbackController.js
const Feedback = require("../models/feedbackModel");
const MESSAGES = require("../constants/messages");
const STATUS_CODES = require("../constants/statusCodes");
const asyncHandler = require("../utils/asyncHandler");
const { successHandler } = require("../utils/successHandler");


exports.addFeedback = asyncHandler(async (req, res) => {
    const { userId, comment, ratings } = req.body;

    if (!userId) {
        throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.USER_ID_REQUIRED };
    }
    const feedback = new Feedback({
        userId,
        comment,
        ratings,
    });

    const createdFeedback = await feedback.save();
    successHandler(res, STATUS_CODES.CREATED, MESSAGES.FEEDBACK_ADDED, createdFeedback);
});

exports.getFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
        throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.FEEDBACK_NOT_FOUND };
    }
    successHandler(res, STATUS_CODES.OK, MESSAGES.FEEDBACK_FETCHED, feedback);
});


exports.getFeedbacks = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find();
    successHandler(res, STATUS_CODES.OK, MESSAGES.FEEDBACKS_FETCHED, feedbacks);
});

exports.updateFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
        throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.FEEDBACK_NOT_FOUND };
    }
    feedback.comment = req.body.comment || feedback.comment;
    feedback.ratings = req.body.ratings || feedback.ratings;
    const updatedFeedback = await feedback.save();
    successHandler(res, STATUS_CODES.OK, MESSAGES.FEEDBACK_UPDATED, updatedFeedback);
});

exports.deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
        throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.FEEDBACK_NOT_FOUND };
    }
    await feedback.deleteOne();
    successHandler(res, STATUS_CODES.OK, MESSAGES.FEEDBACK_DELETED);
});





