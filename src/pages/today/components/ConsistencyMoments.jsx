import { CheckCircle2, Shield, Moon } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ConsistencyMoments = ({ moments = [] }) => {
  // Don't render if no moments to show
  if (!moments || moments?.length === 0) {
    return null;
  }

  const iconMap = {
    focus: Shield,
    energy: CheckCircle2,
    rest: Moon
  };

  const colorMap = {
    focus: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', text: 'text-blue-100' },
    energy: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', text: 'text-purple-100' },
    rest: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', text: 'text-indigo-100' }
  };

  return (
    <div className="mb-6">
      <div className="space-y-3">
        {moments?.map((moment, index) => {
          const Icon = iconMap?.[moment?.type] || CheckCircle2;
          const colors = colorMap?.[moment?.type] || colorMap?.focus;

          return (
            <div
              key={index}
              className={`${colors?.bg} border ${colors?.border} rounded-lg p-4 backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${colors?.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${colors?.icon}`} />
                </div>
                <p className={`text-sm ${colors?.text} leading-relaxed`}>
                  {moment?.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConsistencyMoments;