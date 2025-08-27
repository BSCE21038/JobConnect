const jwt = require('jsonwebtoken');

const ACCESS_TTL = '15m';          // access token lifetime
const REFRESH_TTL_SECONDS = 60*60*24*30; // 30 days

function signAccessToken(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefreshToken(payload){
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL_SECONDS });
}
function verifyAccess(token){
  return jwt.verify(token, process.env.JWT_SECRET);
}
function verifyRefresh(token){
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh, REFRESH_TTL_SECONDS };
