import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { PageTransition } from './components/PageTransition';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import VoiceFAB from './components/VoiceFAB';
import LanguageSelectPage from './pages/LanguageSelectPage';
import AuthPage from './pages/AuthPage';
import FarmerDashboard from './pages/FarmerDashboard';
import Marketplace from './pages/Marketplace';
import ColdStorage from './pages/ColdStorage';
import Transport from './pages/Transport';
import LabTesting from './pages/LabTesting';
import WholesalerDashboard from './pages/WholesalerDashboard';
import AiInsights from './pages/AiInsights';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import PriceTracker from './pages/PriceTracker';

function AppInner() {
  const { isOffline, user } = useApp();
  const location = useLocation();
  const isLoggedIn = !!user;

  // Pages that don't show the app shell (no navbar/bottom nav)
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';
  const showShell = !isPublicPage && isLoggedIn;

  return (
    <div className="app-container">
      {isOffline && (
        <div className="offline-banner">
          📵 No internet connection — सीमित सुविधाएं उपलब्ध हैं
        </div>
      )}

      {showShell && <Navbar />}

      <main className={showShell ? 'page-content' : ''}>
        <PageTransition keyProp={location.pathname}>
          <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LanguageSelectPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* ── Protected Routes ── */}
          <Route path="/dashboard"   element={isLoggedIn ? <FarmerDashboard />       : <Navigate to="/login" replace />} />
          <Route path="/price-tracker" element={isLoggedIn ? <PriceTracker />          : <Navigate to="/login" replace />} />
          <Route path="/marketplace" element={isLoggedIn ? <Marketplace />            : <Navigate to="/login" replace />} />
          <Route path="/cold-storage"element={isLoggedIn ? <ColdStorage />            : <Navigate to="/login" replace />} />
          <Route path="/transport"   element={isLoggedIn ? <Transport />              : <Navigate to="/login" replace />} />
          <Route path="/lab-testing" element={isLoggedIn ? <LabTesting />             : <Navigate to="/login" replace />} />
          <Route path="/wholesaler"  element={isLoggedIn ? <WholesalerDashboard />    : <Navigate to="/login" replace />} />
          <Route path="/ai-insights" element={isLoggedIn ? <AiInsights />             : <Navigate to="/login" replace />} />
          <Route path="/profile"     element={isLoggedIn ? <ProfilePage />            : <Navigate to="/login" replace />} />
          <Route path="/help"        element={isLoggedIn ? <HelpPage />               : <Navigate to="/login" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/'} replace />} />
          </Routes>
        </PageTransition>
      </main>

      {showShell && <BottomNav />}
      {showShell && <VoiceFAB />}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1B5E20', color: 'white', borderRadius: '14px',
            fontFamily: 'Noto Sans, sans-serif', fontWeight: 600,
            padding: '14px 20px', boxShadow: '0 8px 32px rgba(27,94,32,0.3)',
          },
          error:   { style: { background: '#C62828', color: 'white', borderRadius: '14px' } },
          success: { iconTheme: { primary: '#FFD54F', secondary: '#1B5E20' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppInner />
      </Router>
    </AppProvider>
  );
}
