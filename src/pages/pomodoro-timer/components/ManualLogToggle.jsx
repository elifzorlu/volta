import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const ManualLogToggle = ({ showManualLog, onToggle }) => {
  const navigate = useNavigate();

  const handleNavigateToLog = () => {
    navigate('/log');
  };

  return (
    <div className="border-t border-border pt-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4 tracking-wide">
          Prefer to log your study session manually?
        </p>
        <Button
          onClick={handleNavigateToLog}
          variant="outline"
          size="default"
          className="px-8"
        >
          Go to Manual Log
        </Button>
      </div>
    </div>
  );
};

export default ManualLogToggle;