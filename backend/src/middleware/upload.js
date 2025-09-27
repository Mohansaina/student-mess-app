const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS S3 (if enabled)
const useS3 = process.env.USE_S3 === 'true';
let s3;

if (useS3) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
}

// Ensure upload directory exists
const uploadPath = process.env.UPLOAD_PATH || './uploads';
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists(uploadPath);
ensureDirectoryExists(path.join(uploadPath, 'profiles'));
ensureDirectoryExists(path.join(uploadPath, 'documents'));
ensureDirectoryExists(path.join(uploadPath, 'hotels'));

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Storage configuration for local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = uploadPath;
    
    // Determine upload directory based on file field
    switch (file.fieldname) {
      case 'logo':
      case 'hotelImage':
        uploadDir = path.join(uploadPath, 'hotels');
        break;
      case 'idCard':
      case 'faceImage':
        uploadDir = path.join(uploadPath, 'documents');
        break;
      case 'profileImage':
        uploadDir = path.join(uploadPath, 'profiles');
        break;
      default:
        uploadDir = uploadPath;
    }
    
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Memory storage for S3 upload
const memoryStorage = multer.memoryStorage();

// Create multer instance
const upload = multer({
  storage: useS3 ? memoryStorage : localStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files at once
  },
  fileFilter
});

// S3 upload function
const uploadToS3 = async (file, folder = '') => {
  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file && file.mimetype.startsWith('image/')) {
        let processedBuffer;
        
        if (useS3) {
          // Process image and prepare for S3 upload
          processedBuffer = await sharp(file.buffer)
            .resize(1200, 1200, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          file.buffer = processedBuffer;
          
          // Upload to S3
          const folder = file.fieldname === 'logo' || file.fieldname === 'hotelImage' ? 'hotels' :
                        file.fieldname === 'idCard' || file.fieldname === 'faceImage' ? 'documents' :
                        'profiles';
          
          const s3Url = await uploadToS3(file, folder);
          file.location = s3Url;
          file.key = file.key || s3Url.split('/').pop();
          
        } else {
          // Process image for local storage
          const outputPath = file.path.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.jpg');
          
          await sharp(file.path)
            .resize(1200, 1200, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(outputPath);
          
          // Remove original if different from processed
          if (outputPath !== file.path) {
            fs.unlinkSync(file.path);
            file.path = outputPath;
            file.filename = path.basename(outputPath);
          }
        }
        
        processedFiles.push(file);
      }
    }

    if (req.files) {
      req.files = processedFiles;
    } else if (req.file) {
      req.file = processedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Helper function to get file URL
const getFileUrl = (filename, folder = '') => {
  if (useS3) {
    return filename; // S3 URL is already complete
  }
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.API_BASE_URL 
    : `http://localhost:${process.env.PORT || 5000}`;
  
  return `${baseUrl}/uploads/${folder}${folder ? '/' : ''}${filename}`;
};

// Helper function to delete file
const deleteFile = async (filename, folder = '') => {
  try {
    if (useS3) {
      // Delete from S3
      const key = filename.includes('amazonaws.com') 
        ? filename.split('/').pop() 
        : `${folder}/${filename}`;
      
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
      }).promise();
    } else {
      // Delete from local storage
      const filePath = path.join(uploadPath, folder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('File deletion error:', error);
  }
};

// Middleware configurations for different upload types
const uploadConfigs = {
  // Single file upload
  single: (fieldName) => [
    upload.single(fieldName),
    processImage
  ],
  
  // Multiple files upload
  multiple: (fieldName, maxCount = 5) => [
    upload.array(fieldName, maxCount),
    processImage
  ],
  
  // Multiple different fields
  fields: (fieldsConfig) => [
    upload.fields(fieldsConfig),
    processImage
  ],
  
  // Hotel profile upload (logo)
  hotelProfile: [
    upload.single('logo'),
    processImage
  ],
  
  // Student documents upload (ID card + face image)
  studentDocuments: [
    upload.fields([
      { name: 'idCard', maxCount: 1 },
      { name: 'faceImage', maxCount: 1 }
    ]),
    processImage
  ],
  
  // Profile image upload
  profileImage: [
    upload.single('profileImage'),
    processImage
  ]
};

module.exports = {
  upload,
  uploadConfigs,
  processImage,
  getFileUrl,
  deleteFile,
  useS3
};