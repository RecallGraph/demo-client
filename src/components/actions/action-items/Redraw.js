import React from "react";
import { Repeat } from "react-feather";
import { Button } from "reactstrap";

export default ({ canvas }) => (
  <Button
    className="ml-1"
    color="primary"
    onClick={canvas.cyReset.bind(canvas)}
  >
    <Repeat size={16} /> Redraw
  </Button>
);
