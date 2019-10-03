import Cytoscape from "cytoscape";
import Cxtmenu from "cytoscape-cxtmenu";
import Popper from "cytoscape-popper";
import PopperCore from "popper.js";
import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import CytoscapeComponent from "react-cytoscapejs";
import ReactDOM from "react-dom";
import {
  Edit3,
  Eye,
  Plus,
  Repeat,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
  XCircle
} from "react-feather";
import {
  Button,
  Card,
  CardBody,
  CardLink,
  CardText,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row
} from "reactstrap";
import {
  addChildren,
  edit as editNode,
  init,
  list,
  remove,
  show
} from "../../lib/api-client";
import { generateSessionID, getObjClass } from "../../lib/utils";
import "./Canvas.css";
import style from "./style";

Cytoscape.use(Popper);
Cytoscape.use(Cxtmenu);

class Canvas extends React.Component {
  constructor(props = {}) {
    super(props);

    this.state = {
      elements: []
    };
  }

  async componentDidMount() {
    window.cy = this.cy;

    this.configurePlugins();
    this.setHandlers();

    let sessionID = window.localStorage.getItem("sessionID");
    if (!sessionID) {
      await this.reset();
    }

    this.setElements();
  }

  reset() {
    const sessionID = generateSessionID();
    return init(sessionID);
  }

