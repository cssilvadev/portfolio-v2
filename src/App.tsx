import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal/AuthModal";
import SubscriptionModal from "./components/SubscriptionModal/SubscriptionModal";
import Landing from "./pages/landing/Landing";
import ProjectPage from "./pages/projectPage/ProjectPage";
import NotePage from "./pages/notePage/NotePage";
import Studio from "./pages/studio/Studio";
import NotFound from "./pages/notFound/NotFound";

import "./App.css";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app-root">
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/projects/:slug" element={<ProjectPage />} />
              <Route path="/notes/:slug" element={<NotePage />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <AuthModal />
          <SubscriptionModal />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
