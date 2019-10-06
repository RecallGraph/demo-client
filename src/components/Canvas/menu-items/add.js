import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import ReactDOM from "react-dom";
import { Plus } from "react-feather";
import { Card, CardBody, CardLink, CardText, CardTitle } from "reactstrap";
import CloseButton from "../../../components/CloseButton";
import { addChildren, list } from "../../../lib/api-client";
import { getObjClass, removePopper, setPopper } from "../../../lib/utils";

export default (menu, canvas, sessionID) => {
  const add = document.createElement("span");
  ReactDOM.render(<Plus />, add);
  menu.push({
    fillColor: "rgba(0, 200, 0, 0.75)",
    content: add.outerHTML,
    contentStyle: {},
    select: async function(el) {
      const children = el.outgoers("node");
      const data = (await list(sessionID, el.data()._rawId)).filter(
        d => !children.filter(c => c.data()._rawId === d._rawId).length
      );

      for (let d of data) {
        d.Class = getObjClass(d);
      }

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

      const selected = new Set();
      const selectRow = {
        mode: "checkbox",
        clickToSelect: true,
        bgColor: "#00BFFF",
        onSelect: (row, isSelect) => {
          const addButton = document.getElementById("add");

          if (isSelect) {
            selected.add(row._rawId);
            if (addButton.classList.contains("disabled")) {
              addButton.classList.remove("disabled");
            }
          } else {
            selected.delete(row._rawId);
            if (!selected.size) {
              addButton.classList.add("disabled");
            }
          }
        },
        onSelectAll: (isSelect, rows) => {
          const addButton = document.getElementById("add");

          if (isSelect) {
            for (const row of rows) {
              selected.add(row._rawId);
              addButton.classList.remove("disabled");
            }
          } else {
            selected.clear();
            addButton.classList.add("disabled");
          }
        }
      };

      setPopper(
        el.id(),
        el.popper({
          content: () => {
            const popperCard = document.createElement("div");
            ReactDOM.render(
              <Card className="border-dark">
                <CardBody>
                  <CardTitle
                    tag="h5"
                    className="mw-100 mb-4"
                    style={{ minWidth: "50vw" }}
                  >
                    Add Orbiting Body{" "}
                    <small className="text-muted">({el.data().Body})</small>
                    <CloseButton
                      divKey={`popper-${el.id()}`}
                      popperKey={el.id()}
                    />
                    <CardLink
                      href="#"
                      className="btn btn-success disabled float-right"
                      id="add"
                      onClick={async () => {
                        const selectedData = data.filter(d =>
                          selected.has(d._rawId)
                        );
                        for (let s of selectedData) {
                          delete s.Class;
                        }

                        removePopper(el.id(), `popper-${el.id()}`);

                        await addChildren(sessionID, el.id(), selectedData);
                        canvas.setElements();
                      }}
                    >
                      <Plus /> Add Selected
                    </CardLink>
                  </CardTitle>
                  <CardText tag="div" className="mw-100">
                    {data.length ? (
                      <BootstrapTable
                        bootstrap4
                        keyField="_rawId"
                        data={data}
                        columns={columns}
                        hover
                        condensed
                        selectRow={selectRow}
                        filter={filterFactory()}
                      />
                    ) : (
                      <p>No Orbiters Found.</p>
                    )}
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
