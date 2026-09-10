import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import BusinessSwitcher from '../business/BusinessSwitcher';
import AddBusinessModal from '../business/AddBusinessModal';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  FileText,
  FolderOpen,
  GitFork,
  AlertTriangle,
  Bot,
  HelpCircle,
  Award,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { approvals, applications, documents } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const actionRequiredDocsCount = documents.filter(d => d.status === 'Missing').length;

  const navSections = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Business",
      items: [
        { name: "Business Profile", path: "/business", icon: Building2 },
        { name: "Approvals", path: "/approvals", icon: CheckCircle2, badge: `${approvals.length}` },
        { name: "Applications", path: "/applications", icon: FileText, badge: `${applications.length} Tracked` },
        { name: "Documents", path: "/documents", icon: FolderOpen, badge: actionRequiredDocsCount > 0 ? `${actionRequiredDocsCount} Action` : null }
      ]
    },
    {
      title: "Intelligence",
      items: [
        { name: "Dependency Graph", path: "/dependencies", icon: GitFork },
        { name: "Risk & Delays", path: "/risk", icon: AlertTriangle },
        { name: "AI Recommendations", path: "/ai-recommendations", icon: Bot, isAi: true }
      ]
    },
    {
      title: "Support",
      items: [
        { name: "Grievances", path: "/grievances", icon: HelpCircle },
        { name: "Schemes & Incentives", path: "/incentives", icon: Award }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header Branding */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                <Zap className="h-5 w-5 fill-current text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-lg tracking-tight leading-tight">InnovX</h1>
                <p className="text-[11px] text-blue-400 font-medium">AI Compliance Copilot</p>
              </div>
            </div>
          </div>

          {/* Business Switcher inside Sidebar */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <BusinessSwitcher onOpenAddModal={() => setIsAddModalOpen(true)} variant="sidebar" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-thin scrollbar-thumb-slate-800">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => `
                          flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                          ${isActive 
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30' 
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${item.isAi ? 'text-indigo-400 group-hover:text-white' : ''}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`
                            text-[10px] px-2 py-0.5 rounded-full font-semibold
                            ${item.badge.includes('Action') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-semibold text-sm">
                  AA
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Arun A</p>
                <p className="text-[11px] text-slate-400 truncate">Business Owner</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => navigate('/business')}
                title="Business Settings"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                title="Logout Demo"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Add Business Modal Triggered from Sidebar Switcher */}
      <AddBusinessModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
};

export default Sidebar;
