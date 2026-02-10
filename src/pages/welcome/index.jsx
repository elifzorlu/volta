import { useNavigate } from 'react-router-dom';
import VoltaLogo from '../../components/VoltaLogo';
import Button from '../../components/ui/Button';

const Welcome = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/auth');
  };

  const handleContinueDemo = () => {
    navigate('/personal-setup');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <VoltaLogo className="h-10" />
        </div>
        
        {/* Tagline */}
        <h1 className="text-3xl md:text-4xl text-[#EDEDED] mb-6 font-light tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Mindful productivity,
          <br />
          measured with intention.
        </h1>
        
        {/* Description */}
        <p className="text-base md:text-lg text-zinc-400 mb-12 leading-relaxed max-w-xl mx-auto">
          Volta helps you understand your natural rhythms and work patterns through reflective tracking. 
          No pressure, no judgment—just clarity.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Button
            onClick={handleCreateAccount}
            className="w-full sm:w-auto bg-[#39FF88] hover:bg-[#2ee077] text-black font-medium px-8 py-6 text-base rounded-xl transition-all duration-300 hover:scale-105"
          >
            Create Account
          </Button>
          
          <Button
            onClick={handleContinueDemo}
            variant="outline"
            className="w-full sm:w-auto border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white px-8 py-6 text-base rounded-xl transition-all duration-300"
          >
            Try Demo Mode
          </Button>
        </div>
        
        {/* Sign In Link */}
        <div className="mt-6">
          <button
            onClick={handleCreateAccount}
            className="text-zinc-500 hover:text-[#39FF88] text-sm transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
        
        {/* Decorative line */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-[rgba(255,255,255,0.06)]"></div>
          <span className="text-xs text-zinc-600 tracking-wider">WELCOME</span>
          <div className="h-px w-16 bg-[rgba(255,255,255,0.06)]"></div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;