// utils/avatarUpload.js
const cloudinary = require('./cloudinary');

async function uploadAvatar(file) {
  if (!file) return {};

  const uploadResponse = await cloudinary.uploader.upload(file.path, {
    folder: "avatars",
  });

  return {
    public_id: uploadResponse.public_id,
    url: uploadResponse.secure_url,
  };
}

module.exports = { uploadAvatar };