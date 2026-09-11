import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  X,
  FileText,
  ChevronRight,
  ExternalLink,
  Info,
  Check
} from 'lucide-react';

const Applications = () => {
  const { applications, selectedAppId, setSelectedAppId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const selectedApp = applications.find(a => String(a.id) === String(selectedAppId) || String(a.raw_id) === String(selectedAppId)) || null;

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.approvalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approvals, pending actions and important statutory deadlines in one place.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or approval..."
              className="w-full sm:w-56 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Action Required">Action Required</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Application</th>
                <th className="py-3.5 px-4">Authority</th>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-bold text-slate-900">{app.approvalName}</td>
                  <td className="py-4 px-4 text-slate-600">{app.authority}</td>
                  <td className="py-4 px-4 font-mono text-slate-500">{app.id}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center space-x-1 ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      app.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      app.status === 'Action Required' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <span>{app.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{app.deadline}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedAppId(app.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        app.status === 'Action Required'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white'
                      }`}
                    >
                      {app.status === 'Action Required' ? 'Fix Issue' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICATION DETAIL SIDE PANEL (Slide-Over Panel - Section 21) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 lg:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200">
            <div className="space-y-6">
              {/* Slide panel header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Application Audit Trail</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedApp.approvalName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedApp.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAppId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                selectedApp.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                selectedApp.status === 'Under Review' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                selectedApp.status === 'Action Required' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div>
                  <span className="font-semibold text-slate-500">Current Status:</span>
                  <p className="text-sm font-extrabold uppercase mt-0.5">{selectedApp.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Last Updated</span>
                  <p className="font-medium mt-0.5">{selectedApp.lastUpdated}</p>
                </div>
              </div>

              {/* Authority & Action Info */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Issuing Authority</span>
                  <span className="font-bold text-slate-900">{selectedApp.authority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted Date</span>
                  <span className="font-medium text-slate-800">{selectedApp.submittedDate}</span>
                </div>
                {selectedApp.actionRequired && (
                  <div className="pt-2 border-t border-slate-200/60 text-slate-700">
                    <strong className="text-slate-900">Next Action:</strong> {selectedApp.actionRequired}
                  </div>
                )}
              </div>

              {/* Timeline (Section 21 Requirement) */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Application Lifecycle Timeline
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                  {selectedApp.timeline?.map((step, idx) => {
                    const isDone = step.status === 'completed';
                    const isCurrent = step.status === 'current';
                    return (
                      <div key={idx} className="relative text-xs space-y-0.5">
                        <span className={`absolute -left-8 top-0.5 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isDone ? 'bg-emerald-500 text-white ring-4 ring-white' :
                          isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse' :
                          'bg-slate-200 text-slate-500 ring-4 ring-white'
                        }`}>
                          {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                        </span>

                        <p className={`font-bold ${isCurrent ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.step}
                        </p>
                        <p className="text-[11px] text-slate-500">{step.date}</p>
                        {step.note && (
                          <p className="text-[11px] font-semibold text-amber-600 bg-amber-50 p-1.5 rounded-md mt-1 inline-block">
                            ⚠ {step.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setSelectedAppId(null)}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
