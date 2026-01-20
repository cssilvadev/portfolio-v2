import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/Landing";
import ProjectPage from "./pages/projectPage/ProjectPage";

import "./App.css";

export default function App() {
  return (
    <div className="app-root">
<BrowserRouter basename={import.meta.env.BASE_URL}>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/projects/:slug" element={<ProjectPage />} />
  </Routes>
</BrowserRouter>
    </div>
  );
}
