import { useState, useEffect } from 'react';
import { brainSignatureService } from '../../../services/voltaService';
import { useAuth } from '../../../contexts/AuthContext';

const BrainSignature = () => {
  const { user, isDemoMode } = useAuth();
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrainSignature();
  }, [user, isDemoMode]);

  const loadBrainSignature = async () => {
    try {
      setLoading(true);
      const { data, error } = await brainSignatureService?.generateBrainSignature(user?.id || null);
      
      if (error) {
        console.error('Error loading brain signature:', error);
      } else if (data) {
        setSignature(data);
      }
    } catch (err) {
      console.error('Load brain signature error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-16 md:mb-20">
        <div className="flex flex-col items-center text-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-6 w-64 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (!signature) {
    return null;
  }

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs md:text-sm text-muted-foreground mb-3 uppercase tracking-wider">
          Your Brain Signature
        </p>
        
        <div className="mb-4 md:mb-6 px-6 py-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight" style={{ color: 'var(--color-accent)' }}>
            {signature?.signature}
          </h2>
        </div>
        
        <p className="text-base md:text-lg text-foreground max-w-md leading-relaxed">
          {signature?.explanation}
        </p>
        
        {signature?.pattern !== 'insufficient-data' && (
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Based on your last 90 days of work patterns</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainSignature;