const cloudinary = require('./cloudinary');
const fs = require('fs');

async function uploadImages(images) {
  if (!images || images.length === 0) return [];

  try {
    const uploadPromises = images.map(image =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "report Images" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        });

        const filePath = image.url.uri.replace('file://', '');
        fs.readFile(filePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            uploadStream.end(data);
          }
        });
      })
    );

    const uploadResponses = await Promise.all(uploadPromises);

    return uploadResponses;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
}

async function uploadVideo(video) {
  if (!video) return {};

  try {
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: "report Videos", resource_type: "video" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      });

      const filePath = video.url.uri.replace('file://', '');
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          uploadStream.end(data);
        }
      });
    });

    return uploadResponse;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video');
  }
}

module.exports = { uploadImages, uploadVideo };