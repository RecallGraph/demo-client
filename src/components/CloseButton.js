import React from "react";
import { X } from "react-feather";
import { CardLink } from "reactstrap";
import { removePopper } from "../lib/utils";

export default ({ popperKey, divKey }) => (
  <CardLink
    href="#"
    className="btn btn-outline-dark float-right align-bottom ml-1"
    onClick={() => removePopper(popperKey, divKey)}
  >
    <X />
  </CardLink>
);
