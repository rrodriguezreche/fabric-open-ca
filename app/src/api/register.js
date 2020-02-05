const bodyParser = require('body-parser');
const express = require('express');

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  console.log(`Is authenticated: ${req.isAuthenticated()}`);
  if (req.isAuthenticated() === true) return next();
  res.sendStatus(401);
};

router.use(bodyParser.json());

router.get('/api/register', ensureAuthenticated, (req, res) => {
  res.send({ great: true });
});

router.post('/api/register', ensureAuthenticated, (req, res) => {
  console.log(req.body);
  // const { message } = req.body;
  res.send({ message: 'Thanks!' });
});

module.exports = router;
