import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PomodoroSettings = ({ settings, onChange }) => {
  const [localSettings, setLocalSettings] = useState({
    focusDuration: settings?.focusDuration || 25,
    shortBreakDuration: settings?.shortBreakDuration || 5,
    longBreakDuration: settings?.longBreakDuration || 15,
    pomodorosUntilLongBreak: settings?.pomodorosUntilLongBreak || 4
  });

  const handleSliderChange = (key, value) => {
    const numValue = parseInt(value);
    setLocalSettings(prev => ({ ...prev, [key]: numValue }));
    onChange(key, numValue);
  };

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Timer" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Pomodoro Customization
        </h2>
      </div>

      <div className="space-y-6">
        {/* Focus Duration */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Focus Session Duration</label>
            <span className="text-[#39FF88] font-mono text-sm">{localSettings?.focusDuration} min</span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={localSettings?.focusDuration}
            onChange={(e) => handleSliderChange('focusDuration', e?.target?.value)}
            className="w-full h-1 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #39FF88 0%, #39FF88 ${((localSettings?.focusDuration - 15) / (60 - 15)) * 100}%, #1A1A1A ${((localSettings?.focusDuration - 15) / (60 - 15)) * 100}%, #1A1A1A 100%)`
            }}
          />
          <p className="text-xs text-[rgba(237,237,237,0.6)] mt-2">15-60 minutes</p>
        </div>

        {/* Short Break Duration */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Short Break Duration</label>
            <span className="text-[#39FF88] font-mono text-sm">{localSettings?.shortBreakDuration} min</span>
          </div>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={localSettings?.shortBreakDuration}
            onChange={(e) => handleSliderChange('shortBreakDuration', e?.target?.value)}
            className="w-full h-1 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #39FF88 0%, #39FF88 ${((localSettings?.shortBreakDuration - 3) / (15 - 3)) * 100}%, #1A1A1A ${((localSettings?.shortBreakDuration - 3) / (15 - 3)) * 100}%, #1A1A1A 100%)`
            }}
          />
          <p className="text-xs text-[rgba(237,237,237,0.6)] mt-2">3-15 minutes</p>
        </div>

        {/* Long Break Duration */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Long Break Duration</label>
            <span className="text-[#39FF88] font-mono text-sm">{localSettings?.longBreakDuration} min</span>
          </div>
          <input
            type="range"
            min="15"
            max="30"
            step="5"
            value={localSettings?.longBreakDuration}
            onChange={(e) => handleSliderChange('longBreakDuration', e?.target?.value)}
            className="w-full h-1 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #39FF88 0%, #39FF88 ${((localSettings?.longBreakDuration - 15) / (30 - 15)) * 100}%, #1A1A1A ${((localSettings?.longBreakDuration - 15) / (30 - 15)) * 100}%, #1A1A1A 100%)`
            }}
          />
          <p className="text-xs text-[rgba(237,237,237,0.6)] mt-2">15-30 minutes</p>
        </div>

        {/* Pomodoros Until Long Break */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Pomodoros Until Long Break</label>
            <span className="text-[#39FF88] font-mono text-sm">{localSettings?.pomodorosUntilLongBreak}</span>
          </div>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={localSettings?.pomodorosUntilLongBreak}
            onChange={(e) => handleSliderChange('pomodorosUntilLongBreak', e?.target?.value)}
            className="w-full h-1 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #39FF88 0%, #39FF88 ${((localSettings?.pomodorosUntilLongBreak - 2) / (8 - 2)) * 100}%, #1A1A1A ${((localSettings?.pomodorosUntilLongBreak - 2) / (8 - 2)) * 100}%, #1A1A1A 100%)`
            }}
          />
          <p className="text-xs text-[rgba(237,237,237,0.6)] mt-2">2-8 sessions</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroSettings;