import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VoltaLogo from '../../components/VoltaLogo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' or 'signin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password?.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError?.message || 'Failed to create account');
        } else {
          // Check if email confirmation is required
          if (data?.user && !data?.session) {
            setSuccessMessage('Account created! Please check your email to confirm your account.');
          } else {
            // Auto-signed in, go to personal setup
            navigate('/personal-setup');
          }
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError?.message || 'Failed to sign in');
        } else {
          // Check if user has completed onboarding
          const onboardingComplete = localStorage.getItem('volta_onboarding_complete');
          if (onboardingComplete) {
            navigate('/today');
          } else {
            navigate('/personal-setup');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Continue in demo mode
    navigate('/personal-setup');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <VoltaLogo className="h-8" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl text-[#EDEDED] mb-3 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            {mode === 'signup' ?'Start tracking your productivity journey' :'Sign in to continue your journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
            className="bg-zinc-900 border-zinc-800 text-white"
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e?.target?.value)}
            className="bg-zinc-900 border-zinc-800 text-white"
            disabled={loading}
          />

          {mode === 'signup' && (
            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e?.target?.value)}
              className="bg-zinc-900 border-zinc-800 text-white"
              disabled={loading}
            />
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39FF88] hover:bg-[#2ee077] text-black font-medium py-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
              setSuccessMessage('');
            }}
            className="text-zinc-400 hover:text-[#39FF88] text-sm transition-colors"
            disabled={loading}
          >
            {mode === 'signup' ?'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            disabled={loading}
          >
            Continue without account (demo mode)
          </button>
        </div>

        {/* Decorative line */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-[rgba(255,255,255,0.06)]"></div>
          <span className="text-xs text-zinc-600 tracking-wider">VOLTA</span>
          <div className="h-px w-16 bg-[rgba(255,255,255,0.06)]"></div>
        </div>
      </div>
    </div>
  );
};

export default Auth;