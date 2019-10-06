import Cytoscape from "cytoscape";
import Cxtmenu from "cytoscape-cxtmenu";
import Popper from "cytoscape-popper";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Col, Row } from "reactstrap";
import styleMap from "../../components/Canvas/style-map";
import { init, show } from "../../lib/api-client";
import { generateSessionID } from "../../lib/utils";
import { Redraw, Reset, Search, Timeline } from "./action-items";
import "./Canvas.css";
import { add, del, edit, view } from "./menu-items";
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
    const cy = this.cy;
    const minRadius = Math.min(cy.width(), cy.height()) / 8;
    const cxtMenu = {
      menuRadius: minRadius + 50, // the radius of the circular menu in pixels
      selector: "node", // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: this.buildMenu.bind(this), // function( ele ){ return [ /*...*/ ] }, // a function that returns
      // commands or a promise of commands
      fillColor: "rgba(0, 0, 0, 0.75)", // the background colour of the menu
      activeFillColor: "rgba(100, 100, 100, 0.5)", // the colour used to indicate the selected command
      activePadding: 10, // additional size in pixels for the active command
      indicatorSize: 16, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: minRadius - 40, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: minRadius - 20, // the maximum radius in pixels of the spotlight
      openMenuEvents: "tap", // space-separated cytoscape events that will open the menu; only
      // `cxttapstart` and/or `taphold` work here
      itemColor: "white", // the colour of text in the command's content
      itemTextShadowColor: "transparent", // the text shadow colour of the command's content
      // zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };

    // noinspection JSUnresolvedFunction
    this.cy.cxtmenu(cxtMenu);
  }

  buildMenu(node) {
    const sessionID = window.localStorage.getItem("sessionID");
    const menu = [];

    view(menu);
    if (node.data()["obj-class"] !== "stars") {
      del(menu, this, sessionID);
    }
    edit(menu, this, sessionID);
    add(menu, this, sessionID);

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
    cy.reset();

    const animate = cy.$("node").length <= 50;
    if (animate) {
      cy.layout(this.getOptions(animate)).run();
    }
  }

  setHandlers() {
    const cy = this.cy;

    cy.on("mouseover", "node", function() {
      document.getElementById("cy").style.cursor = "pointer";
    });

    cy.on("mouseout", "node", function() {
      document.getElementById("cy").style.cursor = "default";
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
    // noinspection JSUnusedGlobalSymbols
    return {
      name: "breadthfirst",

      fit: animate, // whether to fit the viewport to the graph
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
        <Row className="my-1">
          <Col>
            <Reset canvas={this} />
            <Redraw canvas={this} />
            <Search canvas={this} />
            <Timeline sessionID={window.localStorage.getItem("sessionID")} />
          </Col>
        </Row>
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
      </div>
    );
  }
}

export default Canvas;
