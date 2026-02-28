import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { OfflineProvider } from './contexts/OfflineContext';

// Pages
import PlotsPage from './pages/PlotsPage';
import PlotDetailPage from './pages/PlotDetailPage';
import { TreeDetailPage, AddGrowthLogPage } from './pages/TreeDetailPage';
import { SurveyPage, SurveyPlotPage } from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/plots" element={<PlotsPage />} />
    <Route path="/plots/:plotCode" element={<PlotDetailPage />} />
    <Route path="/trees/:treeCode" element={<TreeDetailPage />} />
    <Route path="/trees/:treeCode/add-log" element={<AddGrowthLogPage />} />
    <Route path="/survey" element={<SurveyPage />} />
    <Route path="/survey/:plotCode" element={<SurveyPlotPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/profile" element={<ProfilePage />} />

    {/* Default redirect */}
    <Route path="/" element={<Navigate to="/plots" replace />} />
    <Route path="*" element={<Navigate to="/plots" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <DatabaseProvider>
      <OfflineProvider>
        <AppRoutes />
      </OfflineProvider>
    </DatabaseProvider>
  </BrowserRouter>
);

export default App;
