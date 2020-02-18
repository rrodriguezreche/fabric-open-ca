import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import LoadingButton from '../components/LoadingButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetch from 'isomorphic-fetch';

export default function Certificate() {
  const [certificate, setCertificate] = useState('');
  const [register, setRegister] = useState({ registering: false, file: null });

  if (!certificate) {
    fetch('http://localhost:3000/api/register')
      .then(res => {
        if (res && res.status === 200 && res.json) {
          return res.json();
        }
      })
      .then(result => {
        setCertificate(JSON.stringify(result));
      })
      .catch(error => {
        console.error(error);
      });
  }

  const postRegistration = event => {
    event.preventDefault();
    setRegister({ registering: true, file: null });

    let result = null;

    fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        result = res && res.json ? await res.json() : null;

        console.log(result);
        if (result.status === 'OK') {
          console.log(`Enrollment secret: ${result.payload}`);
          return result.payload;
        } else {
          throw new Error(result.err);
        }
      })
      .catch(console.error)
      .finally(() => setRegister({ registering: false, file: result }));
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
              <Card.Text>{certificate || 'No certificate found'}</Card.Text>
            </Card.Body>
            {/* <Card.Footer>
              <Button variant="primary" onClick={() => setCertificate('yeee')}>
                Check
              </Button>
            </Card.Footer> */}
          </Card>
        </Col>

        <Col>
          <Card border="primary">
            <Card.Header>Actions</Card.Header>
            <Card.Body>
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

// Certificate.getInitialProps = async ({ req }) => {
//   const baseURL = req ? `${req.protocol}://${req.get('Host')}` : '';
//   const res = await fetch(`${baseURL}/api/register`);

//   return {
//     certificate: res.status === 200 && (await res.json()),
//     error: res.status != 200
//   };
// };
