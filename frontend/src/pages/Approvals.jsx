import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Building,
  Tag,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

const Approvals = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { approvals, activeBusiness, disclaimerNotice } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Filtered approvals for active business
  const filteredApprovals = approvals.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'Ready') return app.status === 'Ready to Apply';
    if (activeTab === 'Pending') return app.status === 'Under Review' || app.status === 'Not Started';
    if (activeTab === 'Action Required') return app.status === 'Action Required' || app.missingDocs?.length > 0;
    if (activeTab === 'Approved') return app.status === 'Approved';
    return true;
  });

  const readyCount = approvals.filter(a => a.status === 'Ready to Apply' || a.status === 'Approved').length;
  const pendingCount = approvals.filter(a => a.status === 'Under Review' || a.status === 'Not Started').length;
  const actionCount = approvals.filter(a => a.status === 'Action Required' || a.missingDocs?.length > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Disclaimer Banner (Section 9 Requirement) */}
      <div className="bg-slate-100/80 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex items-center space-x-2">
        <Info className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="leading-snug">{disclaimerNotice}</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            <Building className="h-3.5 w-3.5" />
            <span>Workspace: {activeBusiness?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI-Identified Approvals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Based on {activeBusiness?.name} ({activeBusiness?.industry} • {activeBusiness?.location}), InnovX identified {approvals.length} statutory requirements.
          </p>
        </div>

        {/* Top Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100">
            {approvals.length} Identified
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100">
            {readyCount} Ready / Approved
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{actionCount} High Risk / Blocked</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {['All', 'Ready', 'Pending', 'Action Required', 'Approved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approvals by name or authority..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Approvals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApprovals.map(app => (
          <div
            key={app.id}
            className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between hover:shadow-md ${
              app.status === 'Action Required' || app.missingDocs?.length > 0
                ? 'border-amber-300 ring-1 ring-amber-200/50'
                : 'border-slate-200'
            }`}
          >
            <div>
              {/* Category & Status Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[10px] rounded-md uppercase tracking-wider">
                  {app.category}
                </span>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  app.status === 'Ready to Apply' ? 'bg-indigo-100 text-indigo-800' :
                  app.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'Action Required' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {app.status}
                </span>
              </div>

              {/* Approval Name & Authority */}
              <h3 className="font-bold text-slate-900 text-base leading-snug">{app.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center space-x-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{app.authorityFull}</span>
              </p>

              <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                {app.description}
              </p>

              {/* Missing Doc Alert Warning if applicable */}
              {app.missingDocs?.length > 0 && (
                <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Missing: {app.missingDocs.join(', ')}</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">Upload document to clear submission block.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Est. {app.estimatedTime}</span>
              <button
                onClick={() => navigate(`/approvals/${app.id}`)}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Approvals;
