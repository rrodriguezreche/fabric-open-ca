const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const {
  ensureAuthenticated,
  ensureCaClient,
  deleteUserIfRegistered
} = require('./hooks');
const { User } = require('fabric-client');

const router = express.Router();

router.use(bodyParser.json());

router.get(
  '/api/getCertificates',
  ensureAuthenticated,
  ensureCaClient,
  (req, res) => {
    let payload, err;

    req.ca.client
      .newCertificateService()
      .getCertificates(
        { id: req.usermail, ca: process.env.FABRIC_CA_NAME },
        req.ca.registrar
      )
      .then(response => {
        payload = response;
      })
      .catch(error => (err = error))
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

router.post(
  '/api/enroll',
  ensureAuthenticated,
  ensureCaClient,
  deleteUserIfRegistered,
  (req, res) => {
    const { csr } = req.body;

    let payload, err;
    let enrollmentID = req.usermail;

    req.ca.client
      .register(
        {
          enrollmentID,
          affiliation: process.env.FABRIC_CA_USERS_AFFILIATION,
          maxEnrollments: -1
        },
        req.ca.registrar
      )
      .then(enrollmentSecret => {
        if (enrollmentSecret) {
          return req.ca.client.enroll({ enrollmentID, enrollmentSecret, csr });
        } else {
          throw new Error(`Could not obtain an enrollment secret from CA`);
        }
      })
      .then(enrollResponse => {
        if (enrollResponse.certificate && enrollResponse.rootCertificate) {
          payload = enrollResponse;
        } else {
          throw new Error(`Could not obtain certificate and root certificate`);
        }
      })
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

// router.post('/api/test', (req, res) => {
//   const { enrollmentID } = req.body;

//   let payload, err;

//   req.ca.client
//     .register(
//       {
//         enrollmentID,
//         affiliation: process.env.FABRIC_CA_USERS_AFFILIATION,
//         maxEnrollments: -1
//       },
//       req.ca.registrar
//     )
//     .then(enrollmentSecret => (payload = { enrollmentID, enrollmentSecret }))
//     .catch(error => {
//       console.error(error);
//       err = error;
//     })
//     .finally(() => {
//       const response = {
//         status: payload && !err ? 'OK' : 'NOK',
//         payload,
//         err: err ? err.toString() : ''
//       };
//       res.json(response);
//     });
// });

module.exports = router;
