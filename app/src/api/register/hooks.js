const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() === true) return next();
  res.sendStatus(401);
};

const ensureCaClient = (req, res, next) => {
  if (req.ca && req.ca.client) return next();
  else {
    res.sendStatus(500);
  }
};

module.exports = { ensureAuthenticated, ensureCaClient };
