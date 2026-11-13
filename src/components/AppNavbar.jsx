import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import MusicControl from './MusicControl.jsx'

// NavLink (from react-router) adds an "active" class and aria-current to
// the link of the current page. Passing it as="..." lets React-Bootstrap's
// Nav.Link keep its styling while react-router handles the navigation.
export default function AppNavbar() {
  return (
    <Navbar expand="lg" className="arcade-nav" variant="dark" collapseOnSelect>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="arcade-title">
          🥊 SNACK FIGHTER
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={NavLink} to="/select">Fight</Nav.Link>
            <Nav.Link as={NavLink} to="/snackverse" className="nav-portal">🌀 Snackverse</Nav.Link>
            <Nav.Link as={NavLink} to="/tournament">Tournament</Nav.Link>
            <Nav.Link as={NavLink} to="/daily">Daily</Nav.Link>
            <Nav.Link as={NavLink} to="/hall-of-fame">Hall of Fame</Nav.Link>
            <MusicControl />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
