const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { loadMyCompany } = require('../middleware/ownership');
const { Company, Job, Application, JobSeeker, User, Resume } = require('../../models');

// GET /employer/jobs  → my jobs with counts
router.get('/jobs', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const jobs = await Job.findAll({
    where: { company_id: req.company.id },
    attributes: ['id','title','is_active','createdAt'],
  });
  // lightweight counts per job (avoid big include for now)
  const ids = jobs.map(j => j.id);
  const rows = ids.length ? await Application.findAll({
    attributes: ['job_id', [Application.sequelize.fn('COUNT', '*'), 'cnt']],
    where: { job_id: ids },
    group: ['job_id']
  }) : [];
  const counts = Object.fromEntries(rows.map(r => [r.job_id, Number(r.get('cnt'))]));
  res.json({ items: jobs.map(j => ({ ...j.toJSON(), applicants: counts[j.id] || 0 })) });
});

// GET /employer/jobs/:id/applicants
router.get('/jobs/:id/applicants', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job || job.company_id !== req.company.id) {
    return res.status(404).json({ error: 'Not found' });
  }

  const apps = await Application.findAll({
    where: { job_id: job.id },
    include: [
      {
        model: JobSeeker,
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Resume, where: { active: true }, required: false } // <-- nested here
        ]
      },
      // { model: Resume, ... }  // <-- remove this (wrong place)
    ],
    order: [['createdAt', 'DESC']]
  });

  const items = apps.map(a => ({
    application_id: a.id,
    status: a.status,
    applied_at: a.createdAt,
    seeker: {
      id: a.JobSeeker?.id,
      name: a.JobSeeker?.User?.name,
      email: a.JobSeeker?.User?.email
    },
    resume_url: a.JobSeeker?.Resumes?.find?.(r => r.active)?.file_url
      || (Array.isArray(a.JobSeeker?.Resumes) && a.JobSeeker.Resumes[0]?.file_url)
      || null
  }));

  res.json({ job_id: job.id, applicants: items });
});


module.exports = router;
