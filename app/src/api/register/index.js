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
        { id: req.usermail, ca: process.env.FABRIC_CA_NAME, notrevoked: true },
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

router.get(
  '/api/downloadCertificates',
  ensureAuthenticated,
  ensureCaClient,
  (req, res) => {
    let payload, err;

    req.ca.client
      .newCertificateService()
      .getCertificates(
        { id: req.usermail, ca: process.env.FABRIC_CA_NAME, notrevoked: true },
        req.ca.registrar
      )
      .then(response => {
        if (
          response &&
          response.result &&
          response.result.certs &&
          response.result.certs.length > 0 &&
          response.result.certs[0].PEM
        ) {
          let filePath = `/tmp/${req.usermail}.pem`;
          fs.writeFileSync(filePath, response.result.certs[0].PEM);
          res.download(filePath, error => {
            if (error) throw new Error(err);
            fs.unlink(filePath);
          });
        } else {
          throw new Error('Certificate not found');
        }
      })
      .catch(error => {
        console.error(error);
        res.sendStatus(404);
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

router.post('/api/test', (req, res) => {
  req.ca.client
    .revoke({ enrollmentID: 'rafael@geodb.com' }, req.ca.registrar)
    .then(response => {
      console.log(response.result.RevokedCerts);
    })
    .catch(console.error)
    .finally(() => res.json({ status: 'OK' }));
});

module.exports = router;
