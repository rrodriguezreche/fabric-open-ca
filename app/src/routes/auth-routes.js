const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get(
  '/login',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/');
    req.logIn(user, err => {
      if (err) return next(err);
      res.redirect('/certificate');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(`/`);
});

module.exports = router;
