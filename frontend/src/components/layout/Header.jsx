import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import BusinessSwitcher from '../business/BusinessSwitcher';
import AddBusinessModal from '../business/AddBusinessModal';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

const Header = ({ setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, markNotificationRead, clearAllNotifications, activeBusiness } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getPageTitle = (path) => {
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/business')) return 'Business Profile';
    if (path.includes('/approvals/')) return 'Approval Requirement Details';
    if (path.includes('/approvals')) return 'AI-Identified Approvals';
    if (path.includes('/applications')) return 'Application Tracker';
    if (path.includes('/documents')) return 'Document Intelligence & Scrutiny';
    if (path.includes('/dependencies')) return 'Compliance Dependency Graph';
    if (path.includes('/risk')) return 'Risk & Delay Intelligence';
    if (path.includes('/ai-recommendations')) return 'AI Compliance Copilot';
    if (path.includes('/grievances')) return 'Grievance Management';
    if (path.includes('/incentives')) return 'Schemes & Incentives';
    return 'InnovX Platform';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/approvals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title */}
          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {getPageTitle(location.pathname)}
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {activeBusiness?.industry} • {activeBusiness?.location}
            </p>
          </div>
        </div>

        {/* Center/Right Business Switcher & Actions */}
        <div className="flex items-center space-x-3">
          {/* Business Switcher Dropdown */}
          <BusinessSwitcher onOpenAddModal={() => setIsAddModalOpen(true)} variant="header" />

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search approvals, documents..."
              className="w-56 pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </form>

          {/* Help icon -> AI Recommendations */}
          <button
            onClick={() => navigate('/ai-recommendations')}
            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition relative"
            title="AI Assistant Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Notifications Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifs(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 transition cursor-pointer hover:bg-slate-50 flex items-start space-x-3 ${n.unread ? 'bg-blue-50/40' : ''}`}
                    >
                      {n.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
                      
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button 
                    onClick={() => { setShowNotifs(false); navigate('/applications'); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>View all tracker activities</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Pill */}
          <div 
            onClick={() => navigate('/business')}
            className="flex items-center space-x-2.5 p-1 hover:bg-slate-100 rounded-xl cursor-pointer transition"
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
              AA
            </div>
          </div>
        </div>
      </header>

      {/* Add New Business Multi-Step Modal */}
      <AddBusinessModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
};

export default Header;
