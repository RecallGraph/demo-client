import Cytoscape from "cytoscape";
import Cxtmenu from "cytoscape-cxtmenu";
import Edgehandles from "cytoscape-edgehandles";
import Popper from "cytoscape-popper";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { show } from "../../lib/adb-client";
import "./Canvas.css";
import style from "./style";

Cytoscape.use(Popper);
Cytoscape.use(Cxtmenu);
Cytoscape.use(Edgehandles);

class Canvas extends React.Component {
  constructor(props = {}) {
    super(props);

    this.datacy = Cytoscape({
      headless: true
    });

    this.state = {
      elements: []
    };
  }

  async componentDidMount() {
    let data = (await show(
      this.props.path || "/g/evstore_test_ss_lineage",
      null,
      { groupBy: "type" }
    )).body;
    data = this.cg2cy(data);
    data = this.annotate(data);

    this.setData(data);

    const elements = this.filter(this.props.filters || ["stars", "planets"]);

    this.setState({
      elements
    });
  }

  setData(data) {
    const cy = this.datacy;

    cy.elements().remove();
    cy.add(data);
    cy.$("node [[degree = 0]]").remove();
  }

  render() {
    const layout = {
      name: "breadthfirst",

      fit: true, // whether to fit the viewport to the graph
      directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
      padding: 30, // padding on fit
      circle: true, // put depths in concentric circles if true, put depths top down if false
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
      <div className="border border-secondary rounded w-100" id="cy-container">
        <div className="m-1" id="cy">
          <CytoscapeComponent
            cy={cy => {
              this.cy = cy;
            }}
            style={{ width: "100%", height: "100%" }}
            stylesheet={style}
            layout={layout}
            elements={this.state.elements}
          />
        </div>
      </div>
    );
  }

  cg2cy(data) {
    const typeMap = {
      vertex: "nodes",
      edge: "edges"
    };
    const fieldMap = {
      _id: "id",
      _from: "source",
      _to: "target"
    };

    const result = {};

    for (let el of data) {
      const key = typeMap[el.type];
      result[key] = [];
      for (let node of el.nodes) {
        const item = {};
        for (let k in node) {
          // noinspection JSUnfilteredForInLoop
          item[fieldMap[k] || k] = node[k];
        }
        result[key].push({ data: item });
      }
    }

    return result;
  }

  annotate(data) {
    data.nodes.forEach(
      node =>
        (node.data["obj-class"] = node.data.id.match(
          /evstore_test_(.*)\/.*/
        )[1])
    );

    return data;
  }

  filter(objClasses = []) {
    const cy = this.datacy;

    cy.elements().restore();
    if (objClasses.length) {
      cy.nodes().forEach(node => {
        if (!objClasses.includes(node.data()["obj-class"])) {
          cy.remove(node);
        }
      });
    }

    return cy.elements().map(el => el.json());
  }
}

export default Canvas;
