const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { loadMyCompany } = require('../middleware/ownership');
const { Application, Job, Company, Notification } = require('../../models');

const NEXT_ALLOWED = {
  APPLIED: ['SHORTLISTED','REJECTED','HIRED'],
  SHORTLISTED: ['REJECTED','HIRED'],
  REJECTED: [],
  HIRED: []
};

// PATCH /applications/:id/status { status }
router.patch('/:id/status', requireAuth(['EMPLOYER']), loadMyCompany, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  const app = await Application.findByPk(req.params.id, { include: [{ model: Job }] });
  if (!app || app.Job?.company_id !== req.company.id) return res.status(404).json({ error: 'Not found' });

  const allowed = NEXT_ALLOWED[app.status] || [];
  if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid transition from ${app.status} to ${status}` });

  await app.update({ status });

  // notification (simple DB insert)
  await Notification.create({
    user_id: app.seeker_id ? (await require('../../models').JobSeeker.findByPk(app.seeker_id)).user_id : null,
    type: 'APPLICATION_STATUS',
    payload_json: JSON.stringify({ application_id: app.id, job_id: app.job_id, status }),
    is_read: false
  });

  res.json({ ok: true, application: app });
});

module.exports = router;
