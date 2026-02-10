import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const GreetingHeader = () => {
  const [greeting, setGreeting] = useState('');
  const { userProfile, isDemoMode } = useAuth();

  useEffect(() => {
    const hour = new Date()?.getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening');
    } else {
      setGreeting('Good night');
    }
  }, []);

  // Get display name from profile or localStorage (for demo mode)
  const getDisplayName = () => {
    if (isDemoMode) {
      const demoProfile = localStorage.getItem('volta_demo_profile');
      if (demoProfile) {
        const parsed = JSON.parse(demoProfile);
        return parsed?.displayName || '';
      }
    }
    return userProfile?.displayName || userProfile?.fullName || '';
  };

  const displayName = getDisplayName();
  const greetingText = displayName ? `${greeting}, ${displayName}.` : `${greeting}.`;

  return (
    <div className="mb-12 md:mb-16 lg:mb-20">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground tracking-tight text-center">
        {greetingText}
      </h1>
    </div>
  );
};

export default GreetingHeader;