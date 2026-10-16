import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { OfflineProvider } from './context/OfflineContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { GuidePage } from './pages/GuidePage';
import { CentersPage } from './pages/CentersPage';
import { ImpactPage } from './pages/ImpactPage';
import { RewardsPage } from './pages/RewardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <ToastProvider>
          <OfflineProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="scanner" element={<ScannerPage />} />
                    <Route path="guide" element={<GuidePage />} />
                    <Route path="centers" element={<CentersPage />} />
                    <Route path="impact" element={<ImpactPage />} />
                    <Route path="rewards" element={<RewardsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </OfflineProvider>
        </ToastProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
};

export default App;
