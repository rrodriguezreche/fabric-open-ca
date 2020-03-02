const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() === true) {
    for (email of req.user.emails) {
      if (email.value && email.verified) {
        req.usermail = email.value;
        return next();
      }
    }
    res.sendStatus(402);
  }
  res.sendStatus(401);
};

const ensureCaClient = (req, res, next) => {
  if (req.ca && req.ca.client) return next();
  else {
    res.sendStatus(500);
  }
};

const deleteUserIfRegistered = (req, res, next) => {
  const identityService = req.ca.client.newIdentityService();

  identityService
    .getOne(req.usermail, req.ca.registrar)
    .then(response => {
      if (
        response &&
        response.success &&
        response.result &&
        response.result.id &&
        response.result.id === req.usermail
      ) {
        return Promise.all([
          identityService.delete(req.usermail, req.ca.registrar)
          // req.ca.client.revoke({ enrollmentID: req.usermail }, req.ca.registrar)
        ]);
      }
    })
    .then(() => {
      console.log(`Succesfully unregistered ${req.usermail}`);
    })
    .catch(error => {
      if (
        error.toString().includes(`"code":63`) ||
        error.toString().includes(`"code":10`)
      ) {
        console.log(`${req.usermail} is not registered`);
      } else {
        console.error(error);
      }
    })
    .finally(() => next());
};

module.exports = {
  ensureAuthenticated,
  ensureCaClient,
  deleteUserIfRegistered
};
