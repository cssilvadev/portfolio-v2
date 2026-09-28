import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../context/AuthContext";
import { ContentProvider } from "../context/ContentContext";
import type { PublicSnapshot } from "../data/publicSnapshot";
import Landing from "../pages/landing/Landing";
import ProjectIndex from "../pages/projectIndex/ProjectIndex";
import ProjectPage from "../pages/projectPage/ProjectPage";
import NotesIndex from "../pages/notes/NotesIndex";
import NotePage from "../pages/notePage/NotePage";
import Lab from "../pages/lab/Lab";
import Profile from "../pages/profile/Profile";

/** Same public components and context data as the browser, without effects. */
export default function PublicDocument({ route, content }: { route: string; content: PublicSnapshot }) {
  return <LanguageProvider initialLanguage="en"><AuthProvider><ContentProvider initialContent={content}>
    <div className="app-root" data-prerender="true"><MemoryRouter basename={import.meta.env.BASE_URL} initialEntries={[`${import.meta.env.BASE_URL}${route}`]}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<ProjectIndex />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/notes" element={<NotesIndex />} />
        <Route path="/notes/:slug" element={<NotePage />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </MemoryRouter></div>
  </ContentProvider></AuthProvider></LanguageProvider>;
}
