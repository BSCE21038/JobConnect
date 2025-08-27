const multer = require('multer');
const path = require('path');
const { absUploadPath } = require('../utils/storage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.fieldname === 'logo' ? 'logos' : 'docs';
    cb(null, absUploadPath(sub));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});

function fileFilter(req, file, cb) {
  const isLogo = file.fieldname === 'logo';
  const ok = isLogo ? file.mimetype.startsWith('image/')
                    : file.mimetype === 'application/pdf';
  cb(ok ? null : new Error('Invalid file type'), ok);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
module.exports = { upload };
