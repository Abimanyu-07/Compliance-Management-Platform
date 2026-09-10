import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessProfile from './pages/BusinessProfile';
import Approvals from './pages/Approvals';
import ApprovalDetails from './pages/ApprovalDetails';
import Documents from './pages/Documents';
import Applications from './pages/Applications';
import Dependencies from './pages/Dependencies';
import RiskIntelligence from './pages/RiskIntelligence';
import AIRecommendations from './pages/AIRecommendations';
import Grievances from './pages/Grievances';
import Incentives from './pages/Incentives';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Login / Auth */}
          <Route path="/login" element={<Login />} />

          {/* Main Application with AppLayout sidebar & header */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/business" element={<BusinessProfile />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/approvals/:id" element={<ApprovalDetails />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/dependencies" element={<Dependencies />} />
            <Route path="/risk" element={<RiskIntelligence />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/grievances" element={<Grievances />} />
            <Route path="/incentives" element={<Incentives />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
