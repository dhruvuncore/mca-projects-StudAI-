import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Check,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { apiService } from '../services/apiService';

interface AuthPagesProps {
  initialMode?: 'login' | 'register';
  onSuccess?: (profile: StudentProfile) => void;
  onAuthSuccess?: (profile: StudentProfile) => void;
  onBackToLanding: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onSuccess,
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [degree, setDegree] = useState('Master of Computer Applications (MCA)');
  const [semester, setSemester] = useState('Semester II');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Validation states
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Load remembered email on mount or sync with initialMode
  useEffect(() => {
    setIsLogin(initialMode === 'login');
    const savedEmail = apiService.getRememberedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [initialMode]);

  const notifySuccess = (profile: StudentProfile) => {
    if (typeof onSuccess === 'function') {
      onSuccess(profile);
    }
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(profile);
    }
  };

  // Helper validation functions
  const validateEmailFormat = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@university.edu).';
    }
    return '';
  };

  const validatePasswordLength = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters long.';
    return '';
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    const newErrors = { ...errors };

    if (field === 'email') {
      const err = validateEmailFormat(email);
      if (err) newErrors.email = err;
      else delete newErrors.email;
    }

    if (field === 'password') {
      const err = validatePasswordLength(password);
      if (err) newErrors.password = err;
      else delete newErrors.password;

      if (!isLogin && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else if (!isLogin && confirmPassword && password === confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (field === 'name' && !isLogin) {
      if (!name.trim() || name.trim().length < 2) {
        newErrors.name = 'Full name is required (minimum 2 characters).';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'confirmPassword' && !isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirming your password is required.';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all fields
    const newErrors: typeof errors = {};

    const emailErr = validateEmailFormat(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePasswordLength(password);
    if (passErr) newErrors.password = passErr;

    if (!isLogin) {
      if (!name.trim() || name.trim().length < 2) {
        newErrors.name = 'Full name is required (minimum 2 characters).';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!agreeTerms) {
        newErrors.terms = 'Please accept the Academic Honor Code to create an account.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (isLogin) {
        // Authenticate existing credentials
        const result = apiService.authenticateUser(email, password);
        setLoading(false);

        if (!result.success || !result.profile) {
          setErrors({
            general: result.error || 'Authentication failed. Please check your credentials.',
          });
          return;
        }

        // Save remembered email preference
        apiService.setRememberedEmail(email, rememberMe);
        notifySuccess(result.profile);
      } else {
        // Register new account
        const result = apiService.registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          degree,
          semester,
        });
        setLoading(false);

        if (!result.success || !result.profile) {
          setErrors({
            general: result.error || 'Registration failed. Please try again.',
          });
          return;
        }

        apiService.setRememberedEmail(email, rememberMe);
        notifySuccess(result.profile);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2.5 mb-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1D4ED8] transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">StudyAI</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          {isLogin ? 'Student Portal Sign In' : 'Create Student Account'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto">
          {isLogin
            ? 'Enter your student credentials to access your course notebooks and AI study assistant.'
            : 'Join students studying with course-grounded AI tutors, verified notes, and practice exams.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm rounded-2xl border border-[#E2E8F0] relative">
          {/* Segmented Mode Switcher */}
          <div className="flex p-1 bg-[#F1F5F9] rounded-xl mb-6 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="text-xs text-[#991B1B] leading-relaxed">
                <p className="font-semibold">{errors.general}</p>
                {errors.general.includes('No registered account') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setErrors({});
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                  >
                    Click here to register an account with {email || 'this email'} →
                  </button>
                )}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Full Name (Registration only) */}
            {!isLogin && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  {name.trim().length >= 2 && (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) validateField('name');
                    }}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Full Name"
                    className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg text-[#0F172A] bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.name && errors.name
                        ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-[#CBD5E1] focus:ring-[#2563EB] focus:border-[#2563EB]'
                    }`}
                  />
                </div>
                {touched.name && errors.name && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#334155]">
                  Student / College Email <span className="text-rose-500">*</span>
                </label>
                {email && !validateEmailFormat(email) && (
                  <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Valid format
                  </span>
                )}
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) validateField('email');
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="student@university.edu"
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg text-[#0F172A] bg-white transition-colors focus:outline-none focus:ring-2 ${
                    touched.email && errors.email
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-[#CBD5E1] focus:ring-[#2563EB] focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            {/* Program & Semester (Registration only) */}
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Academic Program
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="block w-full pl-8 pr-2 py-2 text-xs sm:text-sm border border-[#CBD5E1] rounded-lg text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="Master of Computer Applications (MCA)">MCA</option>
                      <option value="B.Tech Computer Science">B.Tech (CS / IT)</option>
                      <option value="M.Tech Computer Science">M.Tech (CS)</option>
                      <option value="Bachelor of Computer Applications (BCA)">BCA</option>
                      <option value="Information Technology">B.Sc / M.Sc CS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="block w-full px-3 py-2 text-xs sm:text-sm border border-[#CBD5E1] rounded-lg text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#334155]">
                  Password <span className="text-rose-500">*</span>
                </label>
                {isLogin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotModalOpen(true);
                      setForgotSuccess(false);
                    }}
                    className="text-[11px] font-medium text-[#2563EB] hover:underline"
                  >
                    Forgot Password?
                  </button>
                ) : (
                  password && (
                    <span className="text-[11px] font-medium text-[#64748B]">
                      Strength: <span className="font-semibold text-[#0F172A]">{strength.label}</span>
                    </span>
                  )
                )}
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) validateField('password');
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`block w-full pl-9 pr-10 py-2 text-sm border rounded-lg text-[#0F172A] bg-white transition-colors focus:outline-none focus:ring-2 ${
                    touched.password && errors.password
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-[#CBD5E1] focus:ring-[#2563EB] focus:border-[#2563EB]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar in registration */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        strength.score >= 1 ? strength.color : 'bg-transparent'
                      } ${strength.score === 1 ? 'w-1/3' : strength.score === 2 ? 'w-2/3' : 'w-full'}`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    Minimum 6 characters with a combination of letters and numbers.
                  </p>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Registration only) */}
            {!isLogin && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  {confirmPassword && password === confirmPassword && (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Match
                    </span>
                  )}
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) validateField('confirmPassword');
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`block w-full pl-9 pr-10 py-2 text-sm border rounded-lg text-[#0F172A] bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-[#CBD5E1] focus:ring-[#2563EB] focus:border-[#2563EB]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me & Terms Checkboxes */}
            <div className="pt-1">
              {isLogin ? (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                  />
                  <span className="text-xs text-[#475569]">Remember my student email on this device</span>
                </label>
              ) : (
                <div>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                    />
                    <span className="text-xs text-[#475569] leading-tight">
                      I agree to the <span className="font-semibold text-[#0F172A]">Academic Honor Code</span> and StudyAI terms for coursework preparation.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.terms}</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-60 transition-all shadow-xs"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isLogin ? 'Verifying credentials...' : 'Creating student profile...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            ← Return to StudyAI Overview
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Student Password Recovery</h3>
            {forgotSuccess ? (
              <div className="py-3 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Password reset link sent to <span className="font-semibold">{forgotEmail || 'your email'}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Enter your student email address to receive password reset instructions.
                </p>
                <div className="mb-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSuccess(true)}
                    className="flex-1 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
