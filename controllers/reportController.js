// reportController.js
const Report = require('../models/reportModel');
const asyncHandler = require('../utils/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages');

// Create a new report
exports.createReport = asyncHandler(async (req, res) => {
  const report = new Report(req.body);
  await report.save();
  res.status(STATUS_CODES.CREATED).json({
    message: MESSAGES.REPORT_CREATED_SUCCESSFULLY,
    data: report,
  });
});

// Get a single report by ID
exports.getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      message: MESSAGES.REPORT_NOT_FOUND,
    });
  }
  res.status(STATUS_CODES.OK).json({
    data: report,
  });
});

// Get all reports
exports.getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find();
  res.status(STATUS_CODES.OK).json({
    data: reports,
  });
});

// Update a report by ID
exports.updateReportById = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!report) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      message: MESSAGES.REPORT_NOT_FOUND,
    });
  }
  res.status(STATUS_CODES.OK).json({
    message: MESSAGES.REPORT_UPDATED_SUCCESSFULLY,
    data: report,
  });
});

// Delete a report by ID
exports.deleteReportById = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      message: MESSAGES.REPORT_NOT_FOUND,
    });
  }
  res.status(STATUS_CODES.OK).json({
    message: MESSAGES.REPORT_DELETED_SUCCESSFULLY,
  });
});