import { FaMoon, FaSun } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);


  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  return (
    <nav className="navbar">
      <span className="logo">
        CS
      </span>

      <ul className="nav-links">
        <li>Home</li>
        <li>Projects</li>
        <li>About</li>
        <li>Contact</li>
        <li onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaMoon /> : <FaSun />}
        </li>
      </ul>
    </nav>
  );
}
