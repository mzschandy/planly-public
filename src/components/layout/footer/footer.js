import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './footer.css';

function Footer() {
  return (
    <footer>
      <Container>
        <Row>
          <Col xs={12} className="justify-content-start d-flex foot">
            <div>Plan.ly - All Rights Reserved</div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
