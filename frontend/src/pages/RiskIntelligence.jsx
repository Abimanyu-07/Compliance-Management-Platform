import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  TrendingDown,
  ArrowRight,
  UploadCloud,
  Check,
  Activity,
  Sparkles
} from 'lucide-react';

const RiskIntelligence = () => {
  const navigate = useNavigate();
  const { riskMetrics, documents, handleUploadDocument } = useApp();

  const isProjectReportUploaded = documents.find(d => d.id === 'doc-4')?.status === 'Verified';

  // Dynamic score based on project report state
  const currentRiskScore = isProjectReportUploaded ? 8 : 18;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk & Delay Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Predictive AI models forecasting bottleneck delays and compliance liabilities.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center space-x-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Real-time Risk Audit Active</span>
        </span>
      </div>

      {/* Top 2 Columns: Risk Score Gauge + AI Delay Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Risk Score Card (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Compliance Risk Score
            </h3>

            {/* Gauge Display */}
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-32 w-32 rounded-full border-8 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner">
                <div>
                  <span className="text-4xl font-extrabold">{currentRiskScore}</span>
                  <span className="text-xs font-semibold text-slate-500 block">/ 100</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  Low Risk Standing
                </span>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  {riskMetrics.statusDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            Lower score indicates minimal legal & financial liability
          </div>
        </div>

        {/* AI Delay Prediction Card (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 lg:p-7 rounded-2xl text-white shadow-xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">AI Delay Prediction Engine</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${isProjectReportUploaded ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isProjectReportUploaded ? 'Forecast: Minimal Delay' : 'Risk Level: High'}
              </span>
            </div>

            {!isProjectReportUploaded ? (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm font-bold text-amber-300">
                  Forecasted Delay: 14 Business Days on Pollution Consent (CTO)
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {riskMetrics.delayPrediction.rootCause}. This causes downstream delay on Factory Licence scrutiny by up to 18 business days.
                </p>
                <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-blue-300">
                  <ArrowRight className="h-4 w-4" />
                  <span>Recommended Action: {riskMetrics.delayPrediction.recommendedAction}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm font-bold text-emerald-300">
                  Forecasted Delay: 0 Days (Scrutiny Cleared)
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Project Report uploaded and verified by AI Scrutiny. Pollution Consent is on track for standard SLA clearance.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {!isProjectReportUploaded && (
              <button
                onClick={() => handleUploadDocument('Project_Report.pdf', 'Pollution Consent')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Project Report Now</span>
              </button>
            )}
            <button
              onClick={() => navigate('/dependencies')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              View Dependency Graph →
            </button>
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Identified Risk Factors Breakdown
        </h3>

        <div className="space-y-3">
          {riskMetrics.riskFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">{factor.name}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    factor.impact === 'High' ? 'bg-amber-100 text-amber-800' :
                    factor.impact === 'Medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {factor.impact} Risk
                  </span>
                </div>
                <p className="text-slate-500 mt-1">{factor.detail}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-slate-400 font-semibold">{factor.category}</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  +{factor.score} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskIntelligence;
