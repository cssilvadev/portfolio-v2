import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import "./Navbar.css";

type Theme = "dark" | "light";

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav className="navbar">
      <span className="logo">CS</span>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/#projects">Projects</Link>
        </li>
        <li>
          <Link to="/#about">About</Link>
        </li>
        <li>
          <Link to="/#contact">Contact</Link>
        </li>

        <li
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ cursor: "pointer" }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FaMoon /> : <FaSun />}
        </li>
      </ul>
    </nav>
  );
}
