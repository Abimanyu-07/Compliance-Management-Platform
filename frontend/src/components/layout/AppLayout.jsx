import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      {/* Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Workspace Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-4 px-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>
            <span className="font-semibold text-slate-700">InnovX</span> — AI-Powered Business Approval & Compliance Management Platform
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Enterprise Compliance SaaS</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
