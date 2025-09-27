const express = require('express');
const { auth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/uploads
// @desc    Upload files
// @access  Private
router.post('/', auth, uploadConfigs.multiple('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: file.location || `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: { files: uploadedFiles }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;