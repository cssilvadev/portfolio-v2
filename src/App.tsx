import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import AuthModal from "./components/AuthModal/AuthModal";
import SubscriptionModal from "./components/SubscriptionModal/SubscriptionModal";
import Landing from "./pages/landing/Landing";

import "./App.css";

const Studio = import.meta.env.DEV
  ? lazy(() => import("./pages/studio/Studio"))
  : null;
const ProjectIndex = lazy(() => import("./pages/projectIndex/ProjectIndex"));
const ProjectPage = lazy(() => import("./pages/projectPage/ProjectPage"));
const NotePage = lazy(() => import("./pages/notePage/NotePage"));
const NotesIndex = lazy(() => import("./pages/notes/NotesIndex"));
const NotFound = lazy(() => import("./pages/notFound/NotFound"));
const Admin = lazy(() => import("./pages/admin/Admin"));

function RouteLoading() {
  const { t } = useLanguage();
  return <div className="route-loading" role="status" aria-label={t.notes.loading} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <div className="app-root">
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/projects" element={<ProjectIndex />} />
                  <Route path="/projects/:slug" element={<ProjectPage />} />
                  <Route path="/notes" element={<NotesIndex />} />
                  <Route path="/notes/:slug" element={<NotePage />} />
                  <Route path="/admin" element={<Admin />} />
                  {Studio && <Route path="/studio" element={<Studio />} />}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <AuthModal />
            <SubscriptionModal />
          </div>
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
