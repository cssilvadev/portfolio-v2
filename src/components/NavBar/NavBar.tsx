import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <nav className="navbar">
      <span className="logo">CS</span>

      <ul className="nav-links">
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#projects">Projects</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#contact">Contact</a>
        </li>
        <li onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaMoon /> : <FaSun />}
        </li>
      </ul>
    </nav>
  );
}
