import React, { Component } from "react";
import { GitHub } from "react-feather";
import {
  Col,
  Collapse,
  Container,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  Row
} from "reactstrap";
import Canvas from "../Canvas";
import HelpModal from "../Help";

class App extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Container fluid>
        <Navbar
          color="inverse"
          light
          expand="md"
          className="border-bottom mb-2"
        >
          <NavbarBrand href="/" className="text-wrap">
            CivicGraph Demo - A DIY Solar System
            <span
              className="spinner-grow mx-2 text-danger invisible"
              role="status"
              id="loading"
            >
              <span className="sr-only">Loading...</span>
            </span>
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="#">
                  <HelpModal />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="https://github.com/adityamukho/CivicGraph"
                  target="_blank"
                >
                  <GitHub />
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <Container fluid>
          <Row>
            <Col>
              <Canvas />
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

export default App;
