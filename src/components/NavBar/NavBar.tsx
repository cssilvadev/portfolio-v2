import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="logo">CS</span>

      <ul className="nav-links">
        <li>Home</li>
        <li>Projects</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </nav>
  )
}
