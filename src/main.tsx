import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './styles/global.css'
import { loadInitialPage } from './routing/initialPage'

if (new URLSearchParams(window.location.search).get('performance') === '1') {
  void import('./utils/performance').then(module => module.startPerformanceDiagnostics());
}

void loadInitialPage().catch(() => undefined).then(initialPage => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App initialPage={initialPage} />
    </ErrorBoundary>
  </React.StrictMode>,
))
