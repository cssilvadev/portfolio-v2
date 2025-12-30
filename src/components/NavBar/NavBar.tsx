import { FaMoon, FaSun } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Navbar.css';


export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      <span className="logo">CS</span>

      <ul className="nav-links">
        <li>Home</li>
        <li>Projects</li>
        <li>About</li>
        <li>Contact</li>
        <li onClick={() => setDarkMode(!darkMode)} style={{cursor:'pointer'}}>
          {darkMode ? <FaMoon /> : <FaSun />}
        </li>
      </ul>
    </nav>
  )
}

