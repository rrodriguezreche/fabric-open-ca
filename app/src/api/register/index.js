const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { ensureAuthenticated, ensureCaClient } = require('./hooks');
const { User } = require('fabric-client');

const router = express.Router();

router.use(bodyParser.json());

router.get('/api/register', ensureAuthenticated, ensureCaClient, (req, res) => {
  res.json({ great: true });
  // res.send({ great: true });
});

router.post(
  '/api/register',
  ensureAuthenticated,
  ensureCaClient,
  (req, res) => {
    let payload, err;

    let enrollmentID = undefined;

    for (email of req.user.emails) {
      if (email.value && email.verified) {
        enrollmentID = email.value;
      }
      break;
    }

    if (!enrollmentID) {
      err = 'Cannot find a verified user email';
      res.json({
        status: 'NOK',
        payload,
        err
      });
      return;
    }

    req.ca.client
      .register(
        {
          enrollmentID,
          affiliation: process.env.FABRIC_CA_USERS_AFFILIATION,
          maxEnrollments: -1
        },
        req.ca.registrar
      )
      .then(enrollmentSecret => (payload = enrollmentSecret))
      .catch(error => {
        console.error(error);
        err = error;
      })
      .finally(() => {
        const response = {
          status: payload && !err ? 'OK' : 'NOK',
          payload,
          err: err ? err.toString() : ''
        };
        res.json(response);
      });
  }
);

router.get('/api/test', (req, res) => {
  req.ca.client
    .newIdentityService()
    .getOne('blabla@blabla.com', req.ca.registrar)
    .then(response => {
      console.log('getOne()');
      console.log(response);
    })
    .catch(error => {
      console.log('Error');
      console.error(error);
    });

  req.ca.client
    .newIdentityService()
    .getAll(req.ca.registrar)
    .then(response => {
      console.log('getAll()');
      console.log(response);
    })
    .catch(error => {
      console.log('Error');
      console.error(error);
    });
  res.json({ status: 'OK' });
});

module.exports = router;
