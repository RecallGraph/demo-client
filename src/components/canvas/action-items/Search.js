import PopperCore from "popper.js";
import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import ReactDOM from "react-dom";
import { Search, X } from "react-feather";
import {
  Button,
  Card,
  CardBody,
  CardLink,
  CardText,
  CardTitle
} from "reactstrap";
import { getObjClass } from "../../../lib/utils";

export default ({ canvas }) => (
  <Button
    className="ml-1"
    outline
    color="info"
    id="search"
    onClick={() => handler(canvas)}
  >
    <Search size={16} /> Search
  </Button>
);

function handler(canvas) {
  const data = canvas.cy
    .$("node")
    .jsons()
    .map(node => {
      const d = node.data;

      return {
        Body: d.Body,
        Type: d.Type,
        Class: getObjClass(d),
        id: d.id
      };
    });
  const columns = [
    {
      dataField: "Body",
      text: "Body",
      sort: true,
      filter: textFilter()
    },
    {
      dataField: "Class",
      text: "Class",
      sort: true,
      filter: textFilter()
    },
    {
      dataField: "Type",
      text: "Type",
      sort: true,
      filter: textFilter()
    }
  ];

  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    bgColor: "#00BFFF",
    onSelect: row => {
      const cy = canvas.cy;
      const node = cy.$id(row.id);
      const renderedPosition = node.renderedPosition();
      const viewportCenterX = cy.width() / 2;
      const viewportCenterY = cy.height() / 2;
      const relativeRenderedPosition = {
        x: viewportCenterX - renderedPosition.x,
        y: viewportCenterY - renderedPosition.y
      };
      const zoomFactor =
        Math.min(
          viewportCenterX / node.width(),
          viewportCenterY / node.height()
        ) / 2;

      if (cy.$("node").length <= 50) {
        cy.animate({
          panBy: relativeRenderedPosition,
          duration: 500
        }).delay(100, () => {
          cy.animate({
            zoom: {
              level: zoomFactor,
              renderedPosition: {
                x: viewportCenterX,
                y: viewportCenterY
              }
            },
            duration: 500
          });
        });
      } else {
        cy.panBy(relativeRenderedPosition);
        cy.zoom({
          level: zoomFactor,
          renderedPosition: {
            x: viewportCenterX,
            y: viewportCenterY
          }
        });
      }

      window.poppers["search"].destroy();
    }
  };

  const search = document.createElement("div");
  ReactDOM.render(
    <Card>
      <CardBody>
        <CardTitle
          tag="h5"
          className="mw-100 mb-4"
          style={{ minWidth: "50vw" }}
        >
          Search <small className="text-muted">(Jump to Body)</small>
          <CardLink
            href="#"
            className="btn btn-outline-dark float-right align-bottom ml-1"
            onClick={() => window.poppers["search"].destroy()}
          >
            <X />
          </CardLink>
        </CardTitle>
        <CardText tag="div" className="mw-100">
          <BootstrapTable
            keyField="id"
            data={data}
            hover
            condensed
            selectRow={selectRow}
            columns={columns}
            filter={filterFactory()}
          />
        </CardText>
      </CardBody>
    </Card>,
    search
  );

  document.getElementsByTagName("body")[0].appendChild(search);
  search.setAttribute("id", "popper-search");
  window.poppers = window.poppers || {};
  window.poppers["search"] = new PopperCore(
    document.getElementById("search"),
    search,
    {
      modifiers: {
        removeOnDestroy: true
      }
    }
  );
}
