import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { X509 } from 'jsrsasign';

function parseSubjectInfo(subjectString) {
  const fields = subjectString.split('/');
  let result = {};

  for (let field of fields) {
    if (!field) continue;

    if (field.includes('OU=')) {
      let units = field
        .replace(/\+/g, '')
        .split('OU=')
        .slice(1);
      let type = units[0];
      let affiliation = units.slice(1);

      result.OU = affiliation.join('.').concat(` [${type}]`);
    } else if (field.includes('CN=')) {
      result.CN = field.replace('CN=', '');
    } else continue;
  }

  return result;
}

const CertificateDownloader = props => {
  if (!props || !props.certificate) {
    return 'No certificate found';
  }

  const x509 = new X509();
  x509.readCertPEM(props.certificate);

  const subjectInfo = parseSubjectInfo(x509.getSubjectString());

  return (
    <Form>
      <Form.Group as={Row}>
        <Form.Label column sm={2}>
          Identity
        </Form.Label>
        <Col sm={10}>
          <Form.Control readOnly value={subjectInfo.CN || 'Not found'} />
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm={2}>
          OU
        </Form.Label>
        <Col sm={10}>
          <Form.Control readOnly value={subjectInfo.OU || 'Not found'} />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Col sm={{ span: 10, offset: 2 }}>
          <Button
            href="http://localhost:3000/api/downloadCertificates"
            download
            variant="primary"
          >
            <i>
              <FontAwesomeIcon icon={['fas', 'file-download']} />
            </i>
            <span> | Download certificate</span>
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
};

export default CertificateDownloader;
