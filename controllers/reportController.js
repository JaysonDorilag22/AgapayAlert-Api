// reportController.js
const Report = require('../models/reportModel');
const asyncHandler = require('../utils/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require('../constants/messages');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);

// Check file type
function checkFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const videoFiletypes = /mp4|avi|mkv/;
  const extname = imageFiletypes.test(path.extname(file.originalname).toLowerCase()) || videoFiletypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = imageFiletypes.test(file.mimetype) || videoFiletypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and Videos Only!');
  }
}

// Create a new report
exports.createReport = [
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
      } else if (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    console.log('Files:', req.files); // Log the files being uploaded
    console.log('Body:', req.body); // Log the body of the request

    const { reporter, missingPerson } = req.body;
    const images = req.files.images || [];
    const video = req.files.video ? req.files.video[0] : null;

    console.log('Reporter:', reporter);
    console.log('Missing Person:', missingPerson);
    console.log('Images:', images.map(image => image.originalname));
    console.log('Video:', video ? video.originalname : 'No video uploaded');

    // Upload images to Cloudinary
    const imageUploadPromises = images.map(image => cloudinary.uploader.upload(image.path, { folder: 'report Images' }));
    const imageUploadResults = await Promise.all(imageUploadPromises);

    // Upload video to Cloudinary
    const videoUploadResult = video ? await cloudinary.uploader.upload(video.path, { folder: 'report Videos', resource_type: 'video' }) : null;

    // Create new report
    const report = await Report.create({
        reporter,
        missingPerson: {
            ...missingPerson,
            images: imageUploadResults.map(result => ({ public_id: result.public_id, url: result.secure_url })),
            video: videoUploadResult ? { public_id: videoUploadResult.public_id, url: videoUploadResult.secure_url } : null,
        },
    });

    res.status(STATUS_CODES.CREATED).json(report);
  })
];

// Get a single report by ID
exports.getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.REPORT_NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json(report);
});

// Get all reports
exports.getAllReports = asyncHandler(async (req, res) => {
    const reports = await Report.find();

    res.status(STATUS_CODES.OK).json(reports);
});

// Update a report by ID
exports.updateReportById = [
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
      } else if (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    console.log('Files:', req.files); // Log the files being uploaded
    console.log('Body:', req.body); // Log the body of the request

    const { reporter, missingPerson } = req.body;
    const images = req.files.images || [];
    const video = req.files.video ? req.files.video[0] : null;

    console.log('Reporter:', reporter);
    console.log('Missing Person:', missingPerson);
    console.log('Images:', images.map(image => image.originalname));
    console.log('Video:', video ? video.originalname : 'No video uploaded');

    const report = await Report.findById(req.params.id);

    if (!report) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.REPORT_NOT_FOUND });
    }

    // Upload new images to Cloudinary
    const imageUploadPromises = images.map(image => cloudinary.uploader.upload(image.path, { folder: 'report Images' }));
    const imageUploadResults = await Promise.all(imageUploadPromises);

    // Upload new video to Cloudinary
    const videoUploadResult = video ? await cloudinary.uploader.upload(video.path, { folder: 'report Videos', resource_type: 'video' }) : null;

    report.reporter = reporter || report.reporter;
    report.missingPerson = {
        ...report.missingPerson,
        ...missingPerson,
        images: imageUploadResults.length ? imageUploadResults.map(result => ({ public_id: result.public_id, url: result.secure_url })) : report.missingPerson.images,
        video: videoUploadResult ? { public_id: videoUploadResult.public_id, url: videoUploadResult.secure_url } : report.missingPerson.video,
    };

    await report.save();

    res.status(STATUS_CODES.OK).json(report);
  })
];

// Delete a report by ID
exports.deleteReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.REPORT_NOT_FOUND });
    }

    await report.remove();

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.REPORT_DELETED });
});