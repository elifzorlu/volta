import { useEffect, useState } from 'react';

const GreetingHeader = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date()?.getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning.');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon.');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening.');
    } else {
      setGreeting('Good night.');
    }
  }, []);

  return (
    <div className="mb-12 md:mb-16 lg:mb-20">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground tracking-tight text-center">
        {greeting}
      </h1>
    </div>
  );
};

export default GreetingHeader;