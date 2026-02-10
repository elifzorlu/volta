import Button from '../../../components/ui/Button';

const SessionControls = ({ isRunning, onStart, onPause, onReset }) => {
  return (
    <div className="flex justify-center gap-4 mb-12">
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="bg-accent text-black hover:bg-accent/90 px-12"
        >
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className="px-12"
        >
          Pause
        </Button>
      )}
      
      <Button
        onClick={onReset}
        size="lg"
        variant="ghost"
        className="px-8"
      >
        Reset
      </Button>
    </div>
  );
};

export default SessionControls;