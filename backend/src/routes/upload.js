const express = require('express');
const router = express.Router();
const multer = require('multer');
const Video = require('../models/Video');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const {
  uploadLocal,
  uploadToS3,
  uploadToCloudinary,
  deleteFromS3,
  deleteFromCloudinary,
  deleteLocalFile
} = require('../utils/upload');

// Configure multer for memory storage (for cloud uploads)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|ogg|mov|avi|mkv|jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed'));
    }
  }
});

/**
 * @route   POST /api/upload/video
 * @desc    Upload a video file
 * @access  Private/Admin
 */
router.post(
  '/video',
  protect,
  authorize('admin', 'moderator'),
  uploadLimiter,
  uploadMemory.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No video file provided'
        });
      }

      // Determine storage method from env or query
      const storageMethod = req.query.storage || process.env.DEFAULT_STORAGE || 'local';

      let videoData = {
        title: req.body.title,
        description: req.body.description,
        speaker: req.body.speaker,
        category: req.body.category,
        tags: req.body.tags ? JSON.parse(req.body.tags) : []
      };

      // Upload based on storage method
      let uploadResult;

      if (storageMethod === 's3') {
        uploadResult = await uploadToS3(req.file, 'videos');
        videoData.url = uploadResult.url;
        videoData.storageKey = uploadResult.key;
        videoData.storageType = 's3';
      } else if (storageMethod === 'cloudinary') {
        uploadResult = await uploadToCloudinary(req.file, 'videos');
        videoData.url = uploadResult.url;
        videoData.storageKey = uploadResult.publicId;
        videoData.storageType = 'cloudinary';
        videoData.duration = uploadResult.duration;
        if (uploadResult.thumbnailUrl) {
          videoData.thumbnail = uploadResult.thumbnailUrl;
        }
      } else {
        // Local storage - save file
        const uploadPath = `/uploads/videos/${req.file.filename}`;
        videoData.url = uploadPath;
        videoData.storageType = 'local';

        // Save file locally
        const fs = require('fs');
        const path = require('path');
        const savePath = path.join(__dirname, '../../uploads/videos', req.file.filename);

        if (!fs.existsSync(path.dirname(savePath))) {
          fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }

        fs.writeFileSync(savePath, req.file.buffer);
      }

      // Create video record in database
      const video = await Video.create(videoData);

      res.status(201).json({
        success: true,
        data: video,
        message: 'Video uploaded successfully'
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error uploading video'
      });
    }
  }
);

/**
 * @route   POST /api/upload/thumbnail
 * @desc    Upload a thumbnail image
 * @access  Private/Admin
 */
router.post(
  '/thumbnail',
  protect,
  authorize('admin', 'moderator'),
  uploadLimiter,
  uploadMemory.single('thumbnail'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No thumbnail file provided'
        });
      }

      const storageMethod = req.query.storage || process.env.DEFAULT_STORAGE || 'local';
      let uploadResult;

      if (storageMethod === 's3') {
        uploadResult = await uploadToS3(req.file, 'thumbnails');
      } else if (storageMethod === 'cloudinary') {
        uploadResult = await uploadToCloudinary(req.file, 'thumbnails');
      } else {
        // Local storage
        const fs = require('fs');
        const path = require('path');
        const filename = `${Date.now()}-${req.file.originalname}`;
        const savePath = path.join(__dirname, '../../uploads/thumbnails', filename);

        if (!fs.existsSync(path.dirname(savePath))) {
          fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }

        fs.writeFileSync(savePath, req.file.buffer);

        uploadResult = {
          url: `/uploads/thumbnails/${filename}`,
          storage: 'local'
        };
      }

      res.status(200).json({
        success: true,
        data: uploadResult,
        message: 'Thumbnail uploaded successfully'
      });
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error uploading thumbnail'
      });
    }
  }
);

/**
 * @route   POST /api/upload/presigned-url
 * @desc    Get presigned URL for direct S3 upload (client-side)
 * @access  Private/Admin
 */
router.post(
  '/presigned-url',
  protect,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Filename and content type are required'
        });
      }

      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const key = `videos/${Date.now()}-${filename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read'
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      res.json({
        success: true,
        data: {
          presignedUrl,
          key,
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
        }
      });
    } catch (error) {
      console.error('Presigned URL error:', error);
      res.status(500).json({
        success: false,
        error: 'Error generating presigned URL'
      });
    }
  }
);

/**
 * @route   DELETE /api/upload/:videoId
 * @desc    Delete uploaded video and its file
 * @access  Private/Admin
 */
router.delete('/:videoId', protect, authorize('admin'), async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Delete from storage
    if (video.storageType === 's3' && video.storageKey) {
      await deleteFromS3(video.storageKey);
    } else if (video.storageType === 'cloudinary' && video.storageKey) {
      await deleteFromCloudinary(video.storageKey, 'video');
    } else if (video.storageType === 'local' && video.url) {
      const path = require('path');
      const filePath = path.join(__dirname, '../..', video.url);
      await deleteLocalFile(filePath);
    }

    // Delete from database
    await Video.findByIdAndDelete(req.params.videoId);

    res.json({
      success: true,
      message: 'Video and file deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting video'
    });
  }
});

module.exports = router;
