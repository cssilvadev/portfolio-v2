import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Landing from "./pages/landing/Landing";
import ProjectPage from "./pages/projectPage/ProjectPage";
import NotePage from "./pages/notePage/NotePage";
import Studio from "./pages/studio/Studio";

import "./App.css";

export default function App() {
  return (
    <LanguageProvider>
      <div className="app-root">
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/notes/:slug" element={<NotePage />} />
            <Route path="/studio" element={<Studio />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}
