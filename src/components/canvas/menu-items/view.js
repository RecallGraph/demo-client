import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ReactDOM from "react-dom";
import { Eye, X } from "react-feather";
import { Card, CardBody, CardLink, CardText, CardTitle } from "reactstrap";
import { getTableProps } from "../../../lib/utils";

export default menu => {
  const view = document.createElement("span");
  ReactDOM.render(<Eye />, view);
  menu.push({
    fillColor: "rgba(0, 0, 200, 0.75)",
    content: view.outerHTML,
    select: function(el) {
      window.poppers = window.poppers || {};
      window.poppers[el.id()] = el.popper({
        content: () => {
          const { objClass, body, content } = getTableProps(el);

          const columns = [
            {
              dataField: "field",
              text: "Field"
            },
            {
              dataField: "value",
              text: "Value"
            }
          ];

          const popperCard = document.createElement("div");
          ReactDOM.render(
            <Card className="border-dark">
              <CardBody>
                <CardTitle
                  tag="h5"
                  className="mw-100 mb-4"
                  style={{ minWidth: "50vw" }}
                >
                  {body}&nbsp;
                  <span>
                    <small className="text-muted">({objClass})</small>
                  </span>
                  <CardLink
                    href="#"
                    className="btn btn-outline-dark float-right align-bottom"
                    onClick={() => window.poppers[el.id()].destroy()}
                  >
                    <X />
                  </CardLink>
                </CardTitle>
                <CardText tag="div">
                  <BootstrapTable
                    bootstrap4
                    keyField="field"
                    data={content}
                    columns={columns}
                    hover
                  />
                </CardText>
              </CardBody>
            </Card>,
            popperCard
          );

          document.getElementsByTagName("body")[0].appendChild(popperCard);
          popperCard.setAttribute("id", `popper-${el.id()}`);

          return popperCard;
        },
        popper: {
          modifiers: {
            removeOnDestroy: true
          }
        }
      });
    },
    enabled: true
  });
};
