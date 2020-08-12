const jwt = require('jsonwebtoken');
const queries = require('../db/queries');

function checkTokenSetUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer asdalksdjklalksdlajsd

  if (!token) return next();
  // check token against the blacklist
  queries.getAllJwtBlacklist()
    .then((blacklist) => {
      // array.some returns true if the contidion is true with any of the objects
      if (blacklist.some((item) => item.token === token)) return next();
      jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
        if (!error) {
          req.token = token; // Not sure if this is against best practices?
          req.user = payload;
        }
        return next();
      });
    }).catch(() => next());
}

function isLoggedIn(req, res, next) {
  if (req.user) return next();
  const error = new Error('Unauthorized');
  res.status(401);
  return next(error);
}

module.exports = {
  checkTokenSetUser,
  isLoggedIn
};
