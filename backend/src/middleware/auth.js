const { verifyAccess } = require('../utils/jwt');

function requireAuth(roles = []) {
  return (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Missing token' });

      const decoded = verifyAccess(token);
      req.user = decoded; // { id, role, name }
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid/expired token' });
    }
  };
}

module.exports = { requireAuth };
