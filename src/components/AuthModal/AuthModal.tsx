import React, { useState } from "react";
import { FaGithub, FaEnvelope, FaLock, FaUser, FaTimes, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (authMode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) setErrorMsg(error.message);
      } else {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          alert("Account created successfully! Check your email to confirm your account.");
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setErrorMsg(null);
    const { error } = await signInWithOAuth(provider);
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="auth-close-btn" onClick={closeAuthModal} aria-label="Close">
          <FaTimes />
        </button>

        {/* HEADER */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <FaShieldAlt />
          </div>
          <h2 id="auth-title">{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="auth-subtitle">
            {authMode === "login"
              ? "Access your engineering dashboard & notes"
              : "Join to save notes and unlock Pro features"}
          </p>
        </div>

        {/* TABS */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authMode === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("login");
              setErrorMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg(null);
            }}
          >
            Register
          </button>
        </div>

        {/* ERROR DISPLAY */}
        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        {/* OAUTH BUTTONS */}
        <div className="oauth-buttons">
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            className="oauth-btn github"
          >
            <FaGithub className="oauth-icon" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>or email</span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === "signup" && (
            <div className="input-group">
            <label htmlFor="auth-full-name">Full Name</label>
              <div className="input-field">
                <FaUser className="field-icon" />
                <input
                  id="auth-full-name"
                  type="text"
                  placeholder="Christian Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={authMode === "signup"}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-field">
              <FaEnvelope className="field-icon" />
              <input
                  id="auth-email"
                  type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-field">
              <FaLock className="field-icon" />
              <input
                  id="auth-password"
                  type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="auth-submit-btn">
            {submitting
              ? "Authenticating..."
              : authMode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
