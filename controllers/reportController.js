// reportController.js
const Report = require("../models/reportModel");
const asyncHandler = require("../utils/asyncHandler");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const { uploadImages, uploadVideo } = require("../utils/reportUpload");
const {multipleImagesUpload, videoUpload } = require("../utils/multer");
const axios = require("axios");
const createFacebookMessage = require("../views/facebookMessage");

// Create a new report
exports.createReport = asyncHandler(async (req, res) => {
  multipleImagesUpload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }

    videoUpload(req, res, async (err) => {
      if (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
      }

      try {
        console.log("Body:", req.body); // Log the body of the request

        const { reporter, missingPerson, category } = req.body;
        const images = req.body.missingPerson.images || [];
        const video = req.body.missingPerson.video ? req.body.missingPerson.video[0] : null;

        console.log("Reporter:", reporter);
        console.log("Missing Person:", missingPerson);
        console.log("Category:", category);
        console.log(
          "Images:",
          images.map((image) => image.url.name)
        );
        console.log("Video:", video ? video.url.name : "No video uploaded");

        // Upload images to Cloudinary if present
        const imageUploadResults = images.length > 0 ? await uploadImages(images) : [];
        console.log("Image Upload Results:", imageUploadResults);

        // Upload video to Cloudinary if present
        const videoUploadResult = video ? await uploadVideo(video) : null;
        console.log("Video Upload Result:", videoUploadResult);

        // Create new report
        const report = await Report.create({
          reporter,
          missingPerson: {
            ...missingPerson,
            images: imageUploadResults,
            video: videoUploadResult,
          },
          category,
        });

        res.status(STATUS_CODES.CREATED).json(report);
        console.log("Report created:", report);
      } catch (error) {
        console.error('Error creating report:', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create report' });
      }
    });
  });
});

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
  const reports = await Report.find();

  res.status(STATUS_CODES.OK).json(reports);
});

// Update a report by ID
exports.updateReportById = [ (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: err.message });
      } else if (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    console.log("Files:", req.files); // Log the files being uploaded
    console.log("Body:", req.body); // Log the body of the request

    const { reporter, missingPerson, category } = req.body;
    const images = req.files.images || [];
    const video = req.files.video ? req.files.video[0] : null;

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

    // Upload new images to Cloudinary
    const imageUploadPromises = images.map((image) =>
      cloudinary.uploader.upload(image.path, { folder: "report Images" })
    );
    const imageUploadResults = await Promise.all(imageUploadPromises);

    // Upload new video to Cloudinary
    const videoUploadResult = video
      ? await cloudinary.uploader.upload(video.path, {
          folder: "report Videos",
          resource_type: "video",
        })
      : null;

    report.reporter = reporter || report.reporter;
    report.missingPerson = {
      ...report.missingPerson,
      ...missingPerson,
      images: imageUploadResults.length
        ? imageUploadResults.map((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
          }))
        : report.missingPerson.images,
      video: videoUploadResult
        ? {
            public_id: videoUploadResult.public_id,
            url: videoUploadResult.secure_url,
          }
        : report.missingPerson.video,
    };
    report.category = category || report.category;

    await report.save();

    res.status(STATUS_CODES.OK).json(report);
  }),
];

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


// post to facebook 
exports.postReportToFacebook = asyncHandler(async (req, res) => {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const reportId = req.params.id;

  // Fetch the report from the database
  const report = await Report.findById(reportId);

  if (!report) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Report not found" });
  }

  const message = createFacebookMessage(report);
  const imageUrl = report.missingPerson.images && report.missingPerson.images[0] ? report.missingPerson.images[0].url : null;

  const postToFacebook = async (postData) => {
    try {
      const postResponse = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/feed`, postData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Post created:", postResponse.data);

      // Save the Facebook post ID to the report
      report.facebookPostId = postResponse.data.id;
      report.broadcastHistory.push({
        channel: "Facebook",
        status: "Sent",
        timestamp: new Date(),
      });
      await report.save();

      res.status(STATUS_CODES.OK).json({
        message: "Report posted to Facebook",
        postId: postResponse.data.id,
      });
    } catch (error) {
      console.error("Error posting to Facebook:", error.response ? error.response.data : error.message);
      report.broadcastHistory.push({
        channel: "Facebook",
        status: "Failed",
        timestamp: new Date(),
      });
      await report.save();
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed to post report to Facebook" });
    }
  };

  if (imageUrl) {
    const formData = new FormData();
    formData.append("url", imageUrl);
    formData.append("access_token", pageAccessToken);

    try {
      const uploadResponse = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoId = uploadResponse.data.id;
      const postData = new FormData();
      postData.append("message", message);
      postData.append("access_token", pageAccessToken);
      postData.append("object_attachment", photoId);

      await postToFacebook(postData);
    } catch (error) {
      console.error("Error uploading image to Facebook:", error.response ? error.response.data : error.message);
      report.broadcastHistory.push({
        channel: "Facebook",
        status: "Failed",
        timestamp: new Date(),
      });
      await report.save();
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed to upload image to Facebook" });
    }
  } else {
    const postData = new FormData();
    postData.append("message", message);
    postData.append("access_token", pageAccessToken);

    await postToFacebook(postData);
  }
});

exports.deleteReportFromFacebook = asyncHandler(async (req, res) => {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const postId = req.params.postId; // The ID of the Facebook post to delete

  try {
    const response = await axios.delete(
      `https://graph.facebook.com/v21.0/${postId}`,
      {
        params: {
          access_token: pageAccessToken,
        },
      }
    );

    console.log("Post deleted:", response.data);
    res.status(STATUS_CODES.OK).json({ message: "Report deleted from Facebook" });
  } catch (error) {
    console.error(
      "Error deleting from Facebook:",
      error.response ? error.response.data : error.message
    );
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete report from Facebook" });
  }
});


exports.getAllFacebookPostIds = asyncHandler(async (req, res) => {
  const reports = await Report.find();

  const postIds = reports
    .map((report) => report.facebookPostId)
    .filter((postId) => postId); 

  res.status(STATUS_CODES.OK).json(postIds);
});