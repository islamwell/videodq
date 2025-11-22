const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cloudinary = require('cloudinary').v2;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure Cloudinary
 */
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Configure AWS S3
 */
const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}) : null;

/**
 * File filter for videos and images
 */
const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = /mp4|webm|ogg|mov|avi|mkv/;
  const allowedImageTypes = /jpeg|jpg|png|webp|gif/;

  const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only video and image files are allowed'));
  }
};

/**
 * Local storage configuration
 */
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('video/')
      ? path.join(uploadsDir, 'videos')
      : path.join(uploadsDir, 'thumbnails');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Multer upload middleware (local storage)
 */
const uploadLocal = multer({
  storage: localStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  },
  fileFilter: fileFilter
});

/**
 * Upload to AWS S3
 */
const uploadToS3 = async (file, folder = 'videos') => {
  if (!s3Client) {
    throw new Error('AWS S3 is not configured');
  }

  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  });

  await s3Client.send(command);

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return {
    url,
    key: fileKey,
    storage: 's3'
  };
};

/**
 * Delete from AWS S3
 */
const deleteFromS3 = async (key) => {
  if (!s3Client) {
    throw new Error('AWS S3 is not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  });

  await s3Client.send(command);
};

/**
 * Upload to Cloudinary
 */
const uploadToCloudinary = async (file, folder = 'videos') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `videodq/${folder}`,
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
        ...(file.mimetype.startsWith('video/') && {
          eager: [
            { width: 1280, height: 720, crop: 'limit', format: 'mp4' },
            { width: 854, height: 480, crop: 'limit', format: 'mp4' },
            { width: 640, height: 360, crop: 'limit', format: 'mp4' }
          ],
          eager_async: true
        })
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          storage: 'cloudinary',
          thumbnailUrl: result.thumbnail_url,
          duration: result.duration,
          format: result.format
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Delete from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured');
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

/**
 * Delete local file
 */
const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

/**
 * Get video duration from local file
 * Note: This is a placeholder. In production, use ffprobe or similar
 */
const getVideoDuration = async (filePath) => {
  // TODO: Implement with ffprobe or similar library
  return 0;
};

/**
 * Generate thumbnail from video
 * Note: This is a placeholder. In production, use ffmpeg
 */
const generateThumbnail = async (videoPath) => {
  // TODO: Implement with ffmpeg
  return null;
};

module.exports = {
  uploadLocal,
  uploadToS3,
  deleteFromS3,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteLocalFile,
  getVideoDuration,
  generateThumbnail
};
