import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const Index = () => {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6">
          <Button block variant="danger" size="lg" href="/login">
            Login with Google
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Index;
