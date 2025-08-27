const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function absUploadPath(...p) {
  const full = path.join(process.cwd(), UPLOAD_DIR, ...p);
  ensureDir(path.dirname(full));
  return full;
}

module.exports = { UPLOAD_DIR, absUploadPath };
