const router = require('express').Router();
const { Company } = require('../../models');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// GET /companies/me
router.get('/me', requireAuth(['EMPLOYER']), async (req, res) => {
  const company = await Company.findOne({ where: { user_id: req.user.id } });
  res.json({ company });
});

// POST /companies  (create or upsert)
router.post('/', requireAuth(['EMPLOYER']), async (req, res) => {
  const { name, website, contact_email, contact_phone } = req.body;
  const [company] = await Company.findOrCreate({
    where: { user_id: req.user.id },
    defaults: { name, website, contact_email, contact_phone }
  });
  // if exists, update
  if (company && (name || website || contact_email || contact_phone)) {
    await company.update({ name, website, contact_email, contact_phone });
  }
  res.json({ company });
});

// POST /companies/logo  (image/*, ≤10MB)
router.post('/logo', requireAuth(['EMPLOYER']), upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const company = await Company.findOne({ where: { user_id: req.user.id } });
  if (!company) return res.status(404).json({ error: 'Create company first' });
  await company.update({ logo_url: '/uploads/logos/' + req.file.filename });
  res.json({ logo_url: company.logo_url });
});

module.exports = router;
