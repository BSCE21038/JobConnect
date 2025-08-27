const router = require('express').Router();
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { JobSeeker, Resume, Application, Favorite, Job, Company } = require('../../models');

// GET /seeker/me  → current seeker profile (or null)
router.get('/me', requireAuth(['SEEKER']), async (req, res) => {
  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  res.json({ seeker });
});

// POST /seeker  → create/update profile
router.post('/', requireAuth(['SEEKER']), async (req, res) => {
  const { headline, about, profile_pic_url } = req.body;
  const [seeker, created] = await JobSeeker.findOrCreate({
    where: { user_id: req.user.id },
    defaults: { headline, about, profile_pic_url }
  });
  if (!created) await seeker.update({ headline, about, profile_pic_url });
  res.json({ seeker });
});

// POST /seeker/resume  → upload PDF (≤5MB) & set active
router.post('/resume', requireAuth(['SEEKER']), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Only PDF allowed' });
    }
    if (req.file.size > 5 * 1024 * 1024) { // 5MB
      fs.unlinkSync(req.file.path);
      return res.status(413).json({ error: 'Resume too large (max 5MB)' });
    }

    const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
    if (!seeker) return res.status(400).json({ error: 'Create profile first' });

    // set previous resumes inactive
    await Resume.update({ active: false }, { where: { seeker_id: seeker.id } });

    const resume = await Resume.create({
      seeker_id: seeker.id,
      file_url: `/uploads/docs/${req.file.filename}`,
      parsed_json: null,
      active: true
    });
    res.json({ resume });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /seeker/applications  → list my applications with job + company
router.get('/applications', requireAuth(['SEEKER']), async (req, res) => {
  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  if (!seeker) return res.status(400).json({ error: 'Create profile first' });

  const apps = await Application.findAll({
    where: { seeker_id: seeker.id },
    include: [{ model: Job, include: [{ model: Company, attributes: ['id','name','logo_url'] }] }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ applications: apps });
});

// GET /seeker/favorites  → saved jobs
router.get('/favorites', requireAuth(['SEEKER']), async (req, res) => {
  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  if (!seeker) return res.status(400).json({ error: 'Create profile first' });

  const favs = await Favorite.findAll({
    where: { seeker_id: seeker.id },
    include: [{ model: Job, include: [{ model: Company, attributes: ['id','name','logo_url'] }] }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ favorites: favs });
});

module.exports = router;
