const multer = require('multer');
const path = require('path');

// Set storage engine to disk storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

// Check file type
function checkFileType(file, cb, filetypes) {
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type!');
  }
}

// Single file upload (e.g., avatar)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb, /jpeg|jpg|png|gif/);
  }
}).single('avatar'); // 'avatar' is the field name for the file

// Multiple images upload
const multipleImagesUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb, /jpeg|jpg|png|gif/);
  }
}).array('missingPerson.images', 10); // 'missingPerson.images' is the field name for the files, max 10 files

// Video upload
const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb, /mp4|mov|avi|mkv/);
  }
}).single('missingPerson.video'); // 'missingPerson.video' is the field name for the file

module.exports = {
  upload,
  multipleImagesUpload,
  videoUpload
};