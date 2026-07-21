import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

// Inicializar Sentry si se proporciona VITE_SENTRY_DSN en las variables de entorno
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center"><h1 className="text-2xl font-bold text-red-400 mb-2">Ocurrió un error inesperado</h1><p className="text-white/60 text-sm max-w-md">Se ha notificado al equipo técnico sobre este inconveniente. Por favor recarga la página.</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-pink-600 rounded-xl text-sm font-bold text-white hover:bg-pink-500 transition">Recargar página</button></div>}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);

