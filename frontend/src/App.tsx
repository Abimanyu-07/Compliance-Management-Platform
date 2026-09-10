import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login / Register */}
            <Route path="/login" element={<Login />} />

            {/* Protected Enterprise Routes */}
            <Route element={<ProtectedRoute />}>
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
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
