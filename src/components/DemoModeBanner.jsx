import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DemoModeBanner = () => {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="w-full bg-surface/50 border-b border-border/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-text-secondary text-xs font-thin text-center mr-px -mt-0.5">

          </p>
          <button
            onClick={() => {
              // Navigate to sign in - for now just show alert
              alert('Sign in functionality coming soon. For now, enjoy exploring Volta!');
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">

            Sign in to save your data
          </button>
        </div>
      </div>
    </div>);

};

export default DemoModeBanner;