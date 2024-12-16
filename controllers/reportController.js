const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const axios = require("axios");
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 11, 
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Invalid file type for images"), false);
      }
    } else if (file.fieldname === "video") {
      if (!file.mimetype.startsWith("video/")) {
        return cb(new Error("Invalid file type for video"), false);
      }
    }
    cb(null, true);
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

// Create a new report
exports.createReport = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    try {
      console.log("Body:", req.body); 

      const { reporter, missingPerson, category } = req.body;
      const images = req.files["images"] || [];
      const video = req.files["video"] ? req.files["video"][0] : null;

      console.log("Reporter:", reporter);
      console.log("Missing Person:", missingPerson);
      console.log("Category:", category);
      console.log(
        "Images:",
        images.map((image) => image.originalname)
      );
      console.log("Video:", video ? video.originalname : "No video uploaded");

      // Upload images to Cloudinary if present
      const imageUploadResults = await Promise.all(
        images.map(async (image) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "report_images" },
              (error, result) => {
                if (error) reject(error);
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url,
                });
              }
            );
            uploadStream.end(image.buffer);
          });
        })
      );
      console.log("Image Upload Results:", imageUploadResults);

      // Upload video to Cloudinary if present
      const videoUploadResult = video
        ? await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "report_videos", resource_type: "video" },
              (error, result) => {
                if (error) reject(error);
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url,
                });
              }
            );
            uploadStream.end(video.buffer);
          })
        : null;
      console.log("Video Upload Result:", videoUploadResult);

      // Create new report
      const report = await Report.create({
        reporter,
        missingPerson,
        images: imageUploadResults,
        video: videoUploadResult,
        category,
      });

      // Notify admin users via OneSignal
      const adminUsers = await User.find({ role: "admin" });
      const adminUserIds = adminUsers.map((user) => user._id.toString());

      const notificationMessage = `
        New report created:
        Name: ${missingPerson.firstname} ${missingPerson.lastname}
        Age: ${missingPerson.age}
        Last Known Location: ${missingPerson.lastKnownLocation}
        Last Seen: ${missingPerson.lastSeen}
      `;

      const oneSignalNotification = {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: adminUserIds,
        headings: { en: "New Report Created" },
        contents: { en: notificationMessage },
        data: { reportId: report._id },
      };

      try {
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          oneSignalNotification,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.ONESIGNAL_API_KEY}`,
            },
          }
        );
        console.log("OneSignal response:", response.data);
        console.log(
          "Notification sent to admin users:",
          adminUsers.map((user) => user.email)
        );
      } catch (error) {
        console.error(
          "Error sending push notification:",
          error.response ? error.response.data : error.message
        );
      }

      res.status(STATUS_CODES.CREATED).json(report);
      console.log("Report created:", report);
    } catch (error) {
      console.error("Error creating report:", error);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to create report" });
    }
  });
});

// Get all reports by the current user
exports.getReportsByCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id; 
    const reports = await Report.find({ reporter: userId }).populate(
      "reporter"
    );
    res.status(STATUS_CODES.OK).json(reports);
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Get a single report by ID
exports.getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: MESSAGES.REPORT_NOT_FOUND });
  }

  res.status(STATUS_CODES.OK).json(report);
});

// Get all reports
exports.getAllReports = asyncHandler(async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(STATUS_CODES.OK).json({
      status: "success",
      data: {
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update a report by ID
exports.updateReportById = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    try {
      const { reporter, missingPerson, category } = req.body;
      const images = req.files["images"] || [];
      const video = req.files["video"] ? req.files["video"][0] : null;

      console.log("Reporter:", reporter);
      console.log("Missing Person:", missingPerson);
      console.log("Category:", category);
      console.log(
        "Images:",
        images.map((image) => image.originalname)
      );
      console.log("Video:", video ? video.originalname : "No video uploaded");

      const report = await Report.findById(req.params.id);

      if (!report) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.REPORT_NOT_FOUND });
      }

      const imageUploadResults = await Promise.all(
        images.map(async (image) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "report_images" },
              (error, result) => {
                if (error) reject(error);
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url,
                });
              }
            );
            uploadStream.end(image.buffer);
          });
        })
      );

      const videoUploadResult = video
        ? await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "report_videos", resource_type: "video" },
              (error, result) => {
                if (error) reject(error);
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url,
                });
              }
            );
            uploadStream.end(video.buffer);
          })
        : null;
      console.log("Video Upload Result:", videoUploadResult);

      report.reporter = reporter || report.reporter;
      report.missingPerson = {
        ...report.missingPerson,
        ...missingPerson,
      };
      report.images = imageUploadResults.length
        ? imageUploadResults
        : report.images;
      report.video = videoUploadResult ? videoUploadResult : report.video;
      report.category = category || report.category;

      await report.save();

      res.status(STATUS_CODES.OK).json(report);
      console.log("Report updated:", report);
    } catch (error) {
      console.error("Error updating report:", error);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to update report" });
    }
  });
});

// Delete a report by ID
exports.deleteReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: MESSAGES.REPORT_NOT_FOUND });
  }

  await report.deleteOne();

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.REPORT_DELETED });
});

// Placeholder for postReportToFacebook and deleteReportFromFacebook
exports.postReportToFacebook = (req, res) => {
  res.status(STATUS_CODES.NOT_IMPLEMENTED).json({ message: "Not implemented" });
};

exports.deleteReportFromFacebook = (req, res) => {
  res.status(STATUS_CODES.NOT_IMPLEMENTED).json({ message: "Not implemented" });
};

exports.updateReportStatus = asyncHandler(async (req, res, next) => {
  try {
    const { id: reportId } = req.params;
    const { status } = req.body;

    if (!reportId) {
      return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Report ID is required",
      });
    }

    const validStatuses = ["Pending", "Confirmed", "Solved"];
    if (!validStatuses.includes(status)) {
      return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid status value",
      });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Report not found",
      });
    }

    res.status(STATUS_CODES.OK).json({
      status: "success",
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
});
