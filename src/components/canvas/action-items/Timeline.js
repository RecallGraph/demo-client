import PopperCore from "popper.js";
import React from "react";
import ReactDOM from "react-dom";
import { Clock, Repeat } from "react-feather";
import { Badge, Button, Card, CardBody, CardText, CardTitle } from "reactstrap";
import vis from "vis-timeline";
import "vis-timeline/dist/vis-timeline-graph2d.min.css";
import { log } from "../../../lib/api-client";
import { setPopper } from "../../../lib/utils";
import CloseButton from "../elements/CloseButton";
import "./Timeline.css";

class Timeline extends React.Component {
  componentDidMount() {
    const { items, groups, options } = this.props;

    setTimeout(() => {
      const container = document.getElementById("timeline-inner");
      window.timeline = new vis.Timeline(container, items, groups, options);
    }, 0);
  }

  render() {
    return <div id="timeline-inner" />;
  }
}

async function handler(sessionID) {
  const { groups, items } = await log(sessionID);
  for (const i of items) {
    i.content = i.className.toProperCase();
    i.title = new Date(i.start);
  }

  const options = {
    width: "95vw",
    type: "box",
    zoomKey: "ctrlKey",
    orientation: {
      axis: "both"
    },
    stack: false,
    groupHeightMode: "fitItems",
    stackSubgroups: false
  };

  const timeline = document.createElement("div");
  ReactDOM.render(
    <Card className="border-dark">
      <CardBody>
        <CardTitle
          tag="h5"
          className="mw-100 mb-4"
          style={{ minWidth: "50vw" }}
        >
          Timeline <small className="text-muted">(History of Changes)</small>
          <Badge color="secondary" className="ml-1">
            (CTRL + Scroll to zoom)
          </Badge>
          <CloseButton divKey="popper-timeline" popperKey="timeline" />
          <Button
            className="float-right"
            color="primary"
            onClick={() => window.timeline.fit()}
          >
            <Repeat size={16} /> Refit
          </Button>
        </CardTitle>
        <CardText tag="div" className="mw-100">
          <Timeline items={items} groups={groups} options={options} />
        </CardText>
      </CardBody>
    </Card>,
    timeline
  );

  document.getElementsByTagName("body")[0].appendChild(timeline);
  timeline.setAttribute("id", "popper-timeline");
  setPopper(
    "timeline",
    new PopperCore(document.getElementById("timeline"), timeline)
  );
}

export default ({ sessionID }) => (
  <Button
    className="ml-1"
    color="info"
    id="timeline"
    onClick={() => handler(sessionID)}
  >
    <Clock size={16} /> Timeline
  </Button>
);
