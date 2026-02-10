import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VoltaLogo from '../../components/VoltaLogo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const PersonalSetup = () => {
  const navigate = useNavigate();
  const { updateProfile, isDemoMode } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    timezone: Intl.DateTimeFormat()?.resolvedOptions()?.timeZone || 'America/Los_Angeles',
    bedtime: '22:00',
    wakeTime: '06:00',
    focusSessionLength: 90,
    breakDuration: 15,
    dailyGoal: 4
  });

  const timezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'China (CST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData?.displayName?.trim()?.length > 0;
  const canProceedStep2 = formData?.bedtime && formData?.wakeTime;
  const canProceedStep3 = formData?.focusSessionLength > 0 && formData?.breakDuration > 0 && formData?.dailyGoal > 0;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
    else if (step === 3 && canProceedStep3) handleComplete();
  };

  const handleComplete = async () => {
    // Save profile data
    const profileUpdates = {
      displayName: formData?.displayName,
      timezone: formData?.timezone,
      settings: {
        bedtime: formData?.bedtime,
        wakeTime: formData?.wakeTime,
        focusSessionLength: formData?.focusSessionLength,
        breakDuration: formData?.breakDuration,
        dailyGoal: formData?.dailyGoal
      }
    };

    if (isDemoMode) {
      // Save to localStorage for demo mode
      localStorage.setItem('volta_demo_profile', JSON.stringify(profileUpdates));
    } else {
      // Save to Supabase for authenticated users
      await updateProfile(profileUpdates);
    }

    // Mark onboarding as complete
    localStorage.setItem('volta_onboarding_complete', 'true');
    
    // Navigate to demo introduction
    navigate('/demo-introduction');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl text-[#EDEDED] mb-3 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          What should we call you?
        </h2>
        <p className="text-zinc-400 text-sm md:text-base">
          This name will appear in your daily greetings.
        </p>
      </div>
      
      <Input
        type="text"
        placeholder="Enter your name"
        value={formData?.displayName}
        onChange={(e) => handleInputChange('displayName', e?.target?.value)}
        className="text-center text-lg bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
        autoFocus
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl text-[#EDEDED] mb-3 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Your rhythm matters.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base">
          Help us understand your natural schedule.
        </p>
      </div>
      
      <Select
        label="Timezone"
        options={timezones}
        value={formData?.timezone}
        onChange={(value) => handleInputChange('timezone', value)}
        className="mb-4"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          label="Bedtime"
          value={formData?.bedtime}
          onChange={(e) => handleInputChange('bedtime', e?.target?.value)}
          className="bg-zinc-900 border-zinc-800 text-white"
        />
        
        <Input
          type="time"
          label="Wake Time"
          value={formData?.wakeTime}
          onChange={(e) => handleInputChange('wakeTime', e?.target?.value)}
          className="bg-zinc-900 border-zinc-800 text-white"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl text-[#EDEDED] mb-3 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          How do you focus best?
        </h2>
        <p className="text-zinc-400 text-sm md:text-base">
          Set your ideal work session preferences.
        </p>
      </div>
      
      <div className="space-y-4">
        <Input
          type="number"
          label="Focus Session Length (minutes)"
          description="How long do you typically work in one session?"
          value={formData?.focusSessionLength}
          onChange={(e) => handleInputChange('focusSessionLength', parseInt(e?.target?.value) || 0)}
          min="15"
          max="180"
          className="bg-zinc-900 border-zinc-800 text-white"
        />
        
        <Input
          type="number"
          label="Break Duration (minutes)"
          description="How long do you rest between sessions?"
          value={formData?.breakDuration}
          onChange={(e) => handleInputChange('breakDuration', parseInt(e?.target?.value) || 0)}
          min="5"
          max="60"
          className="bg-zinc-900 border-zinc-800 text-white"
        />
        
        <Input
          type="number"
          label="Daily Focus Goal (hours)"
          description="How many hours of focused work per day?"
          value={formData?.dailyGoal}
          onChange={(e) => handleInputChange('dailyGoal', parseInt(e?.target?.value) || 0)}
          min="1"
          max="12"
          className="bg-zinc-900 border-zinc-800 text-white"
        />
      </div>
    </div>
  );

  const canProceed = step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : canProceedStep3;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <VoltaLogo className="h-8" />
        </div>
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3]?.map((num) => (
            <div
              key={num}
              className={`h-1 w-12 rounded-full transition-all duration-300 ${
                num === step ? 'bg-[#39FF88]' : num < step ? 'bg-zinc-700' : 'bg-zinc-900'
              }`}
            />
          ))}
        </div>
        
        {/* Step Content */}
        <div className="mb-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 bg-[#39FF88] hover:bg-[#2ee077] text-black font-medium transition-all duration-300 ${
              canProceed ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Complete Setup' : 'Continue'}
          </Button>
        </div>
        
        {/* Step Indicator */}
        <div className="text-center mt-8">
          <span className="text-xs text-zinc-600 tracking-wider">STEP {step} OF 3</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalSetup;