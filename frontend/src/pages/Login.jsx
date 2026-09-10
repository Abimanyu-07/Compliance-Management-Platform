import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('arun@innovx-manufacturing.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans">
      {/* Left Branding Panel */}
      <div className="lg:w-1/2 dayflow-panel-gradient p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
        {/* Glow effect overlay */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Header Badge */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Zap className="h-7 w-7 fill-current text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">InnovX</h1>
              <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase">Enterprise Governance Platform</p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              AI-Powered Business Approval & Compliance Management
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Manage approvals. Reduce delays. Stay compliant.
            </p>

            <div className="pt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Smart Requirement Identification:</strong> Sector, location & scale specific approvals for Tamil Nadu businesses.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Where-to-Apply Guidance:</strong> Direct link to official government portals with step-by-step checklists.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">AI Dependency Engine:</strong> Predict bottlenecks and identify next best actions to unblock permits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Bottom Quote */}
        <div className="mt-12 pt-6 border-t border-slate-800/80">
          <blockquote className="text-xs text-slate-400 italic">
            “We don't just tell businesses what approvals they need — we tell them where to apply, check whether they are ready, understand approval dependencies, identify risks, and recommend the next best action.”
          </blockquote>
          <p className="text-[11px] font-semibold text-blue-400 mt-2">— InnovX Key USP</p>
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="lg:w-1/2 bg-slate-900 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Welcome to InnovX</h3>
            <p className="text-xs text-slate-400">Sign in to access your business compliance dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo Mode Box */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-center space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Demo Mode
            </span>
            <p className="text-xs text-slate-400">
              No real authentication is required for this prototype. Click above to explore all features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
