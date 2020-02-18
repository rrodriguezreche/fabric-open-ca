require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const session = require('express-session');
const passport = require('passport');
let GoogleStrategy = require('passport-google-oauth20').Strategy;
const uid = require('uid-safe');

const authRoutes = require('../routes/auth-routes');
const registerAPI = require('../api/register');

const {
  initializeCaConnection,
  getCaClient,
  getMasterKeyStore,
  getMasterCertificates,
  getRegistrarEntity
} = require('./helpers/fabric-enrollment');

const dev = process.env.NODE_ENV !== 'production';
let app = next({
  dev,
  dir: './src'
});
const handle = app.getRequestHandler();

app.locals = {};

let ca = {};

app
  .prepare()
  .then(async () => {
    // Prepare Fabric CA NodeSDK client
    const client = await getCaClient();
    const keystore = await getMasterKeyStore(client);
    const certificates = await getMasterCertificates(client);
    const registrar = await getRegistrarEntity(
      client,
      keystore && keystore.bytes ? keystore.bytes : undefined,
      certificates && certificates.certificate
        ? certificates.certificate
        : undefined
    );
    ca = { client, keystore, certificates, registrar };
  })
  .then(() => {
    const server = express();

    // add session management to Express
    const sessionConfig = {
      secret: uid.sync(18),
      cookie: {
        maxAge: 86400 * 1000 // 24 hours in milliseconds
      },
      resave: false,
      saveUninitialized: true
    };
    server.use(session(sessionConfig));

    // configuring google strategy
    const googleOauthStrategy = new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
        profileFields: [
          'id',
          'email',
          'emails',
          'gender',
          'link',
          'locale',
          'name',
          'timezone',
          'updated_time',
          'verified'
        ],
        scope: ['profile', 'email']
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
      }
    );

    // configuring Passport
    passport.use(googleOauthStrategy);
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    // adding Passport and authentication routes
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(authRoutes);

    // Hook for routes that need auth
    const restrictAccess = (req, res, next) => {
      if (!req.isAuthenticated()) return res.redirect('/');
      next();
    };

    // Routes that need auth
    server.use('/certificate', restrictAccess);

    // Setup REST endpoints and Fabric CA connection
    server.use(initializeCaConnection(ca));
    server.use(registerAPI);

    // handling everything else with Next.js
    server.get('*', handle);

    http.createServer(server).listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    });
  });
