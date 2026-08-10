import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { VictimDashboard } from './pages/VictimDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CaseInvestigationPage } from './pages/CaseInvestigationPage';

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
        <main className="flex-1 min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent overflow-x-hidden pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />
    </div>
  );
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
          <Route path="/roles" element={<RoleSelectionPage />} />

          {/* Standalone Case Investigation Route */}
          <Route
            path="/case/:id"
            element={
              <MainLayout>
                <CaseInvestigationPage />
              </MainLayout>
            }
          />

          {/* Victim Dashboard Routes */}
          <Route
            path="/victim/*"
            element={
              <MainLayout>
                <VictimDashboard />
              </MainLayout>
            }
          />

          {/* Officer Dashboard Routes */}
          <Route
            path="/officer/*"
            element={
              <MainLayout>
                <OfficerDashboard />
              </MainLayout>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin/*"
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
