import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetch from 'isomorphic-fetch';

export default function Certificate() {
  const [certificate, setCertificate] = useState('');

  if (!certificate) {
    fetch('http://localhost:3000/api/register')
      .then(res => {
        if (res && res.json) {
          return res.json();
        } else {
          console.log('Nope!');
        }
      })
      .then(result => setCertificate(JSON.stringify(result)))
      .catch(console.error);
  }

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
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
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
