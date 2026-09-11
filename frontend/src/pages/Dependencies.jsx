import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  GitFork,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  UploadCloud,
  Check
} from 'lucide-react';

const Dependencies = () => {
  const navigate = useNavigate();
  const { dependencyNodes, documents, handleUploadDocument } = useApp();
  const [selectedNode, setSelectedNode] = useState(null);

  const isProjectReportUploaded = documents.find(d => d.id === 'doc-4')?.status === 'Verified';

  const flowSteps = [
    {
      id: 1,
      title: "Business Registration",
      authority: "MCA / Registrar of Companies",
      status: "Approved",
      statusColor: "emerald",
      desc: "Mandatory corporate entity formation certificate."
    },
    {
      id: 2,
      title: "GST & Land Lease Verification",
      authority: "GST Dept / Revenue Office",
      status: "Approved",
      statusColor: "emerald",
      desc: "Tax identity and premises site occupancy clearance."
    },
    {
      id: 3,
      title: "Pollution Consent (CTO)",
      authority: "Tamil Nadu Pollution Control Board (TNPCB)",
      status: isProjectReportUploaded ? "Under Review" : "Action Required",
      statusColor: isProjectReportUploaded ? "blue" : "amber",
      isBottleneck: !isProjectReportUploaded,
      desc: "Consent to Operate under Water & Air Pollution Prevention Acts.",
      blockMsg: !isProjectReportUploaded ? "Missing Project Report PDF is blocking scrutiny officer signoff." : null
    },
    {
      id: 4,
      title: "Factory Licence",
      authority: "Directorate of Industrial Safety & Health (DISH)",
      status: isProjectReportUploaded ? "Ready to Submit" : "Blocked by CTO",
      statusColor: isProjectReportUploaded ? "indigo" : "slate",
      desc: "Industrial safety & machinery layout plan approval under Factories Act.",
      prereq: "Requires active TNPCB CTO Clearance."
    },
    {
      id: 5,
      title: "Fire Safety NOC",
      authority: "Tamil Nadu Fire & Rescue Services",
      status: "Not Started",
      statusColor: "slate",
      desc: "No Objection Certificate for emergency exit & fire suppression systems."
    },
    {
      id: 6,
      title: "Final Operational Clearance",
      authority: "Single Window Portal (Govt of TN)",
      status: "Pending Workflow",
      statusColor: "slate",
      desc: "Final authorization to commence commercial production."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
            <GitFork className="h-3.5 w-3.5" />
            <span>Multi-Department Prerequisite Graph</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Dependency Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Understand how approvals depend on each other and identify workflow bottlenecks.
          </p>
        </div>

        <button
          onClick={() => navigate('/ai-recommendations')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Warning Callout Box (Section 22 Requirement) */}
      {!isProjectReportUploaded ? (
        <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/30 text-amber-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Bottleneck Alert</h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                ⚠ <strong>Pollution Consent (CTO)</strong> is currently delaying the <strong>Factory Licence</strong> workflow.
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Root cause: Project Report document missing from TNPCB online submission portal.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleUploadDocument('Project_Report.pdf', 'Pollution Consent')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Simulate Upload & Resolve</span>
            </button>
            <button
              onClick={() => navigate('/ai-recommendations')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              View Recommended Action →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/30 text-emerald-900 shadow-xs flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Bottleneck Resolved</h3>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              Project Report verified! Pollution Consent is progressing smoothly towards DISH Factory Licence unblocking.
            </p>
          </div>
        </div>
      )}

      {/* Visual Dependency Flow Graph (Section 22 Nodes Connected by Arrow Flow) */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Approval Sequential Prerequisites Flow
        </h3>

        <div className="space-y-4">
          {flowSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Node Card */}
              <div
                onClick={() => setSelectedNode(step)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  step.isBottleneck
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    step.statusColor === 'emerald' ? 'bg-emerald-500 text-white shadow-xs' :
                    step.statusColor === 'amber' ? 'bg-amber-500 text-white shadow-xs animate-bounce' :
                    step.statusColor === 'blue' ? 'bg-blue-600 text-white' :
                    step.statusColor === 'indigo' ? 'bg-indigo-600 text-white' :
                    'bg-slate-300 text-slate-600'
                  }`}>
                    {step.id}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-base">{step.title}</h4>
                      {step.isBottleneck && (
                        <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                          Bottleneck
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{step.authority}</p>
                    <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
                    {step.blockMsg && (
                      <p className="text-xs font-bold text-amber-700 mt-1.5">
                        ⚠ {step.blockMsg}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    step.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                    step.statusColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                    step.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                    step.statusColor === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {idx < flowSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="h-6 w-0.5 bg-slate-300 relative flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-xs absolute">↓</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dependencies;
