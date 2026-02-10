import LogHeader from './components/LogHeader';
import LogForm from './components/LogForm';
import DemoModeBanner from '../../components/DemoModeBanner';

const Log = () => {
  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
        <LogHeader />
        
        <div className="w-full">
          <LogForm />
        </div>
      </div>
    </div>
  );
};

export default Log;