  configurePlugins() {
    const cxtMenu = {
      menuRadius: 60, // the radius of the circular menu in pixels
      selector: "node", // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: this.buildMenu.bind(this), // function( ele ){ return [ /*...*/ ] }, // a function that returns
      // commands or a promise of commands
      fillColor: "rgba(0, 0, 0, 0.75)", // the background colour of the menu
      activeFillColor: "rgba(100, 100, 100, 0.5)", // the colour used to indicate the selected command
      activePadding: 10, // additional size in pixels for the active command
      indicatorSize: 16, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 10, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 20, // the maximum radius in pixels of the spotlight
      openMenuEvents: "taphold cxttap", // space-separated cytoscape events that will open the menu; only
      // `cxttapstart` and/or `taphold` work here
      itemColor: "white", // the colour of text in the command's content
      itemTextShadowColor: "transparent", // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };

    this.cy.cxtmenu(cxtMenu);
  }

  buildMenu(node) {
    const sessionID = window.localStorage.getItem("sessionID");
    const menu = [];
    const self = this;

    const view = document.createElement("span");
    ReactDOM.render(<Eye />, view);
    menu.push({
      fillColor: "rgba(0, 0, 200, 0.75)",
      content: view.outerHTML,
      select: function(el) {
        window.poppers = window.poppers || {};
        window.poppers[el.id()] = el.popper({
          content: () => {
            const data = Object.assign({}, el.data());
            delete data.id;
            delete data._rawId;
            const objClass = getObjClass(data);
            delete data["obj-class"];
            const body = data.Body;
            delete data.Body;

            const content = Object.entries(data).map(entry => ({
              field: entry[0],
              value: entry[1]
            }));

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
              <Card>
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
                      onClick={() => {
                        window.poppers[el.id()].destroy();
                        document.getElementById(`popper-${el.id()}`).remove();
                      }}
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
          }
        });
      },
      enabled: true
    });

    if (node.data()["obj-class"] !== "stars") {
      const del = document.createElement("span");
      ReactDOM.render(<Trash2 />, del);
      menu.push({
        fillColor: "rgba(200, 0, 0, 0.75)",
        content: del.outerHTML,
        contentStyle: {},
        select: async function(el) {
          const confirmed = window.confirm(
            "Are you sure? This will remove the selected node and ALL its descendants!"
          );
          if (confirmed) {
            await remove(sessionID, el.id());
            self.setElements();
          }
        },
        enabled: true
      });
    }

    const cancel = document.createElement("span");
    ReactDOM.render(<XCircle />, cancel);
    menu.push({
      fillColor: "rgba(200, 200, 200, 0.75)",
      content: cancel.outerHTML,
      enabled: true
    });

    const edit = document.createElement("span");
    ReactDOM.render(<Edit3 />, edit);
    menu.push({
      fillColor: "rgba(255, 165, 0, 0.75)",
      content: edit.outerHTML,
      select: function(el) {
        window.poppers = window.poppers || {};
        window.poppers[el.id()] = el.popper({
          content: () => {
            const data = Object.assign({}, el.data());
            delete data.id;
            delete data._rawId;

            const objClass = getObjClass(data);
            delete data["obj-class"];

            const body = data.Body;
            delete data.Body;

            const content = Object.entries(data).map(entry => ({
              field: entry[0],
              value: entry[1]
            }));

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
                        self.setElements();
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

        window.poppers = window.poppers || {};
        window.poppers[el.id()] = el.popper({
          content: () => {
            const popperCard = document.createElement("div");
            ReactDOM.render(
              <Card>
                <CardBody>
                  <CardTitle
                    tag="h5"
                    className="mw-100 mb-4"
                    style={{ minWidth: "50vw" }}
                  >
                    Add Orbiting Body{" "}
                    <small className="text-muted">({el.data().Body})</small>
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
                      className="btn btn-success disabled float-right"
                      id="add"
                      onClick={async () => {
                        const selectedData = data.filter(d =>
                          selected.has(d._rawId)
                        );
                        for (let s of selectedData) {
                          delete s.Class;
                        }

                        window.poppers[el.id()].destroy();
                        document.getElementById(`popper-${el.id()}`).remove();

                        await addChildren(sessionID, el.id(), selectedData);
                        self.setElements();
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
        });
      },
      enabled: true
    });

    return menu;
  }

  async setElements() {
    const sessionID = window.localStorage.getItem("sessionID");
    let data = await show(sessionID);
    this.setState({
      elements: data
    });
  }

  cyReset() {
    const cy = this.cy;
    const animate = cy.$("node").length <= 50;

    cy.reset();

    if (animate) {
      cy.layout(this.getOptions(animate)).run();
    }
  }

  setHandlers() {
    const cy = this.cy;

    cy.on("select mouseover", "edge", e => {
      e.target.style({
        width: 4,
        "line-color": "#007bff",
        "target-arrow-color": "#007bff"
      });
    });

    cy.on("unselect mouseout", "edge", e => {
      const edge = e.target;

      if (!edge.selected()) {
        edge.style({
          width: 2,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc"
        });
      }
    });

    cy.on("add", "node", e => {
      const node = e.target;
      const styleMap = {
        stars: "#ffff00",
        planets: "#f7a35c",
        dwarf_planets: "#90ee7e",
        moons: "#eeaaee",
        comets: "#aaeeee",
        asteroids: "#ff0066"
      };
      node.style("background-color", styleMap[node.data()["obj-class"]]);

      // noinspection JSNonASCIINames
      const size =
        Math.log(50 * (parseFloat(node.data()["Radius (R⊕)"]) || 1)) * 10;
      node.style("width", `${size}px`);
      node.style("height", `${size}px`);

      node.scratch("style", node.style());
    });

    cy.on("mouseover select", "node", e => {
      e.target.style("background-color", "#007bff");
    });

    cy.on("mouseout unselect", "node", e => {
      const node = e.target;

      if (!node.selected()) {
        node.style(
          "background-color",
          node.scratch("style")["background-color"]
        );
      }
    });
  }

  getOptions(animate = true) {
    return {
      name: "breadthfirst",

      fit: false, // whether to fit the viewport to the graph
      directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
      padding: 30, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
      spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout
      // algorithm
      maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS
      // only)
      animate, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animateFilter: function() {
        return true;
      }, // a function that determines whether the node should be animated.  All nodes animated by default on animate
      // enabled.  Non-animated nodes are positioned immediately when the layout starts
      transform: function(node, position) {
        return position;
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };
  }

  render() {
    const options = this.getOptions();

    return (
      <div>
        <Row>
          <Col>
            <div
              className="border border-secondary rounded w-100"
              id="cy-container"
            >
              <div className="m-1" id="cy">
                <CytoscapeComponent
                  cy={cy => {
                    this.cy = cy;
                  }}
                  style={{ width: "100%", height: "100%" }}
                  stylesheet={style}
                  layout={options}
                  elements={CytoscapeComponent.normalizeElements(
                    this.state.elements
                  )}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row className="my-1">
          <Col>
            <Button
              className="float-right ml-1"
              color="danger"
              onClick={async () => {
                const confirmed = window.confirm(
                  "Are you sure? You will lose all your changes and history!"
                );
                if (confirmed) {
                  await this.reset();
                  this.cy.reset();
                  this.setElements();
                }
              }}
            >
              <RotateCcw size={16} /> Reset
            </Button>
            <Button
              className="float-right ml-1"
              color="primary"
              onClick={this.cyReset.bind(this)}
            >
              <Repeat size={16} /> Redraw
            </Button>
            <Button
              className="float-right"
              outline
              color="info"
              id="search"
              onClick={() => {
                const data = this.cy
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
                    const cy = this.cy;
                    const node = cy.$id(row.id);
                    const renderedPosition = node.renderedPosition();
                    const viewportCenterX = cy.width() / 2;
                    const viewportCenterY = cy.height() / 2;
                    const relativeRenderedPosition = {
                      x: viewportCenterX - renderedPosition.x,
                      y: viewportCenterY - renderedPosition.y
                    };
                    const zoomFactor = Math.min(
                      viewportCenterX / node.width(),
                      viewportCenterY / node.height()
                    );

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
                    document.getElementById("popper-search").remove();
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
                        Search{" "}
                        <small className="text-muted">(Jump to Body)</small>
                        <CardLink
                          href="#"
                          className="btn btn-outline-dark float-right align-bottom ml-1"
                          onClick={() => {
                            window.poppers["search"].destroy();
                            document.getElementById("popper-search").remove();
                          }}
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
                  search
                );
              }}
            >
              <Search size={16} /> Search
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Canvas;
