import PopperCore from "popper.js";
import React from "react";
import ReactDOM from "react-dom";
import { Clock } from "react-feather";
import Timeline from "react-visjs-timeline";
import { Button, Card, CardBody, CardText, CardTitle } from "reactstrap";
import { setPopper } from "../../../lib/utils";
import CloseButton from "../elements/CloseButton";

export default () => (
  <Button
    className="ml-1"
    color="info"
    id="timeline"
    onClick={async () => handler()}
  >
    <Clock size={16} /> Timeline
  </Button>
);

function handler() {
  const items = [
    {
      start: new Date(2010, 7, 15),
      end: new Date(2010, 8, 2), // end is optional
      content: "Trajectory A"
    }
  ];
  const options = {
    width: "100%",
    height: "60px",
    stack: false,
    showMajorLabels: true,
    showCurrentTime: true,
    zoomMin: 1000000,
    type: "background",
    format: {
      minorLabels: {
        minute: "h:mma",
        hour: "ha"
      }
    }
  };

  const timeline = document.createElement("div");
  ReactDOM.render(
    <Card>
      <CardBody>
        <CardTitle
          tag="h5"
          className="mw-100 mb-4"
          style={{ minWidth: "50vw" }}
        >
          Timeline <small className="text-muted">(History of Changes)</small>
          <CloseButton divKey="popper-timeline" popperKey="timeline" />
        </CardTitle>
        <CardText tag="div" className="mw-100">
          <Timeline options={options} items={items} />
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
