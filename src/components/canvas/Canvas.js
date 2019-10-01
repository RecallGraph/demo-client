import Cytoscape from "cytoscape";
import Cxtmenu from "cytoscape-cxtmenu";
import Popper from "cytoscape-popper";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import ReactDOM from "react-dom";
import { Plus, Repeat, RotateCcw, Trash2, XCircle } from "react-feather";
import { Button, Col, Row } from "reactstrap";
import { init, remove, show } from "../../lib/api-client";
import { generateSessionID } from "../../lib/utils";
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
      openMenuEvents: "tap", // space-separated cytoscape events that will open the menu; only
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

    const add = document.createElement("span");
    ReactDOM.render(<Plus />, add);
    menu.push({
      fillColor: "rgba(0, 200, 0, 0.75)",
      content: add.outerHTML,
      contentStyle: {},
      select: function(el) {
        console.log(el.data());
      },
      enabled: true
    });

    const cancel = document.createElement("span");
    ReactDOM.render(<XCircle />, cancel);
    menu.push({
      fillColor: "rgba(200, 200, 200, 0.75)",
      content: cancel.outerHTML,
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

    return menu;
  }

  async setElements() {
    const sessionID = window.localStorage.getItem("sessionID");
    let data = await show(sessionID);
    this.setState({
      elements: data
    });
  }

  setHandlers() {
    const cy = this.cy;

    cy.on("resize", () => {
      cy.reset();
      cy.layout(this.getOptions()).run();
    });

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
        moons: "#7798BF",
        comets: "#aaeeee",
        asteroids: "#ff0066"
      };
      node.style("background-color", styleMap[node.data()["obj-class"]]);
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

  getOptions() {
    return {
      name: "breadthfirst",

      fit: true, // whether to fit the viewport to the graph
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
      animate: true, // whether to transition the node positions
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
            &nbsp;
            <Button
              color="primary"
              onClick={() => {
                this.cy.reset();
                this.setElements();
              }}
            >
              <Repeat size={16} /> Redraw
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Canvas;
