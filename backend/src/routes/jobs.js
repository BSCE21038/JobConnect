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
router.get('/:id', async (req, res) => {
  const job = await Job.findByPk(req.params.id, { include: [{ model: Company, attributes: ['id','name','logo_url'] }] });
  if (!job || !job.is_active) return res.status(404).json({ error: 'Not found' });
  res.json({ job });
});

// GET /jobs   (public list with q + filters + pagination)
router.get('/', async (req, res) => {
  const { q, location, type, minSalary, maxSalary, page = 1, limit = 12 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // If q present → FULLTEXT search (MySQL)
  if (q && q.trim()) {
    const rows = await sequelize.query(
      `
      SELECT j.*, c.name AS company_name, c.logo_url
      FROM Jobs j
      JOIN Companies c ON c.id = j.company_id
      WHERE j.is_active = 1
        AND MATCH (j.title, j.description, j.location) AGAINST (:q IN NATURAL LANGUAGE MODE)
        ${location ? 'AND j.location = :location' : ''}
        ${type ? 'AND j.job_type = :type' : ''}
        ${minSalary ? 'AND j.salary_min >= :minSalary' : ''}
        ${maxSalary ? 'AND j.salary_max <= :maxSalary' : ''}
      ORDER BY j.createdAt DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          q,
          location,
          type,
          minSalary: minSalary ? Number(minSalary) : undefined,
          maxSalary: maxSalary ? Number(maxSalary) : undefined,
          limit: Number(limit),
          offset
        },
        type: QueryTypes.SELECT
      }
    );
    return res.json({ items: rows, page: Number(page) });
  }

  // No q → simple filters via Sequelize
  const where = { is_active: true };
  if (location) where.location = location;
  if (type) where.job_type = type;
  if (minSalary) where.salary_min = { [Op.gte]: Number(minSalary) };
  if (maxSalary) where.salary_max = { ...(where.salary_max || {}), [Op.lte]: Number(maxSalary) };

  const { rows, count } = await Job.findAndCountAll({
    where,
    include: [{ model: Company, attributes: ['id','name','logo_url'] }],
    order: [['createdAt','DESC']],
    limit: Number(limit),
    offset
  });
  res.json({ items: rows, page: Number(page), total: count });
});

// POST /jobs/:id/apply  → idempotent (unique index)
router.post('/:id/apply', requireAuth(['SEEKER']), async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || !job.is_active) return res.status(404).json({ error: 'Job not found' });

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
