import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VictimDashboard } from './pages/VictimDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { CaseInvestigationPage } from './pages/CaseInvestigationPage';
import { UserRole } from './types';

// Layout with Navbar and Sidebar for protected/dashboard routes
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

/*
 * Guards a route behind authentication and, optionally, a required role.
 *
 * - Not logged in -> redirect to /login
 * - Logged in but wrong role for this route -> redirect to their own dashboard
 */
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole: UserRole;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== requiredRole) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  return <>{children}</>;
};

/*
 * Case detail page is shared by both roles, so it only
 * requires the user to be logged in, regardless of role.
 */
const ProtectedRouteAnyRole: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Standalone Case Investigation Route */}
          <Route
            path="/case/:id"
            element={
              <ProtectedRouteAnyRole>
                <MainLayout>
                  <CaseInvestigationPage />
                </MainLayout>
              </ProtectedRouteAnyRole>
            }
          />

          {/* Victim Dashboard Routes */}
          <Route
            path="/victim/*"
            element={
              <ProtectedRoute requiredRole="victim">
                <MainLayout>
                  <VictimDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Officer Dashboard Routes */}
          <Route
            path="/officer/*"
            element={
              <ProtectedRoute requiredRole="officer">
                <MainLayout>
                  <OfficerDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}