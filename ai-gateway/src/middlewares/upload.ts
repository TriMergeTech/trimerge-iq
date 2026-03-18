import multer from 'multer';

// Use memory storage so the gateway doesn't write files to its own disk.
// The buffer will be forwarded directly to the downstream AI Engine.
const storage = multer.memoryStorage();

// Optional but recommended: Validate file types
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and TXT are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit to protect memory
  fileFilter,
});