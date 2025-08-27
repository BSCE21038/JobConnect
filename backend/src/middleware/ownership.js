const { Company } = require('../../models');

// Ensures the current user owns a company (returns it on req.company)
async function loadMyCompany(req, res, next) {
  const me = req.user; // set by requireAuth()
  const company = await Company.findOne({ where: { user_id: me.id } });
  if (!company) return res.status(404).json({ error: 'Create your company profile first' });
  req.company = company;
  next();
}

module.exports = { loadMyCompany };
