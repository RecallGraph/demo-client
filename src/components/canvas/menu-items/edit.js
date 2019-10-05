import React from "react";
import ReactDOM from "react-dom";
import { Edit3, Save, X } from "react-feather";
import {
  Card,
  CardBody,
  CardLink,
  CardText,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import { edit as editNode } from "../../../lib/api-client";
import { getTableProps } from "../../../lib/utils";

export default (menu, canvas, sessionID) => {
  const edit = document.createElement("span");
  ReactDOM.render(<Edit3 />, edit);
  menu.push({
    fillColor: "rgba(255, 165, 0, 0.75)",
    content: edit.outerHTML,
    select: function(el) {
      window.poppers = window.poppers || {};
      window.poppers[el.id()] = el.popper({
        content: () => {
          const { objClass, body, content } = getTableProps(el);

          const popperCard = document.createElement("div");
          ReactDOM.render(
            <Card>
              <CardBody>
                <CardTitle
                  tag="h5"
                  className="mw-100 mb-4"
                  style={{ minWidth: "50vw" }}
                >
                  Edit {body}&nbsp;
                  <span>
                    <small className="text-muted">({objClass})</small>
                  </span>
                  <CardLink
                    href="#"
                    className="btn btn-outline-dark float-right align-bottom ml-1"
                    onClick={() => {
                      window.poppers[el.id()].destroy();
                      document.getElementById(`popper-${el.id()}`).remove();
                    }}
                  >
                    <X />
                  </CardLink>
                  <CardLink
                    href="#"
                    className="btn btn-primary float-right"
                    id="add"
                    onClick={async () => {
                      const data = Object.assign({}, el.data());

                      for (const c of content) {
                        data[c.field] = c.value;
                      }
                      data._id = data.id;
                      delete data.id;

                      window.poppers[el.id()].destroy();
                      document.getElementById(`popper-${el.id()}`).remove();

                      await editNode(sessionID, data);
                      canvas.setElements();
                    }}
                  >
                    <Save /> Save
                  </CardLink>
                </CardTitle>
                <CardText tag="div">
                  <Form>
                    {content.map(c => (
                      <FormGroup key={c.field} row>
                        <Label for={`${el.id()}-${c.field}`} sm={4} size="sm">
                          {c.field}
                        </Label>
                        <Col sm={8}>
                          <Input
                            type="text"
                            name={c.field}
                            id={`${el.id()}-${c.field}`}
                            defaultValue={c.value}
                            required={true}
                            bsSize="sm"
                            onChange={e => {
                              c.value = e.target.value;
                            }}
                          />
                        </Col>
                      </FormGroup>
                    ))}
                  </Form>
                </CardText>
              </CardBody>
            </Card>,
            popperCard
          );

          document.getElementsByTagName("body")[0].appendChild(popperCard);
          popperCard.setAttribute("id", `popper-${el.id()}`);

          return popperCard;
        }
      });
    },
    enabled: true
  });
};
