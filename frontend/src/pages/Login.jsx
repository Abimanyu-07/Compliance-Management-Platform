import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const SECTORS = [
  'Manufacturing',
  'Textiles & Apparel',
  'Food Processing & Beverages',
  'Chemicals & Pharmaceuticals',
  'Electronics & Hardware',
  'Renewable Energy',
  'Automotive & Engineering',
  'Information Technology',
  'Services & Logistics'
];

const DISTRICTS_TN = [
  'Coimbatore',
  'Chennai',
  'Madurai',
  'Salem',
  'Tiruppur',
  'Trichy',
  'Erode',
  'Kanchipuram',
  'Hosur (Krishnagiri)',
  'Vellore'
];

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, isAuthenticated, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regSector, setRegSector] = useState('Manufacturing');
  const [regState, setRegState] = useState('Tamil Nadu');
  const [regDistrict, setRegDistrict] = useState('Coimbatore');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setSubmitting(true);

    try {
      await login(signInEmail.trim(), signInPassword);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        full_name: regFullName.trim(),
        company_name: regCompanyName.trim() || undefined,
        sector: regSector,
        state: regState,
        district: regDistrict
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err?.message || 'Registration failed. This email may already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setSignInEmail('arun@innovx-manufacturing.com');
    setSignInPassword('password123');
    setLocalError(null);
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Left Branding Panel */}
      <div className="lg:w-1/2 dayflow-panel-gradient p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden text-white border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Glow effect overlays */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Header Badge */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
              <Zap className="h-6 w-6 fill-current text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight">InnovX</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-blue-300/80 font-medium tracking-wide">
                AI Statutory Governance & Compliance System
              </p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Real Database-Backed Enterprise Access</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Smarter Approvals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Zero Regulatory Bottlenecks.
              </span>
            </h2>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
              Unified statutory lifecycle management for Indian enterprises. Real-time document scrutiny, intelligent portal routing, and dependency-aware workflows.
            </p>

            {/* Feature Highlights */}
            <div className="pt-4 space-y-3.5">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Automated Statutory Discovery</h4>
                  <p className="text-[12px] text-slate-300 mt-0.5">
                    Identifies sector, district, and scale-specific approvals (PCB, Factories, Fire, DIC) with official portal links.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Dependency Graph & Readiness Engine</h4>
                  <p className="text-[12px] text-slate-300 mt-0.5">
                    Analyzes blocking prerequisites and auto-evaluates document readiness before official submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              Secured with FastAPI • JWT Bearer Token • Bcrypt Hash
            </p>
            <p className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FastAPI Backend Active (Port 8000)</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center text-xs text-blue-400 font-medium space-x-1">
            <span>v2.4 Enterprise</span>
          </div>
        </div>
      </div>

      {/* Right Login / Register Panel */}
      <div className="lg:w-1/2 bg-slate-900/90 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header Card */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 mb-1 shadow-lg shadow-blue-500/10">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Enterprise Account'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Enter your credentials to access business compliance data and real-time trackers'
                : 'Set up your company profile to automatically discover applicable state and central approvals'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setLocalError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLocalError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Authentication Error</p>
                <p className="mt-0.5 text-rose-300/90 leading-snug">{activeError}</p>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    placeholder="Enter your secure password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Quick Fill Demo Helper Pill */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Quick Test Account
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      arun@innovx-manufacturing.com
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Auto-Fill</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    placeholder="e.g. Sundar Rajan"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Company / Entity Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    required
                    placeholder="e.g. Apex Precision Engineering Pvt Ltd"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Industry Sector
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    <select
                      value={regSector}
                      onChange={(e) => setRegSector(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {DISTRICTS_TN.map((d) => (
                        <option key={d} value={d} className="bg-slate-900 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Account & Workspace...</span>
                  </div>
                ) : (
                  <>
                    <span>Register & Create Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an enterprise account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setLocalError(null);
                  }}
                  className="text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setLocalError(null);
                  }}
                  className="text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
