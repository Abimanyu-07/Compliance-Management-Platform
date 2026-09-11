import React, { useState } from 'react';
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
  Sparkles,
  BarChart3,
} from 'lucide-react';

const impactStyles = {
  High: 'bg-amber-100 text-amber-800',
  Medium: 'bg-blue-100 text-blue-800',
  Low: 'bg-slate-200 text-slate-700',
};

const riskBandStyles = {
  'Low Risk': { ring: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-800' },
  'Medium Risk': { ring: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', pill: 'bg-amber-100 text-amber-800' },
  'High Risk': { ring: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', pill: 'bg-rose-100 text-rose-800' },
};

const RiskIntelligence = () => {
  const navigate = useNavigate();
  const {
    riskMetrics,
    handleUploadDocument,
    runWhatIfSimulation,
    whatIfResult,
    isSimulatingWhatIf,
  } = useApp();

  const [showWhatIf, setShowWhatIf] = useState(false);

  // Real data from the backend (rule engine readiness_score + Random
  // Forest ML risk_score/risk_probability), no more hardcoded mock values.
  const band = riskBandStyles[riskMetrics.status] || riskBandStyles['Low Risk'];
  const displayScore = riskMetrics.riskScore ?? riskMetrics.overallScore ?? 0;
  const hasBlockingIssues = (riskMetrics.riskFactors || []).some((f) => f.impact === 'High');

  const handleRunSimulation = async () => {
    setShowWhatIf(true);
    await runWhatIfSimulation({
      resolve_missing_documents: true,
      resolve_document_errors: true,
      resolve_dependencies: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk & Delay Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hybrid AI risk model: explainable rule engine + Random Forest ML prediction.
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Compliance Risk Score
              </h3>
              {riskMetrics.model?.available && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase">
                  {riskMetrics.model.name} · {riskMetrics.model.version}
                </span>
              )}
            </div>

            {/* Gauge Display */}
            <div className="text-center py-6">
              <div className={`inline-flex items-center justify-center h-32 w-32 rounded-full border-8 ${band.ring} ${band.bg} ${band.text} shadow-inner`}>
                <div>
                  <span className="text-4xl font-extrabold">{displayScore}</span>
                  <span className="text-xs font-semibold text-slate-500 block">/ 100</span>
                </div>
              </div>

              <div className="mt-4">
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${band.pill}`}>
                  {riskMetrics.status}
                </span>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  {riskMetrics.statusDescription}
                </p>
                {typeof riskMetrics.riskProbability === 'number' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    ML risk probability: {(riskMetrics.riskProbability * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            Readiness score: {riskMetrics.readinessScore}/100 — lower risk score indicates minimal legal & financial liability
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
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${!hasBlockingIssues ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {!hasBlockingIssues ? 'Forecast: Minimal Delay' : `Risk Level: ${riskMetrics.status.replace(' Risk', '')}`}
              </span>
            </div>

            {hasBlockingIssues ? (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm font-bold text-amber-300">
                  {riskMetrics.delayPrediction.days > 0
                    ? `Forecasted Delay: ${riskMetrics.delayPrediction.days} Business Days`
                    : 'Action required before this approval can proceed'}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {riskMetrics.delayPrediction.rootCause}.
                </p>
                <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-blue-300">
                  <ArrowRight className="h-4 w-4" />
                  <span>Recommended Action: {riskMetrics.delayPrediction.recommendedAction}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm font-bold text-emerald-300">
                  Forecasted Delay: 0 Days (No blocking issues detected)
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All tracked documents and dependencies are currently in good standing.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {hasBlockingIssues && (
              <button
                onClick={() => handleUploadDocument('Project_Report.pdf', 'Pollution Consent')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Missing Document</span>
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

      {/* What-If Compliance Simulator */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 rounded-2xl p-6 border border-indigo-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-900 text-sm">What-If Compliance Simulator</h4>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full">
                  Hybrid AI Scenario Engine
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                See the risk impact of resolving missing documents, validation warnings, and blocking dependencies — computed live, nothing is changed in your data.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulatingWhatIf}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer"
          >
            {isSimulatingWhatIf ? 'Simulating…' : 'What if I resolve all blockers?'}
          </button>
        </div>

        {showWhatIf && whatIfResult && (
          <div className="mt-5 pt-4 border-t border-indigo-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Current Risk Score</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{whatIfResult.current.risk_score}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{whatIfResult.current.risk_level}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Simulated Risk Score</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{whatIfResult.simulated.risk_score}</p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">{whatIfResult.simulated.risk_level}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Risk Score Change</span>
              <p className={`text-2xl font-extrabold mt-1 ${whatIfResult.improvement.risk_score_delta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {whatIfResult.improvement.risk_score_delta > 0 ? '+' : ''}{whatIfResult.improvement.risk_score_delta}
              </p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">{whatIfResult.disclaimer}</p>
            </div>
          </div>
        )}
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
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${impactStyles[factor.impact] || impactStyles.Low}`}>
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

      {/* Model Feature Importance (explicitly separate from per-factor explanations) */}
      {riskMetrics.featureImportance && riskMetrics.featureImportance.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Model Feature Importance</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Reflects which features most influence the Random Forest model's predictions overall — this is not a causal explanation of any single application's score. See the factors above for that.
            </p>
          </div>
          <div className="space-y-2">
            {riskMetrics.featureImportance.map((row) => (
              <div key={row.feature} className="flex items-center gap-3 text-xs">
                <span className="w-44 shrink-0 text-slate-600 font-semibold">{row.feature.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${Math.round(row.importance * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-slate-500">{(row.importance * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIntelligence;
