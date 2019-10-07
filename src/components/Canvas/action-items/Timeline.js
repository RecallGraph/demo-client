import difflib from "jsdifflib";
import "jsdifflib/index.css";
import PopperCore from "popper.js";
import React from "react";
import ReactDOM from "react-dom";
import { Clock, Repeat } from "react-feather";
import { Badge, Button, Card, CardBody, CardText, CardTitle } from "reactstrap";
import vis from "vis-timeline";
import "vis-timeline/dist/vis-timeline-graph2d.min.css";
import CloseButton from "../../../components/CloseButton";
import EventDetail from "../../../components/EventDetail";
import { log, show, versions } from "../../../lib/api-client";
import { getObjClass, setPopper } from "../../../lib/utils";
import "./Timeline.css";

class Timeline extends React.Component {
  componentDidMount() {
    const { items, groups, options, sessionID } = this.props;

    setTimeout(() => {
      const container = document.getElementById("timeline-inner");
      const timeline = (window.timeline = new vis.Timeline(
        container,
        items,
        groups,
        options
      ));

      timeline.on("select", async function({ items: itemIDs, event }) {
        if (itemIDs.length) {
          const itemID = itemIDs[0];
          const item = items.find(item => item.id === itemID);
          const details = document.createElement("div");
          let objClass, data, objClassPlural;

          switch (item.className) {
            case "deleted":
              objClassPlural = groups.find(
                group =>
                  Array.isArray(group.nestedGroups) &&
                  group.nestedGroups.includes(item.group)
              ).content;
              objClass = objClassPlural.substr(0, objClassPlural.length - 1);

              ReactDOM.render(
                <EventDetail event={item} objClass={objClass}>
                  Deleted.
                </EventDetail>,
                details
              );

              break;

            case "created":
              data = (await show(
                sessionID,
                [item.subgroup],
                item.start / 1000 + 0.0001
              )).nodes[0].data;
              delete data._rawId;
              delete data.id;
              delete data.Body;

              objClass = getObjClass(data);
              delete data["obj-class"];

              ReactDOM.render(
                <EventDetail event={item} objClass={objClass}>
                  <pre>
                    <code>{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </EventDetail>,
                details
              );

              break;

            case "updated":
              const itemIdx = items.lastIndexOf(item);
              const prevItem = items[itemIdx - 1];
              const ctimes = [prevItem, item].map(i => i.start / 1000 + 0.0001);

              objClassPlural = groups.find(
                group =>
                  Array.isArray(group.nestedGroups) &&
                  group.nestedGroups.includes(item.group)
              ).content;
              objClass = objClassPlural.substr(0, objClassPlural.length - 1);

              data = (await versions(sessionID, item.subgroup, ctimes)).map(
                node => {
                  delete node._rawId;
                  delete node.id;
                  delete node.Body;
                  delete node["obj-class"];

                  return JSON.stringify(node, null, 2);
                }
              );

              ReactDOM.render(
                <EventDetail event={item} objClass={objClass}>
                  <div id="diff" />
                </EventDetail>,
                details
              );

              setTimeout(
                () =>
                  document.getElementById("diff").appendChild(
                    difflib.buildView({
                      baseText: data[0],
                      newText: data[1],
                      baseTextName: "Previous Event",
                      newTextName: "This Event",
                      inline: false
                    })
                  ),
                0
              );

              break;

            default:
              console.log("WTF!");
              break;
          }

          document.getElementsByTagName("body")[0].appendChild(details);
          details.setAttribute("id", `popper-details-${item.subgroup}`);
          setPopper(
            `details-${item.subgroup}`,
            new PopperCore(event.target, details)
          );
        }
      });
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
    i.title = new Date(i.start).toISOString();
  }

  console.log({ groups, items });

  const options = {
    width: "95vw",
    type: "box",
    zoomKey: "ctrlKey",
    orientation: {
      axis: "top",
      item: "top"
    },
    maxHeight: "70vh",
    horizontalScroll: false,
    verticalScroll: true
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
          <Timeline
            items={items}
            groups={groups}
            options={options}
            sessionID={sessionID}
          />
        </CardText>
      </CardBody>
    </Card>,
    timeline
  );

  document.getElementsByTagName("body")[0].appendChild(timeline);
  timeline.setAttribute("id", "popper-timeline");
  setPopper(
    "timeline",
    new PopperCore(document.getElementById("timeline"), timeline, {
      modifiers: {
        flip: {
          enabled: false
        }
      },
      onCreate(data) {
        data.instance.reference.setAttribute("disabled", true);
      }
    })
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
