import Icon from '../../../components/AppIcon';

const ThemeSettings = ({ settings, onChange }) => {
  const themes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Jet black with neon green',
      preview: { bg: '#000000', accent: '#39FF88', text: '#EDEDED' }
    },
    {
      id: 'midnight',
      name: 'Midnight',
      description: 'Deep blue with cyan',
      preview: { bg: '#0A0E27', accent: '#00D9FF', text: '#E8F1F5' }
    },
    {
      id: 'ember',
      name: 'Ember',
      description: 'Dark charcoal with warm orange',
      preview: { bg: '#1A1A1A', accent: '#FF6B35', text: '#F5F5F5' }
    },
    {
      id: 'forest',
      name: 'Forest',
      description: 'Deep green with mint',
      preview: { bg: '#0D1B0D', accent: '#7FFF9F', text: '#E8F5E8' }
    }
  ];

  const handleThemeSelect = (themeId) => {
    onChange('theme', themeId);
  };

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Palette" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Theme Options
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes?.map((theme) => (
          <button
            key={theme?.id}
            onClick={() => handleThemeSelect(theme?.id)}
            className={`relative p-4 rounded-lg border transition-all ${
              settings?.theme === theme?.id
                ? 'border-[#39FF88] bg-[rgba(57,255,136,0.05)]'
                : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
            }`}
          >
            {/* Theme Preview */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex gap-1">
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme?.preview?.bg }}
                />
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme?.preview?.accent }}
                />
                <div 
                  className="w-8 h-8 rounded border border-[rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: theme?.preview?.text }}
                />
              </div>
              {settings?.theme === theme?.id && (
                <Icon name="Check" size={16} color="#39FF88" />
              )}
            </div>

            {/* Theme Info */}
            <div className="text-left">
              <h3 className="font-medium text-sm mb-1">{theme?.name}</h3>
              <p className="text-xs text-[rgba(237,237,237,0.6)]">{theme?.description}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-[rgba(237,237,237,0.6)] mt-4">
        Note: Theme changes will be available in a future update
      </p>
    </div>
  );
};

export default ThemeSettings;