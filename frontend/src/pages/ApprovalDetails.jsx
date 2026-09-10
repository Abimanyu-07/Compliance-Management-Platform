import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Building,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  UploadCloud,
  FileText,
  Clock,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

const ApprovalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approvals, documents, handleUploadDocument } = useApp();

  // Find approval by ID or requirement ID or fallback
  const approval =
    approvals.find((a) => String(a.id) === String(id) || String(a.requirement_id) === String(id)) ||
    approvals[0] || {
      name: 'Approval Requirement',
      category: 'General',
      authorityFull: 'Government Regulatory Authority',
      status: 'Ready to Apply',
      fee: '₹5,000',
      estimatedTime: '10-15 Days',
      officialPortal: 'https://tnpcbonline.tn.gov.in/',
      applicationMethod: 'Online Portal',
      requiredDocs: ['Business Registration Certificate', 'Address Proof', 'Land Document', 'Project Report'],
      missingDocs: [],
      completedDocs: ['Business Registration Certificate', 'Address Proof'],
    };

  const isProjectReportUploaded = documents.find((d) => d.name?.includes('Project_Report') || d.id === 'doc-4')?.status === 'Verified';

  // Check documents for this approval
  const reqDocs = approval.requiredDocs || ['Business Registration Certificate', 'Address Proof', 'Land Document', 'Project Report'];
  const completedCount = approval.completedDocs?.length || 2;
  const isMissingDocs = approval.missingDocs?.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={() => navigate('/approvals')}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Approvals</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg uppercase tracking-wider">
              {approval.category} Compliance
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              approval.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
              approval.status === 'Ready to Apply' ? 'bg-indigo-100 text-indigo-800' :
              approval.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {approval.status}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{approval.name}</h1>
          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
            <Building className="h-4 w-4 text-slate-400" />
            <span>{approval.authorityFull}</span>
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-right self-start md:self-auto">
          <span className="text-slate-500 font-medium">Statutory Processing Fee</span>
          <p className="text-xl font-extrabold text-slate-900">{approval.fee}</p>
          <p className="text-[11px] text-slate-500">Estimated Duration: <strong>{approval.estimatedTime}</strong></p>
        </div>
      </div>

      {/* 2 Grid Columns: Where to Apply (Star Feature) + Required Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHERE TO APPLY ⭐ (Visually Highlighted Star Feature) */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-7 rounded-2xl text-white shadow-xl border border-indigo-500/30 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⭐</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Where to Apply</h2>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full border border-blue-400/20">
                Official Authority Portal
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Submit the official statutory application directly through the verified government authority portal. InnovX guides your document readiness before filing.
            </p>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Issuing Authority</span>
                <span className="font-bold text-white">{approval.authorityFull}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Application Method</span>
                <span className="font-bold text-blue-300">{approval.applicationMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department Jurisdiction</span>
                <span className="font-bold text-white">Govt of Tamil Nadu</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={approval.officialPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span>Open Official Portal ↗</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-[11px] text-slate-400 text-center italic">
              Verified official portal: {approval.officialPortal}
            </p>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-lg">Required Documents</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {completedCount} / {reqDocs.length} ready
              </span>
            </div>

            <div className="space-y-2.5">
              {reqDocs.map((docName, idx) => {
                const isMissing = approval.missingDocs?.includes(docName);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      isMissing
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {isMissing ? (
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-semibold">{docName}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isMissing ? 'bg-rose-200 text-rose-800 uppercase' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isMissing ? 'Missing' : 'Verified'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Action */}
          {approval.missingDocs?.length > 0 && !isProjectReportUploaded && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Action Required to Submit</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-snug">
                Upload missing <strong className="text-amber-900">{approval.missingDocs.join(', ')}</strong> to complete compliance scrutiny.
              </p>
              <button
                onClick={() => handleUploadDocument('Project_Report.pdf', approval.name)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Missing Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estimated Process Timeline */}
      <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Estimated Process Workflow</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center space-y-1">
            <span className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs inline-flex items-center justify-center">1</span>
            <h4 className="font-bold text-slate-900 text-xs mt-2">Application Submission</h4>
            <p className="text-[11px] text-slate-500">File online form with verified documents</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="h-7 w-7 rounded-full bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center">2</span>
            <h4 className="font-bold text-slate-900 text-xs mt-2">Document Scrutiny</h4>
            <p className="text-[11px] text-slate-500">Officer verification of report & layout</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="h-7 w-7 rounded-full bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center">3</span>
            <h4 className="font-bold text-slate-900 text-xs mt-2">Field Inspection</h4>
            <p className="text-[11px] text-slate-500">District EE site audit & effluent sampling</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="h-7 w-7 rounded-full bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center">4</span>
            <h4 className="font-bold text-slate-900 text-xs mt-2">Final CTO Decision</h4>
            <p className="text-[11px] text-slate-500">Grant of digital Consent to Operate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;
