import Cytoscape from "cytoscape";
import Cxtmenu from "cytoscape-cxtmenu";
import Edgehandles from "cytoscape-edgehandles";
import Popper from "cytoscape-popper";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import ReactDOM from "react-dom";
import {
  Maximize2,
  Minimize2,
  Printer,
  Repeat,
  RotateCcw
} from "react-feather";
import { Button, Col, Row } from "reactstrap";
import { init, load, show } from "../../lib/api-client";
import { annotate, buildSwitchBoard, generateSessionID } from "../../lib/utils";
import "./Canvas.css";
import style from "./style";

Cytoscape.use(Popper);
Cytoscape.use(Cxtmenu);
Cytoscape.use(Edgehandles);

class Canvas extends React.Component {
  constructor(props = {}) {
    super(props);

    window.datacy = this.datacy = Cytoscape({
      headless: true
    });

    let sessionID = window.localStorage.getItem("sessionID");
    if (!sessionID) {
      sessionID = generateSessionID();
      init(sessionID);
    }

    this.state = {
      elements: [],
      sessionID
    };
  }

  async componentDidMount() {
    window.cy = this.cy;

    this.configurePlugins();
    this.setHandlers();

    let data = await load(this.state.sessionID);
    data = annotate(data);
    this.setData(data);

    const sun = this.getSun();
    const switchboard = sun.scratch("switchboard");
    switchboard.planets = true;

    this.setElements();
  }

  getSun() {
    return this.datacy.$('node[obj-class = "stars"]')[0];
  }

  configurePlugins() {
    // the default values of each option are outlined below:
    const ehDefaults = {
      preview: true, // whether to show added edges preview before releasing selection
      hoverDelay: 150, // time spent hovering over a target node before it is considered selected
      handleNodes: "node", // selector/filter function for whether edges can be made from a given node
      snap: true, // when enabled, the edge can be drawn by just moving close to a target node
      snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
      disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger
      // trackpad swipe and pinch-to-zoom
      handlePosition: function(node) {
        return "middle top"; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top",
        // "middle top"
      },
      handleInDrawMode: false, // whether to show the handle in draw mode
      edgeType: function(sourceNode, targetNode) {
        // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
        // returning null/undefined means an edge can't be added between the two nodes
        return "flat";
      },
      loopAllowed: function(node) {
        // for the specified node, return whether edges from itself to itself are allowed
        return true;
      },
      nodeLoopOffset: -50, // offset for edgeType: 'node' loops
      nodeParams: function(sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for intermediary node
        return {};
      },
      edgeParams: function(sourceNode, targetNode, i) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        // NB: i indicates edge index in case of edgeType: 'node'
        return {};
      },
      ghostEdgeParams: function() {
        // return element object to be passed to cy.add() for the ghost edge
        // (default classes are always added for you)
        return {};
      },
      show: function(sourceNode) {
        // fired when handle is shown
      },
      hide: function(sourceNode) {
        // fired when the handle is hidden
      },
      start: function(sourceNode) {
        // fired when edgehandles interaction starts (drag on handle)
      },
      complete: function(sourceNode, targetNode, addedEles) {
        // fired when edgehandles is done and elements are added
      },
      stop: function(sourceNode) {
        // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
      },
      cancel: function(sourceNode, cancelledTargets) {
        // fired when edgehandles are cancelled (incomplete gesture)
      },
      hoverover: function(sourceNode, targetNode) {
        // fired when a target is hovered
      },
      hoverout: function(sourceNode, targetNode) {
        // fired when a target isn't hovered anymore
      },
      previewon: function(sourceNode, targetNode, previewEles) {
        // fired when preview is shown
      },
      previewoff: function(sourceNode, targetNode, previewEles) {
        // fired when preview is hidden
      },
      drawon: function() {
        // fired when draw mode enabled
      },
      drawoff: function() {
        // fired when draw mode disabled
      }
    };
    this.eh = this.cy.edgehandles(ehDefaults);

    const cxtDefaults = [
      {
        menuRadius: 80, // the radius of the circular menu in pixels
        selector: "*", // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: this.buildMenu.bind(this), // function( ele ){ return [ /*...*/ ] }, // a function that returns
        // commands
        // or a
        // promise of
        // commands
        fillColor: "rgba(0, 0, 0, 0.75)", // the background colour of the menu
        activeFillColor: "rgba(1, 105, 217, 0.75)", // the colour used to indicate the selected command
        activePadding: 10, // additional size in pixels for the active command
        indicatorSize: 24, // the size in pixels of the pointer to the active command
        separatorWidth: 3, // the empty spacing in pixels between successive commands
        spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
        openMenuEvents: "cxttapstart taphold", // space-separated cytoscape events that will open the menu; only
        // `cxttapstart` and/or `taphold` work here
        itemColor: "white", // the colour of text in the command's content
        itemTextShadowColor: "transparent", // the text shadow colour of the command's content
        zIndex: 9999, // the z-index of the ui div
        atMouse: false // draw menu at mouse position
      },
      {
        selector: "core",

        commands: [
          {
            content: "bg1",
            select: function() {
              console.log("bg1");
            }
          },

          {
            content: "bg2",
            select: function() {
              console.log("bg2");
            }
          }
        ],
        openMenuEvents: "cxttapstart taphold"
      }
    ];

