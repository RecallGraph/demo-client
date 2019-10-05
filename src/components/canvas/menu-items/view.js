import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ReactDOM from "react-dom";
import { Eye } from "react-feather";
import { Card, CardBody, CardText, CardTitle } from "reactstrap";
import { getTableProps, setPopper } from "../../../lib/utils";
import CloseButton from "../elements/CloseButton";

export default menu => {
  const view = document.createElement("span");
  ReactDOM.render(<Eye />, view);
  menu.push({
    fillColor: "rgba(0, 0, 200, 0.75)",
    content: view.outerHTML,
    select: function(el) {
      setPopper(
        el.id(),
        el.popper({
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
                    <CloseButton
                      divKey={`popper-${el.id()}`}
                      popperKey={el.id()}
                    />
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
          }
        })
      );
    },
    enabled: true
  });
};
