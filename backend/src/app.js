const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { UPLOAD_DIR } = require('./utils/storage');
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const seekerRoutes = require('./routes/seeker');
const employerRoutes = require('./routes/employer');
const applicationsRoutes = require('./routes/applications');
const { Notification } = require('../models');

require('dotenv').config();

const { sequelize } = require('../models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/auth', authRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), UPLOAD_DIR)));
app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);
app.use('/seeker', seekerRoutes);
app.use('/employer', employerRoutes);
app.use('/applications', applicationsRoutes);

app.get('/healthz', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'error', error: err.message });
  }
});
app.get('/notifications', require('./middleware/auth').requireAuth(), async (req, res) => {
  const items = await Notification.findAll({ where: { user_id: req.user.id }, order: [['createdAt','DESC']], limit: 50 });
  res.json({ items });
});
app.patch('/notifications/:id/read', require('./middleware/auth').requireAuth(), async (req, res) => {
  await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
  res.json({ ok: true });
});
module.exports = app;
