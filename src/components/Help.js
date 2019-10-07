import React from "react";
import { Clock, HelpCircle, Repeat, RotateCcw, Search, X } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

class HelpModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  render() {
    return (
      <div>
        <HelpCircle onClick={this.toggle} />
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
          style={{ minWidth: "95vw" }}
        >
          <ModalHeader
            toggle={this.toggle}
            close={
              <a href="#" className="btn btn-outline-dark">
                <X onClick={this.toggle} />
              </a>
            }
          >
            CivicGraph Demo
          </ModalHeader>
          <ModalBody>
            <h4>About</h4>
            <p>
              CivicGraph is a <em>temporal graph data store</em> - it retains
              all changes that its data have gone through to reach their current
              state. Refer to the&nbsp;
              <a
                href="https://github.com/adityamukho/CivicGraph"
                target="_blank"
              >
                project home page
              </a>{" "}
              to find out more.
            </p>
            <p>
              This demo is meant to be a visual, interactive walkthrough of (a
              few of) CivicGraph's capabilities.
            </p>

            <h4>Instructions</h4>
            <ul>
              <li>
                Click on any of the nodes on the canvas to bring up a circular
                context menu.
              </li>
              <li>
                Use this menu to view, delete, edit or add children to the node.
              </li>
              <li className="my-1">
                Use the{" "}
                <span className="btn btn-danger">
                  <RotateCcw size={16} /> Redraw
                </span>{" "}
                button to reset all your changes and start with a fresh set of
                nodes.
                <p className="text-danger">
                  <strong>
                    This will cause you to lose all your changes and history
                    accrued so far!
                  </strong>
                </p>
              </li>
              <li className="my-1">
                Use the{" "}
                <span className="btn btn-primary">
                  <Repeat size={16} /> Redraw
                </span>{" "}
                button to automatically reset the canvas zoom, pan and node
                layout.
              </li>
              <li className="my-1">
                Use the{" "}
                <span className="btn btn-outline-info">
                  <Search size={16} /> Search
                </span>{" "}
                button to search for, and zoom into a node present on canvas.
              </li>
              <li className="my-1">
                Use the{" "}
                <span className="btn btn-info">
                  <Clock size={16} /> Timeline
                </span>{" "}
                button to see a timeline of all changes made to your node data
                from the beginning of the graph's first load (or last reset).
              </li>
            </ul>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default HelpModal;
