const FabricCAServices = require('fabric-ca-client');
const { User } = require('fabric-client');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

const KEYSTORE_PATH =
  process.env.FABRIC_OPENCA_MASTER_KEYSTORE_PATH ||
  path.resolve(`${process.cwd()}/.etc/keystore.json`);

const CERTIFICATE_PATH =
  process.env.FABRIC_OPENCA_MASTER_CERTIFICATE ||
  path.resolve(`${process.cwd()}/.etc/certificate`);

const ROOT_CERTIFICATE_PATH =
  process.env.FABRIC_OPENCA_MASTER_ROOT_CERTIFICATE ||
  path.resolve(`${process.cwd()}/.etc/rootCertificate`);

async function getCaClient(url) {
  const _url =
    url && typeof url == 'string'
      ? url
      : process.env.FABRIC_OPENCA_SERVER_URL || 'http://localhost:7054';
  let count = 0;
  let caClient = undefined;

  while (!caClient && count < 10) {
    caClient = await new Promise(async (resolve, reject) => {
      try {
        const [host, port] = _url
          .replace('http://', '')
          .replace('https://', '')
          .split(':');

        const childProcess = await exec(`nc -zv ${host} ${port}`);

        childProcess.on('exit', code => {
          if (code === 0) {
            const caClient = new FabricCAServices(
              _url,
              {},
              process.env.FABRIC_CA_NAME
            );
            resolve(caClient);
          } else {
            setTimeout(() => {
              resolve(undefined);
              count++;
            }, 3000);
          }
        });
      } catch (error) {
        setTimeout(() => {
          resolve(undefined);
          count++;
        }, 3000);
      }
    });
  }

  if (!caClient) {
    console.warn(
      `Could not connect to Fabric CA Server in ${_url}. Is it running?`
    );
  }

  return caClient;
}

async function getMasterKeyStore(caClient) {
  let keystore = undefined;

  if (!fs.existsSync(KEYSTORE_PATH)) {
    const key = await caClient.getCryptoSuite().generateKey();
    keystore = {
      private: key.isPrivate(),
      simmetric: key.isSymmetric(),
      bytes: key.toBytes(),
      ski: key.getSKI()
    };
    fs.writeJSONSync(KEYSTORE_PATH, keystore);
  } else {
    keystore = fs.readJSONSync(KEYSTORE_PATH);
  }

  return keystore;
}

async function getMasterCertificates(caClient) {
  let certificate, rootCertificate;

  try {
    if (
      !fs.existsSync(CERTIFICATE_PATH) ||
      !fs.existsSync(ROOT_CERTIFICATE_PATH)
    ) {
      let csr = undefined;

      if (fs.existsSync(KEYSTORE_PATH)) {
        const keystore = fs.readJSONSync(KEYSTORE_PATH);

        const { bytes: pem } = keystore;
        const key = await caClient.getCryptoSuite().importKey(pem);

        const [
          enrollmentID,
          enrollmentSecret
        ] = process.env.FABRIC_CA_ADMIN_CREDENTIALS.split(':');

        csr = key.generateCSR(`CN=${enrollmentID}`);

        const enrollResponse = await caClient.enroll({
          enrollmentID,
          enrollmentSecret,
          csr
        });

        if (!enrollResponse || !enrollResponse.certificate)
          throw new Error('Did not get a certificate from the enroll request');

        if (!enrollResponse || !enrollResponse.rootCertificate)
          throw new Error(
            'Did not get a root certificate from the enroll request'
          );

        ({ certificate, rootCertificate } = enrollResponse);

        fs.writeFileSync(CERTIFICATE_PATH, certificate);
        fs.writeFileSync(ROOT_CERTIFICATE_PATH, rootCertificate);
      } else {
        throw new Error(
          `Cannot generate Certificate Signing Request: configured keystore ${KEYSTORE_PATH} does not exist`
        );
      }
    } else {
      certificate = fs.readFileSync(CERTIFICATE_PATH).toString();
      rootCertificate = fs.readFileSync(ROOT_CERTIFICATE_PATH).toString();
    }
  } catch (error) {
    console.warn('Cannot get master certificates');
    console.error(error);
  } finally {
    return {
      certificate,
      rootCertificate
    };
  }
}

async function getRegistrarEntity(caClient, privateKey, certificate) {
  const [registrarEnrollmentID] = process.env.FABRIC_CA_ADMIN_CREDENTIALS.split(
    ':'
  );

  let registrar = new User({
    registrarEnrollmentID,
    name: registrarEnrollmentID
  });

  const key = await caClient.getCryptoSuite().importKey(privateKey);
  await registrar.setEnrollment(key, certificate, '*');

  return registrar;
}

const initializeCaConnection = ca => {
  const f = (req, res, next) => {
    req.ca = ca;
    next();
  };

  return f;

  // req.ca = {};
  // getCaClient()
  //   .then(caClient => {
  //     req.ca.client = caClient;
  //     return caClient;
  //   })
  //   .then(getMasterKeyStore)
  //   .then(keystore => {
  //     req.ca.keystore = keystore;
  //     return keystore;
  //   })
  //   .then(getMasterCertificates)
  //   .then(certificates => {
  //     req.ca.certificate = certificates.certificate;
  //     req.ca.rootCertificate = certificates.rootCertificate;
  //   })
  //   .finally(next);
};

// const csrFromMasterKeystore = async ({ caClient, enrollmentID }) => {
//   let csr = undefined;

//   if (fs.existsSync(KEYSTORE_PATH)) {
//     const keystore = fs.readJSONSync(KEYSTORE_PATH);

//     const { bytes: pem } = keystore;
//     const key = await caClient.getCryptoSuite().importKey(pem);

//     csr = key.generateCSR(`CN=${enrollmentID}`);
//   }

//   return csr;
// };

module.exports = {
  initializeCaConnection,
  getCaClient,
  getMasterKeyStore,
  getMasterCertificates,
  getRegistrarEntity
};
