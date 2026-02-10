import Icon from '../../../components/AppIcon';

const SacredFocusWindow = ({ window, category }) => {
  if (!window) return null;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'creative':
        return 'Lightbulb';
      case 'analytical':
        return 'Brain';
      case 'studying':
        return 'BookOpen';
      default:
        return 'Zap';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'creative':
        return 'Creative Work';
      case 'analytical':
        return 'Analytical Work';
      case 'studying':
        return 'Studying';
      default:
        return 'Focus Work';
    }
  };

  return (
    <div className="mb-12 md:mb-16">
      <div className="bg-accent/5 border-2 border-accent/30 rounded-2xl p-8 md:p-10 lg:p-12 transition-all duration-500 hover:border-accent/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon
              name={getCategoryIcon(category)}
              size={24}
              color="var(--color-accent)"
              strokeWidth={2}
            />
          </div>
          <p className="text-sm text-muted-foreground tracking-wide uppercase">
            Your most valuable time today
          </p>
        </div>
        
        <div className="mb-3">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-2">
            {window?.start} - {window?.end}
          </h2>
          <p className="text-lg text-muted-foreground">
            {getCategoryLabel(category)}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground/80 mt-6">
          Protect this window
        </p>
      </div>
    </div>
  );
};

export default SacredFocusWindow;