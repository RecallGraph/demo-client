import React from "react";
import { RotateCcw } from "react-feather";
import { Button } from "reactstrap";

export default ({ canvas }) => (
  <Button
    color="danger"
    onClick={async () => {
      const confirmed = window.confirm(
        "Are you sure? You will lose all your changes and history!"
      );
      if (confirmed) {
        await canvas.reset();
        canvas.cy.reset();
        canvas.setElements();
      }
    }}
  >
    <RotateCcw size={16} /> Reset
  </Button>
);
