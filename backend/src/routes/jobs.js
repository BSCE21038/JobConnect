const router = require('express').Router();
const { Op, QueryTypes, UniqueConstraintError } = require('sequelize');
const { Job, Company, JobSeeker, Application, Favorite } = require('../../models');
const { requireAuth } = require('../middleware/auth');
const { loadMyCompany } = require('../middleware/ownership');
const { upload } = require('../middleware/upload');
const { sequelize } = require('../../models');

// ---------------- Employer: create/update/delete ----------------

// POST /jobs  (EMPLOYER creates under own company)
router.post('/', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const { title, description, location, salary_min, salary_max, job_type, expires_at } = req.body;
  const job = await Job.create({
    company_id: req.company.id, title, description, location,
    salary_min, salary_max, job_type, expires_at, is_active: true
  });
  res.json({ job });
});

// PATCH /jobs/:id  (must own the company)
router.patch('/:id', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || job.company_id !== req.company.id) return res.status(404).json({ error: 'Not found' });
  const allowed = ['title','description','location','salary_min','salary_max','job_type','is_active','expires_at'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  await job.update(updates);
  res.json({ job });
});

// DELETE /jobs/:id
router.delete('/:id', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || job.company_id !== req.company.id) return res.status(404).json({ error: 'Not found' });
  await job.destroy();
  res.json({ ok: true });
});

// POST /jobs/:id/jd  (upload PDF ≤10MB)
router.post('/:id/jd', requireAuth(['EMPLOYER']), loadMyCompany, upload.single('jd'), async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || job.company_id !== req.company.id) return res.status(404).json({ error: 'Not found' });
  if (!req.file) return res.status(400).json({ error: 'No file' });
  await job.update({ jd_file_url: '/uploads/docs/' + req.file.filename });
  res.json({ jd_file_url: job.jd_file_url });
});

// ---------------- Public / Shared: get + list + search ----------------

// GET /jobs/:id
// replace the whole handler
router.get('/:id', async (req, res) => {
  const job = await Job.findByPk(req.params.id, {
    include: [{ model: Company, attributes: ['id','name','logo_url'] }]
  });
  if (!job) return res.status(404).json({ error: 'Not found' });

  // who is calling?
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  let isOwnerEmployer = false;
  let seekerApplied = false;

  if (token) {
    try {
      const { verifyAccess } = require('../utils/jwt');
      const decoded = verifyAccess(token); // { id, role }
      if (decoded?.role === 'EMPLOYER') {
        const myCo = await Company.findOne({ where: { user_id: decoded.id } });
        if (myCo && myCo.id === job.company_id) isOwnerEmployer = true;
      } else if (decoded?.role === 'SEEKER') {
        const { JobSeeker, Application } = require('../../models');
        const seeker = await JobSeeker.findOne({ where: { user_id: decoded.id } });
        if (seeker) {
          const existing = await Application.findOne({ where: { job_id: job.id, seeker_id: seeker.id } });
          seekerApplied = !!existing;
        }
      }
    } catch {}
  }

  // count a view when not the owning employer
  if (!isOwnerEmployer) { try { await job.increment('views_count'); } catch {} }

  const expired = job.expires_at && new Date(job.expires_at) < new Date();
  const can_apply = job.is_active && !expired;

  res.json({ job, meta: { expired, can_apply, seekerApplied } });
});




// GET /jobs   (public list with q + filters + pagination)
router.get('/', async (req, res) => {
  const { q, location, type, page = 1, include_inactive } = req.query;
  const where = { };
  if (!include_inactive) where.is_active = true;           // default: only active
  if (q) where.title = { [Op.like]: `%${q}%` };
  if (location) where.location = { [Op.like]: `%${location}%` };
  if (type) where.job_type = type;

  const pageSize = 6;
  const { rows, count } = await Job.findAndCountAll({
     where,
     include: [{ model: Company, attributes: ['id','name','logo_url'] }],
     limit: pageSize,
     offset: (Number(page) - 1) * pageSize,
     order: [['createdAt', 'DESC']]
   });

  // add flags like we do for detail
  const items = rows.map(j => {
     const expired = j.expires_at && new Date(j.expires_at) < new Date();
     const can_apply = j.is_active && !expired;
     return { ...j.toJSON(), meta: { expired, can_apply } };
   });

const totalPages = Math.max(1, Math.ceil(count / pageSize));
res.json({ items, total: count, page: Number(page), totalPages, pageSize });
});


// POST /jobs/:id/apply  → idempotent (unique index)
router.post('/:id/apply', requireAuth(['SEEKER']), async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const expired = job.expires_at && new Date(job.expires_at) < new Date();
  if (!job.is_active || expired) return res.status(400).json({ error: 'Job is inactive or expired' });
  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  if (!seeker) return res.status(400).json({ error: 'Create profile first' });

  // must have an active resume
  const activeResume = await require('../../models').Resume.findOne({ where: { seeker_id: seeker.id, active: true } });
  if (!activeResume) return res.status(400).json({ error: 'Upload an active resume first' });

  try {
    const app = await Application.create({ job_id: job.id, seeker_id: seeker.id, status: 'APPLIED' });
    res.json({ application: app, ok: true });
  } catch (e) {
    if (e instanceof UniqueConstraintError) return res.json({ ok: true, note: 'Already applied' });
    throw e;
  }
});

// POST /jobs/:id/favorite
router.post('/:id/favorite', requireAuth(['SEEKER']), async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || !job.is_active) return res.status(404).json({ error: 'Job not found' });

  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  if (!seeker) return res.status(400).json({ error: 'Create profile first' });

  try {
    const fav = await Favorite.create({ seeker_id: seeker.id, job_id: job.id });
    res.json({ favorite: fav, ok: true });
  } catch (e) {
    if (e instanceof UniqueConstraintError) return res.json({ ok: true, note: 'Already saved' });
    throw e;
  }
});

// DELETE /jobs/:id/favorite
router.delete('/:id/favorite', requireAuth(['SEEKER']), async (req, res) => {
  const seeker = await JobSeeker.findOne({ where: { user_id: req.user.id } });
  if (!seeker) return res.status(400).json({ error: 'Create profile first' });
  await Favorite.destroy({ where: { seeker_id: seeker.id, job_id: req.params.id } });
  res.json({ ok: true });
});
module.exports = router;
