const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { loadMyCompany } = require('../middleware/ownership');
const { Job, Application } = require('../../models');
const { Op } = require('sequelize');

// GET /analytics/summary  -> totals for employer
router.get('/summary', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const now = new Date();

  const jobs = await Job.findAll({ where: { company_id: req.company.id }, attributes: ['id','is_active','expires_at'] });
  const jobIds = jobs.map(j => j.id);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.is_active && (!j.expires_at || j.expires_at >= now)).length;
  const expiredJobs = jobs.filter(j => j.expires_at && j.expires_at < now).length;

  const appsCount = jobIds.length
    ? await Application.count({ where: { job_id: { [Op.in]: jobIds } } })
    : 0;

  res.json({ totalJobs, activeJobs, expiredJobs, totalApplicants: appsCount });
});

// GET /analytics/jobs  -> per-job stats (applicants & views)
router.get('/jobs', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const jobs = await Job.findAll({
    where: { company_id: req.company.id },
    attributes: ['id','title','is_active','expires_at','views_count','createdAt']
  });
  // applicant counts per job
  const ids = jobs.map(j => j.id);
  const rows = ids.length ? await Application.findAll({
    attributes: ['job_id', [Application.sequelize.fn('COUNT', '*'), 'cnt']],
    where: { job_id: { [require('sequelize').Op.in]: ids } },
    group: ['job_id']
  }) : [];
  const counts = Object.fromEntries(rows.map(r => [r.job_id, Number(r.get('cnt'))]));
  const items = jobs.map(j => ({
    id: j.id,
    title: j.title,
    is_active: j.is_active,
    expires_at: j.expires_at,
    createdAt: j.createdAt,
    applicants: counts[j.id] || 0,
    views: j.views_count || 0
  }));
  res.json({ items });
});

module.exports = router;