    cxtDefaults.forEach(cxt => this.cy.cxtmenu(cxt));
  }

  getChildren(node, objClass) {
    const outgoers = this.datacy.$id(node.id()).outgoers();

    if (objClass) {
      return outgoers.filter(el => {
        if (el.isNode()) {
          return el.data()["obj-class"] === objClass;
        } else {
          return el.target().data()["obj-class"] === objClass;
        }
      });
    }

    return outgoers;
  }

  getDataNode(node) {
    return this.datacy.$id(node.id());
  }

  revealChildren(node, objClass) {
    const dataNode = this.getDataNode(node);
    const switchboard = dataNode.scratch("switchboard");
    switchboard[objClass] = true;

    this.setElements();
  }

  hideChildren(node, objClass) {
    const dataNode = this.getDataNode(node);
    const switchboard = dataNode.scratch("switchboard");
    switchboard[objClass] = false;

    this.setElements();
  }

  buildMenu(node) {
    const dataNode = this.getDataNode(node);
    const menu = [];

    const print = document.createElement("span");
    ReactDOM.render(<Printer />, print);
    menu.push({
      fillColor: "rgba(200, 200, 200, 0.75)",
      content: print.outerHTML,
      contentStyle: {},
      select: function(el) {
        console.log(el.data());
      },
      enabled: true
    });

    const switchboard = dataNode.scratch("switchboard");
    for (const key in switchboard) {
      const K = key.charAt(0).toUpperCase();
      if (switchboard[key]) {
        const menuItemMinimize = document.createElement("span");
        ReactDOM.render(
          <span>
            <Minimize2 /> {K}
          </span>,
          menuItemMinimize
        );

        menu.push({
          fillColor: "rgba(0, 200, 200, 0.75)",
          content: menuItemMinimize.outerHTML,
          select: node => this.hideChildren(node, key)
        });
      } else {
        const menuItemMaximize = document.createElement("span");
        ReactDOM.render(
          <span>
            <Maximize2 /> {K}
          </span>,
          menuItemMaximize
        );

        menu.push({
          fillColor: "rgba(200, 200, 0, 0.75)",
          content: menuItemMaximize.outerHTML,
          select: node => this.revealChildren(node, key)
        });
      }
    }

    return menu;
  }

  async setElements(startingNode, elements = []) {
    let data = await show(this.state.sessionID);
    if (data.length) {
      data = this.annotate(data);
    }

    startingNode = startingNode || this.getSun();
    elements.push(startingNode);

    const switchboard = startingNode.scratch("switchboard");
    for (const key in switchboard) {
      if (switchboard[key]) {
        const children = this.getChildren(startingNode, key);
        children.forEach(el => {
          elements.push(el);

          if (el.isNode()) {
            this.setElements(el, elements);
          }
        });
      }
    }

    if (!arguments.length) {
      this.setState({
        elements: elements.map(el => el.json())
      });
    }
  }

  setData(data) {
    const cy = this.datacy;

    cy.elements().remove();
    cy.add(data);
    cy.$("node [[degree = 0]]").remove();
    cy.$("*").addClass("data");
    cy.$("node").forEach(node => buildSwitchBoard(node));
  }

  setHandlers() {
    const cy = this.cy;

    cy.on("tapdragover select", "edge", e => {
      e.target.style({
        width: 4,
        "line-color": "#007bff",
        "target-arrow-color": "#007bff"
      });
    });

    cy.on("tapdragout unselect", "edge", e => {
      const edge = e.target;

      if (!edge.selected()) {
        edge.style({
          width: 2,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc"
        });
      }
    });

    cy.on("tapdragover select", "node.data", e => {
      const node = e.target;
      const style = node.scratch("style") || {};

      if (!style["background-color"]) {
        style["background-color"] = node.style("background-color");
        node.scratch("style", style);
      }

      node.style({
        "background-color": "#007bff"
      });
    });

    cy.on("tapdragout unselect", "node.data", e => {
      const node = e.target;

      if (!node.selected()) {
        node.style({
          "background-color": node.scratch("style")["background-color"]
        });

        const style = node.scratch("style") || {};
        style["background-color"] = false;

        node.scratch("style", style);
      }
    });
  }

  render() {
    const options = {
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
      transform: function(node, position) {
        return position;
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    return (
      <div>
        <Row className="my-1">
          <Col>
            <Button color="danger">
              <RotateCcw size={16} /> Reset
            </Button>
            &nbsp;
            <Button color="primary">
              <Repeat size={16} /> Redraw
            </Button>
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
                  elements={this.state.elements}
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
