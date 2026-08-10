import React, {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useApp,
} from '../context/AppContext';

import {
  UserRole,
} from '../types';

import {
  Shield,
  Lock,
  Mail,
  User,
  ShieldCheck,
  UserCheck,
  Cpu,
  ArrowRight,
  FileBadge,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const RegisterPage: React.FC =
  () => {
    const navigate =
      useNavigate();

    const {
      registerUser,
      loginUser,
    } = useApp();

    const [role, setRole] =
      useState<UserRole>('victim');

    const [fullName, setFullName] =
      useState('');

    const [email, setEmail] =
      useState('');

    const [phone, setPhone] =
      useState('');

    const [address, setAddress] =
      useState('');

    const [badgeId, setBadgeId] =
      useState('');

    const [department, setDepartment] =
      useState('');

    const [password, setPassword] =
      useState('');

    const [
      confirmPassword,
      setConfirmPassword,
    ] = useState('');

    const [acceptedTerms, setAcceptedTerms] =
      useState(false);

    const [loading, setLoading] =
      useState(false);

    const [error, setError] =
      useState('');

    const [success, setSuccess] =
      useState('');

    /* -------------------------------------------------------------------- */
    /* ROLE SELECTION                                                       */
    /* -------------------------------------------------------------------- */

    const selectRole = (
      newRole: UserRole
    ) => {
      setRole(newRole);

      setError('');

      if (
        newRole === 'victim'
      ) {
        setBadgeId('');
        setDepartment('');
      }
    };

    /* -------------------------------------------------------------------- */
    /* REGISTER                                                             */
    /* -------------------------------------------------------------------- */

    const handleRegister = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setError('');
      setSuccess('');

      /* Basic validation */

      if (
        !fullName.trim()
      ) {
        setError(
          'Please enter your full name.'
        );
        return;
      }

      if (
        !email.trim()
      ) {
        setError(
          'Please enter your email address.'
        );
        return;
      }

      if (
        !phone.trim()
      ) {
        setError(
          'Please enter your mobile number.'
        );
        return;
      }

      if (
        !address.trim()
      ) {
        setError(
          'Please enter your city / state.'
        );
        return;
      }

      if (
        password.length < 8
      ) {
        setError(
          'Password must contain at least 8 characters.'
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          'Passwords do not match.'
        );
        return;
      }

      if (
        role !== 'victim' &&
        (
          !badgeId.trim() ||
          !department.trim()
        )
      ) {
        setError(
          'Official ID and department are required for this account type.'
        );
        return;
      }

      if (
        !acceptedTerms
      ) {
        setError(
          'Please accept the authorization and usage terms.'
        );
        return;
      }

      setLoading(true);

      try {
        /* -------------------------------------------------------------- */
        /* CREATE ACCOUNT                                                  */
        /* -------------------------------------------------------------- */

        const registration =
          await registerUser({
            name:
              fullName.trim(),

            email:
              email
                .trim()
                .toLowerCase(),

            phone:
              phone.trim(),

            address:
              address.trim(),

            role,

            badgeId:
              role !== 'victim'
                ? badgeId.trim()
                : undefined,

            department:
              role !== 'victim'
                ? department.trim()
                : undefined,

            isVerified:
              false,

            password,
          });

        if (
          !registration.success
        ) {
          setError(
            registration.message
          );

          return;
        }

        /* -------------------------------------------------------------- */
        /* AUTOMATIC LOGIN                                                 */
        /* -------------------------------------------------------------- */

        const login =
          await loginUser(
            email
              .trim()
              .toLowerCase(),

            password,

            role
          );

        if (
          !login.success
        ) {
          setError(
            `Account created, but automatic login failed. ${login.message}`
          );

          return;
        }

        /* -------------------------------------------------------------- */
        /* SUCCESS                                                         */
        /* -------------------------------------------------------------- */

        setSuccess(
          'Account created successfully. Opening your portal...'
        );

        setTimeout(() => {
          navigate(
            `/${role}`,
            {
              replace: true,
            }
          );
        }, 700);
      } catch (err) {
        console.error(
          'Registration error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to create your account. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    /* -------------------------------------------------------------------- */
    /* INPUT STYLE                                                          */
    /* -------------------------------------------------------------------- */

    const inputClass =
      'w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition';

    /* -------------------------------------------------------------------- */
    /* PAGE                                                                 */
    /* -------------------------------------------------------------------- */

    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">

        {/* Background grid */}

        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)',
              backgroundSize:
                '32px 32px',
            }}
          />
        </div>

        {/* Glow */}

        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-36 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">

          {/* ------------------------------------------------------------ */}
          {/* HEADER                                                        */}
          {/* ------------------------------------------------------------ */}

          <div className="text-center space-y-2 relative mb-7">

            <button
              type="button"
              onClick={() =>
                navigate('/')
              }
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg border border-cyan-400/40">
                <Shield className="w-6 h-6" />
              </div>

              <span className="text-2xl font-extrabold tracking-wider text-white font-mono uppercase">
                Forens
                <span className="text-cyan-400">
                  IQ
                </span>
              </span>
            </button>

            <h2 className="text-lg font-bold text-white">
              Create ForensIQ Account
            </h2>

            <p className="text-xs text-slate-400">
              Register for the India Cybercrime Investigation & Evidence Portal
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* ROLE SELECTOR                                                 */}
          {/* ------------------------------------------------------------ */}

          <div className="mb-4">

            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mb-2">
              Select account type
            </p>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">

              {/* VICTIM */}

              <button
                type="button"
                onClick={() =>
                  selectRole(
                    'victim'
                  )
                }
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'victim'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <UserCheck className="w-5 h-5" />

                <span className="text-xs font-semibold">
                  Citizen
                </span>
              </button>

              {/* OFFICER */}

              <button
                type="button"
                onClick={() =>
                  selectRole(
                    'officer'
                  )
                }
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'officer'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />

                <span className="text-xs font-semibold">
                  Cyber Officer
                </span>
              </button>

              {/* ADMIN */}

              <button
                type="button"
                onClick={() =>
                  selectRole(
                    'admin'
                  )
                }
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Cpu className="w-5 h-5" />

                <span className="text-xs font-semibold">
                  Administrator
                </span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* ROLE INFORMATION                                              */}
          {/* ------------------------------------------------------------ */}

          <div className="flex items-start gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl mb-5">

            {role === 'victim' && (
              <UserCheck className="w-5 h-5 text-indigo-400 mt-0.5" />
            )}

            {role === 'officer' && (
              <ShieldCheck className="w-5 h-5 text-cyan-400 mt-0.5" />
            )}

            {role === 'admin' && (
              <Cpu className="w-5 h-5 text-purple-400 mt-0.5" />
            )}

            <div>

              <p className="text-xs font-bold text-white">

                {role ===
                  'victim' &&
                  'Citizen / Victim Account'}

                {role ===
                  'officer' &&
                  'Cybercrime Investigation Officer'}

                {role ===
                  'admin' &&
                  'Portal Administrator'}
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">

                {role ===
                  'victim' &&
                  'Submit cybercrime complaints, upload evidence and track your case.'}

                {role ===
                  'officer' &&
                  'Investigate assigned cases, verify evidence and manage forensic workflows.'}

                {role ===
                  'admin' &&
                  'Manage officers, system permissions, audit logs and cybercrime operations.'}
              </p>

            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* ERROR                                                         */}
          {/* ------------------------------------------------------------ */}

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">

              <AlertCircle className="w-4 h-4 shrink-0" />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* SUCCESS                                                       */}
          {/* ------------------------------------------------------------ */}

          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">

              <CheckCircle2 className="w-4 h-4 shrink-0" />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* FORM                                                          */}
          {/* ------------------------------------------------------------ */}

          <form
            onSubmit={
              handleRegister
            }
            className="space-y-5"
          >

            {/* PERSONAL INFORMATION */}

            <div>

              <div className="flex items-center gap-2 mb-3">

                <User className="w-4 h-4 text-cyan-400" />

                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Personal Information
                </h3>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* NAME */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>

                  <div className="relative">

                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      value={
                        fullName
                      }
                      onChange={e =>
                        setFullName(
                          e.target.value
                        )
                      }
                      placeholder="Enter full name"
                      required
                      autoComplete="name"
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="email"
                      value={
                        email
                      }
                      onChange={e =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

                {/* PHONE */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="tel"
                      value={
                        phone
                      }
                      onChange={e =>
                        setPhone(
                          e.target.value
                        )
                      }
                      placeholder="+91 XXXXX XXXXX"
                      required
                      autoComplete="tel"
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

                {/* ADDRESS */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / State
                  </label>

                  <div className="relative">

                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      value={
                        address
                      }
                      onChange={e =>
                        setAddress(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Chennai, Tamil Nadu"
                      required
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* OFFICIAL INFORMATION                                      */}
            {/* ---------------------------------------------------------- */}

            {role !==
              'victim' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">

                <div className="flex items-center gap-2">

                  <Building2 className="w-4 h-4 text-cyan-400" />

                  <div>

                    <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                      Official Information
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Required for departmental account verification
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* BADGE */}

                  <div>

                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official ID / Badge Number
                    </label>

                    <div className="relative">

                      <FileBadge className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                      <input
                        type="text"
                        value={
                          badgeId
                        }
                        onChange={e =>
                          setBadgeId(
                            e.target.value
                          )
                        }
                        placeholder={
                          role ===
                          'officer'
                            ? 'e.g. TN-CYBER-1024'
                            : 'e.g. ADMIN-001'
                        }
                        required
                        className={`${inputClass} font-mono`}
                      />

                    </div>
                  </div>

                  {/* DEPARTMENT */}

                  <div>

                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Unit
                    </label>

                    <div className="relative">

                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                      <input
                        type="text"
                        value={
                          department
                        }
                        onChange={e =>
                          setDepartment(
                            e.target.value
                          )
                        }
                        placeholder={
                          role ===
                          'officer'
                            ? 'Cyber Crime Police Station'
                            : 'Cyber Command'
                        }
                        required
                        className={
                          inputClass
                        }
                      />

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SECURITY                                                    */}
            {/* ---------------------------------------------------------- */}

            <div>

              <div className="flex items-center gap-2 mb-3">

                <Lock className="w-4 h-4 text-cyan-400" />

                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Account Security
                </h3>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* PASSWORD */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>

                  <div className="relative">

                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      value={
                        password
                      }
                      onChange={e =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                      autoComplete="new-password"
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <CheckCircle2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      value={
                        confirmPassword
                      }
                      onChange={e =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Re-enter password"
                      minLength={8}
                      required
                      autoComplete="new-password"
                      className={
                        inputClass
                      }
                    />

                  </div>
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* TERMS                                                       */}
            {/* ---------------------------------------------------------- */}

            <label className="flex items-start gap-2 text-[10px] text-slate-500 cursor-pointer">

              <input
                type="checkbox"
                checked={
                  acceptedTerms
                }
                onChange={e =>
                  setAcceptedTerms(
                    e.target.checked
                  )
                }
                className="mt-0.5 accent-cyan-500"
              />

              <span>
                I confirm that the information provided is accurate
                and agree to use the ForensIQ portal only for
                authorized cybercrime reporting, investigation and
                evidence-management purposes.
              </span>

            </label>

            {/* ---------------------------------------------------------- */}
            {/* SUBMIT                                                      */}
            {/* ---------------------------------------------------------- */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  <span>
                    Creating Secure Account...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create Account & Open{' '}
                    {role.toUpperCase()}{' '}
                    Portal
                  </span>

                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>

          {/* ------------------------------------------------------------ */}
          {/* LOGIN                                                        */}
          {/* ------------------------------------------------------------ */}

          <div className="pt-5 mt-5 border-t border-slate-800 text-center text-xs text-slate-400">

            <span>
              Already have an account?{' '}
            </span>

            <button
              type="button"
              onClick={() =>
                navigate('/login')
              }
              className="text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>

          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECURITY FOOTER                                              */}
          {/* ------------------------------------------------------------ */}

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 mt-4">

            <Lock className="w-3 h-3" />

            <span>
              Protected Cybercrime Evidence Portal
            </span>

          </div>

        </div>
      </div>
    );
  };