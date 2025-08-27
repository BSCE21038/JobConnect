const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User, Session } = require('../../models');
const { signAccessToken, signRefreshToken, verifyRefresh, REFRESH_TTL_SECONDS } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10;

// POST /auth/register  {name,email,password,role: 'EMPLOYER'|'SEEKER'}
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password_hash, role });

    const access = signAccessToken({ id:user.id, role:user.role, name:user.name });
    const refresh = signRefreshToken({ id:user.id });

    // store hashed refresh
    const refresh_hash = await bcrypt.hash(refresh, SALT_ROUNDS);
    const expires_at = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
    await Session.create({ user_id: user.id, refresh_token_hash: refresh_hash, expires_at });

    res.json({ user: { id:user.id, name:user.name, email:user.email, role:user.role }, tokens: { access, refresh } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /auth/login  {email,password}
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const access = signAccessToken({ id:user.id, role:user.role, name:user.name });
    const refresh = signRefreshToken({ id:user.id });

    // rotate refresh
    const refresh_hash = await bcrypt.hash(refresh, SALT_ROUNDS);
    const expires_at = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
    await Session.create({ user_id: user.id, refresh_token_hash: refresh_hash, expires_at });

    res.json({ user: { id:user.id, name:user.name, email:user.email, role:user.role }, tokens: { access, refresh } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /auth/refresh  {refresh}
router.post('/refresh', async (req, res) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });

    const decoded = verifyRefresh(refresh); // { id, iat, exp }
    const sessions = await Session.findAll({ where: { user_id: decoded.id } });

    // accept if any stored hash matches
    let match = false, sessionIdToKeep = null;
    for (const s of sessions) {
      if (s.expires_at < new Date()) continue;
      const ok = await require('bcrypt').compare(refresh, s.refresh_token_hash);
      if (ok) { match = true; sessionIdToKeep = s.id; break; }
    }
    if (!match) return res.status(401).json({ error: 'Invalid refresh token' });

    // rotate: delete old, create new
    if (sessionIdToKeep) await Session.destroy({ where: { id: sessionIdToKeep } });

    const access = signAccessToken({ id: decoded.id, role: undefined, name: undefined });
    const newRefresh = signRefreshToken({ id: decoded.id });
    const refresh_hash = await bcrypt.hash(newRefresh, SALT_ROUNDS);
    const expires_at = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
    await Session.create({ user_id: decoded.id, refresh_token_hash: refresh_hash, expires_at });

    res.json({ tokens: { access, refresh: newRefresh } });
  } catch (e) { res.status(401).json({ error: 'Invalid/expired refresh token' }); }
});

// GET /auth/me
router.get('/me', requireAuth(), async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['id','name','email','role','avatar_url'] });
  res.json({ user });
});

// POST /auth/logout  {refresh}
router.post('/logout', async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.json({ ok: true });
  // best-effort revoke
  const decoded = (()=>{ try { return verifyRefresh(refresh); } catch { return null }})();
  if (decoded?.id) {
    const sessions = await Session.findAll({ where: { user_id: decoded.id } });
    for (const s of sessions) {
      const ok = await require('bcrypt').compare(refresh, s.refresh_token_hash);
      if (ok) await Session.destroy({ where: { id: s.id } });
    }
  }
  res.json({ ok: true });
});

module.exports = router;
