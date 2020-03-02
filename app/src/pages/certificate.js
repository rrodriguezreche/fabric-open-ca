import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import LoadingButton from '../components/LoadingButton';
import CertificateContainer from '../components/CertificateContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetch from 'isomorphic-fetch';
import { KEYUTIL, asn1 } from 'jsrsasign';

export default function Certificate({
  userEmail = 'Unknown',
  userName = 'Unknown',
  userPicture = false
}) {
  const [certificate, setCertificate] = useState('');
  const [register, setRegister] = useState({ registering: false });

  if (!certificate) {
    fetch('http://localhost:3000/api/getCertificates')
      .then(res => {
        if (res && res.status === 200 && res.json) {
          return res.json();
        }
      })
      .then(json => {
        if (
          json &&
          json.payload &&
          json.payload.result &&
          json.payload.result.certs &&
          json.payload.result.certs.length > 0
        ) {
          setCertificate(json.payload.result.certs[0].PEM);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  const postRegistration = event => {
    event.preventDefault();

    const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('EC', 'secp256r1');

    const csr = asn1.csr.CSRUtil.newCSRPEM({
      subject: { str: asn1.x509.X500Name.ldapToOneline(`CN=${userEmail}`) },
      sbjpubkey: pubKeyObj,
      sigalg: 'SHA256withECDSA',
      sbjprvkey: prvKeyObj
    });

    setRegister({ registering: true });

    let result = null;

    fetch('http://localhost:3000/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csr })
    })
      .then(async res => {
        result = res && res.json ? await res.json() : null;

        if (result.status === 'OK' && result.payload) {
          setCertificate(result.payload.certificate);
        } else {
          throw new Error(
            result.err
              ? result.error
              : `${
                  result.status !== 'OK'
                    ? 'Status is not OK'
                    : 'Returned payload is empty'
                }`
          );
        }
      })
      .catch(console.error)
      .finally(() => {
        setRegister({ registering: false });
      });
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col sm={6} xs={12}>
          <Card border="info">
            <Card.Header>
              <FontAwesomeIcon icon={['fas', 'address-card']} />
              <span> Your certificate</span>
            </Card.Header>
            <Card.Body>
              {<CertificateContainer certificate={certificate} /> ||
                'No certificate found'}
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card border="primary">
            <Card.Header>Actions</Card.Header>
            <Card.Body>
              <Card.Title>
                <Row>
                  <Col xs={4}>
                    <Image src={userPicture} roundedCircle fluid />
                  </Col>
                  <Col xs={8} className="align-self-center">
                    {userName} - <small>{userEmail}</small>
                  </Col>
                </Row>
              </Card.Title>
              <Card.Text>
                <LoadingButton
                  block
                  size="lg"
                  variant="danger"
                  onClick={postRegistration}
                  loading={register.registering}
                >
                  Register
                </LoadingButton>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

Certificate.getInitialProps = async ({ req }) => {
  return {
    userName: req.user._json.name,
    userEmail: req.user._json.email,
    userPicture: req.user._json.picture
  };
};
