import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '../src/components/auth/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);