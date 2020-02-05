require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const session = require('express-session');
// 1 - importing dependencies
const passport = require('passport');
let GoogleStrategy = require('passport-google-oauth20').Strategy;
const uid = require('uid-safe');

const authRoutes = require('../routes/auth-routes');
const registerAPI = require('../api/register');

const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  dir: './src'
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // 2 - add session management to Express
  const sessionConfig = {
    secret: uid.sync(18),
    cookie: {
      maxAge: 86400 * 1000 // 24 hours in milliseconds
    },
    resave: false,
    saveUninitialized: true
  };
  server.use(session(sessionConfig));

  // 3 - configuring google strategy
  const googleOauthStrategy = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  );

  // 4 - configuring Passport
  passport.use(googleOauthStrategy);
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // 5 - adding Passport and authentication routes
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(authRoutes);

  server.use(registerAPI);

  // 6 - you are restricting access to some routes
  const restrictAccess = (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/');
    next();
  };

  //   server.use('/certificate', (req, res, next) => {
  //     next();
  //   });
  server.use('/certificate', restrictAccess);

  // handling everything else with Next.js
  server.get('*', handle);

  http.createServer(server).listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
  });
});
