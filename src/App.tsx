import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import AuthModal from "./components/AuthModal/AuthModal";
import SubscriptionModal from "./components/SubscriptionModal/SubscriptionModal";
import Landing from "./pages/landing/Landing";

import "./App.css";
import RouteMeta from "./components/RouteMeta";
import type { InitialPage } from "./routing/initialPage";
import Footer from "./components/Footer/Footer";

const Studio = import.meta.env.DEV
  ? lazy(() => import("./pages/studio/Studio"))
  : null;
const ProjectIndex = lazy(() => import("./pages/projectIndex/ProjectIndex"));
const ProjectPage = lazy(() => import("./pages/projectPage/ProjectPage"));
const NotePage = lazy(() => import("./pages/notePage/NotePage"));
const NotesIndex = lazy(() => import("./pages/notes/NotesIndex"));
const NotFound = lazy(() => import("./pages/notFound/NotFound"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const Lab = lazy(() => import("./pages/lab/Lab"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Privacy = lazy(() => import("./pages/privacy/Privacy"));

function RouteLoading() {
  const { t } = useLanguage();
  return <div className="route-loading" role="status" aria-label={t.notes.loading} />;
}

export default function App({ initialPage }: { initialPage?: InitialPage }) {
  const FirstProjectIndex = initialPage?.key === "projects" ? initialPage.component : ProjectIndex;
  const FirstProjectPage = initialPage?.key === "project" ? initialPage.component : ProjectPage;
  const FirstNotesIndex = initialPage?.key === "notes" ? initialPage.component : NotesIndex;
  const FirstNotePage = initialPage?.key === "note" ? initialPage.component : NotePage;
  const FirstLab = initialPage?.key === "lab" ? initialPage.component : Lab;
  const FirstProfile = initialPage?.key === "profile" ? initialPage.component : Profile;
  const FirstPrivacy = initialPage?.key === "privacy" ? initialPage.component : Privacy;
  const FirstAdmin = initialPage?.key === "admin" ? initialPage.component : Admin;
  const FirstNotFound = initialPage?.key === "notfound" ? initialPage.component : NotFound;
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <div className="app-root">
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <RouteMeta />
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/projects" element={<FirstProjectIndex />} />
                  <Route path="/projects/:slug" element={<FirstProjectPage />} />
                  <Route path="/notes" element={<FirstNotesIndex />} />
                  <Route path="/notes/:slug" element={<FirstNotePage />} />
                  <Route path="/lab" element={<FirstLab />} />
                  <Route path="/profile" element={<FirstProfile />} />
                  <Route path="/privacy" element={<FirstPrivacy />} />
                  <Route path="/admin" element={<FirstAdmin />} />
                  {Studio && <Route path="/studio" element={<Studio />} />}
                  <Route path="*" element={<FirstNotFound />} />
                </Routes>
              </Suspense>
              <Footer />
            </BrowserRouter>
            <AuthModal />
            <SubscriptionModal />
          </div>
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
