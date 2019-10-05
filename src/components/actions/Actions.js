import React from "react";
import { Col, Row } from "reactstrap";
import { Redraw, Reset, Search, Timeline } from "./action-items";

export default ({ canvas }) => (
  <Row className="my-1">
    <Col>
      <Reset canvas={canvas} />
      <Redraw canvas={canvas} />
      <Search canvas={canvas} />
      <Timeline />
    </Col>
  </Row>
);
