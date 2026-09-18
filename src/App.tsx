import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import AuthModal from "./components/AuthModal/AuthModal";
import SubscriptionModal from "./components/SubscriptionModal/SubscriptionModal";
import Landing from "./pages/landing/Landing";
import ProjectPage from "./pages/projectPage/ProjectPage";
import NotePage from "./pages/notePage/NotePage";
import NotFound from "./pages/notFound/NotFound";
import Admin from "./pages/admin/Admin";

import "./App.css";

const Studio = import.meta.env.DEV
  ? lazy(() => import("./pages/studio/Studio"))
  : null;

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <div className="app-root">
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/projects/:slug" element={<ProjectPage />} />
                <Route path="/notes/:slug" element={<NotePage />} />
                <Route path="/admin" element={<Admin />} />
                {Studio && (
                  <Route
                    path="/studio"
                    element={
                      <Suspense fallback={null}>
                        <Studio />
                      </Suspense>
                    }
                  />
                )}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AuthModal />
            <SubscriptionModal />
          </div>
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
