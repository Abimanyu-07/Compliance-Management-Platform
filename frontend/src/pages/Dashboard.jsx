import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Building,
  MapPin,
  Info,
  Layers,
  UploadCloud,
  Check,
  ShieldAlert
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    activeBusiness,
    approvals,
    applications,
    documents,
    handleUploadDocument,
    aiRecommendation,
    riskMetrics,
    whatIfExpanded,
    setWhatIfExpanded,
    disclaimerNotice
  } = useApp();

  const [showWhyItMatters, setShowWhyItMatters] = useState(false);

  // Computed metrics for active business
  const totalCount = approvals.length;
  const approvedCount = approvals.filter(a => a.status === 'Approved').length;
  const inProgressCount = approvals.filter(a => a.status === 'Under Review').length;
  const readyCount = approvals.filter(a => a.status === 'Ready to Apply').length;
  const actionRequiredCount = approvals.filter(a => a.status === 'Action Required' || a.missingDocs?.length > 0).length;

  const chartData = [
    { name: 'Completed', value: approvedCount, color: '#10b981' },
    { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
    { name: 'Ready to Apply', value: readyCount, color: '#6366f1' },
    { name: 'Action Required', value: actionRequiredCount, color: '#f59e0b' }
  ];

  const overallProgress = totalCount > 0 
    ? Math.round(((approvedCount * 1.0 + readyCount * 0.7 + inProgressCount * 0.5) / totalCount) * 100)
    : 100;

  const missingDocItem = documents.find(d => d.status === 'Missing');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Disclaimer Banner (Section 9 Requirement) */}
      <div className="bg-slate-100/80 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex items-center space-x-2">
        <Info className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="leading-snug">{disclaimerNotice}</span>
      </div>

      {/* 1. Header & Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Compliance Assistant Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Good afternoon, Arun</h1>
            <p className="text-slate-300 text-sm mt-1">
              Here's your current business compliance overview for <strong className="text-white">{activeBusiness?.name}</strong>.
            </p>
          </div>

          {/* Business Selector Info Pill */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl flex items-center space-x-3 text-xs">
            <div className="p-2.5 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{activeBusiness?.name}</p>
              <div className="flex items-center space-x-2 text-slate-400 mt-0.5">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span>{activeBusiness?.location}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{activeBusiness?.industry}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Approvals */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Approvals</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">identified requirements</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center font-medium">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Matched to {activeBusiness?.industry} sector</span>
          </div>
        </div>

        {/* Ready to Apply */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready to Apply</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{readyCount + approvedCount}</span>
            <span className="text-xs text-slate-500 font-medium">documentation ready</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-medium">
            Ready for instant portal submission
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Actions</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{actionRequiredCount + inProgressCount}</span>
            <span className="text-xs text-amber-600 font-bold">{actionRequiredCount} high priority</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Requires document upload or scrutiny fix
          </div>
        </div>

        {/* Compliance Health Score (Section 16 Requirement) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">InnovX Compliance Health</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {100 - (riskMetrics?.overallScore || 10)}%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              {riskMetrics?.status || 'Good Standing'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Calculated score based on permit readiness
          </div>
        </div>
      </div>

      {/* 3. AI NEXT-BEST-ACTION CARD (Dynamic per Business) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 lg:p-7 text-white shadow-xl border border-blue-500/30 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-white shrink-0 text-2xl">
              🧠
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Next Best Action</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                  aiRecommendation.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  Priority: {aiRecommendation.priority || 'Normal'}
                </span>
              </div>

              <p className="text-base font-semibold text-blue-200">
                {aiRecommendation.title}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {aiRecommendation.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {missingDocItem && (
              <button
                onClick={() => handleUploadDocument(missingDocItem.name, missingDocItem.relatedApproval)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload {missingDocItem.name}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/approvals')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
            >
              <span>View Application</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowWhyItMatters(!showWhyItMatters)}
              className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Why this matters
            </button>
          </div>
        </div>

        {/* Why this matters collapsible detail box */}
        {showWhyItMatters && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 bg-slate-950/60 p-4 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <Info className="h-4 w-4" />
              <span>AI Dependency Analysis Rationale</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In {activeBusiness?.location} regulations for <strong>{activeBusiness?.industry}</strong>, prerequisite clearances determine permit processing order. Completing primary documentation prevents cascading delay holds across downstream departments.
            </p>
          </div>
        )}
      </div>

      {/* 4. Middle Section: Approval Progress Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Progress Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Approval Progress</h3>
                <p className="text-xs text-slate-500">Readiness across {totalCount} statutory permits</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                {overallProgress}% Overall Completion
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900">{approvedCount}/{totalCount}</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Approved</p>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-700">Completed / Approved</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{approvedCount}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-semibold text-slate-700">In Progress / Review</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{inProgressCount}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                    <span className="text-xs font-semibold text-slate-700">Ready to Apply</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{readyCount}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-semibold text-slate-700">Action Required</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{actionRequiredCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need detailed checklist by authority?</span>
            <button 
              onClick={() => navigate('/approvals')} 
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>View All {totalCount} Approvals</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Deadlines Card (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines</h3>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {approvals.slice(0, 3).map((app, idx) => (
                <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{app.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{app.authority} • Est {app.estimatedTime}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    app.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {app.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
            >
              <span>Open Application Tracker</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. RECENT APPLICATION ACTIVITY TABLE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Application Activity</h3>
            <p className="text-xs text-slate-500">Live filing status for {activeBusiness?.name}</p>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
          >
            <span>View Full Tracker</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4">Authority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {applications.slice(0, 4).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{app.approvalName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{app.authority}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center space-x-1 ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      app.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      app.status === 'Action Required' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <span>{app.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{app.lastUpdated || 'Recently'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate('/applications')}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-[11px] font-semibold transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. WHAT-IF COMPLIANCE SIMULATOR WIDGET */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 rounded-2xl p-6 border border-indigo-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-900 text-sm">What-If Compliance Simulator</h4>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full">
                  AI Scenario Engine
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Simulate business scaling or geographic expansion for {activeBusiness?.name}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setWhatIfExpanded(!whatIfExpanded)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer"
          >
            {whatIfExpanded ? 'Hide Simulation' : 'What if I expand my factory?'}
          </button>
        </div>

        {whatIfExpanded && (
          <div className="mt-5 pt-4 border-t border-indigo-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Current Approvals</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount} Permits</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeBusiness?.industry}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Potential Additional Requirements</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">+3 Permits</p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Boiler NOC • ETP Upgrade • EIA Clearance</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Estimated Compliance Workload</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">Medium Impact</p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">+₹35,000 estimated statutory fees</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
