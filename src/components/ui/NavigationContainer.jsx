import { Outlet } from 'react-router-dom';
import PrimaryTabNavigation from './PrimaryTabNavigation';

const NavigationContainer = () => {
  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <PrimaryTabNavigation />
      <main className="content-area max-w-7xl mx-auto px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default NavigationContainer;