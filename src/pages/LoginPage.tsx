import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser } = useApp();

  const [selectedRole, setSelectedRole] =
    useState<UserRole>('victim');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(
        email,
        password,
        selectedRole
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate(`/${selectedRole}`);
    } catch (err) {
      console.error('Login error:', err);

      setError(
        'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const roleStyles: Partial<Record<UserRole, string>> = {
    victim:
      selectedRole === 'victim'
        ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-300'
        : 'border-slate-800 bg-slate-950/70 text-slate-400',

    officer:
      selectedRole === 'officer'
        ? 'border-cyan-500/70 bg-cyan-500/10 text-cyan-300'
        : 'border-slate-800 bg-slate-950/70 text-slate-400',
  };

  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="bg-[#0d1118] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className="px-6 pt-7 pb-5 border-b border-slate-800/80">

            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 mx-auto group"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/15 transition">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="text-left">
                <div className="text-xl font-bold tracking-tight text-white">
                  Forens
                  <span className="text-cyan-400">
                    IQ
                  </span>
                </div>

                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Cybercrime Case Platform
                </div>
              </div>
            </button>

            <div className="mt-6 text-center">
              <h1 className="text-lg font-semibold text-white">
                Sign in to your account
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Access your ForensIQ case workspace
              </p>
            </div>
          </div>

          <div className="p-6">

            {/* ROLE SELECTION */}
            <div className="mb-5">

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Select account type
              </label>

              <div className="grid grid-cols-2 gap-2">

                {/* CITIZEN */}
                <button
                  type="button"
                  onClick={() => selectRole('victim')}
                  className={`border rounded-xl p-3 transition-all ${roleStyles.victim}`}
                >
                  <UserCheck className="w-4 h-4 mx-auto mb-1" />

                  <span className="text-xs font-medium">
                    Citizen
                  </span>
                </button>

                {/* OFFICER */}
                <button
                  type="button"
                  onClick={() => selectRole('officer')}
                  className={`border rounded-xl p-3 transition-all ${roleStyles.officer}`}
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1" />

                  <span className="text-xs font-medium">
                    Officer
                  </span>
                </button>

                

              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-4 flex gap-2 items-start rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3">

                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />

                <p className="text-xs text-red-300 leading-relaxed">
                  {error}
                </p>

              </div>
            )}

            {/* LOGIN FORM */}
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* EMAIL */}
              <div>

                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email address
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                    placeholder="Enter your registered email"
                    className="w-full h-10 pl-9 pr-3 bg-[#080b10] border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition"
                  />

                </div>
              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-10 pl-9 pr-10 bg-[#080b10] border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-700/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
              >

                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight className="w-4 h-4" />
                  </>
                )}

              </button>

            </form>

            {/* REGISTER */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">

              <span className="text-xs text-slate-500">
                Don't have an account?{' '}
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate('/register')
                }
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Create an account
              </button>

            </div>

          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          ForensIQ • Secure Case Management Platform
        </p>

      </div>
    </div>
  );
};