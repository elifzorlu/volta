import ScheduleHeader from './components/ScheduleHeader';
import WeeklyCalendar from './components/WeeklyCalendar';
import UpcomingCommitments from './components/UpcomingCommitments';
import DemoModeBanner from '../../components/DemoModeBanner';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { commitmentsService } from '../../services/voltaService';

const Schedule = () => {
  const { user, isDemoMode } = useAuth();
  const [commitments, setCommitments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCommitments();
  }, [user, isDemoMode]);

  const loadCommitments = async () => {
    try {
      setLoading(true);
      const { data, error } = await commitmentsService?.getAll(user?.id || null);
      if (error) {
        setError(error?.message || 'Failed to load commitments');
      } else {
        setCommitments(data || []);
      }
    } catch (err) {
      console.error('Load commitments error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommitment = async (commitment) => {
    try {
      const { data, error } = await commitmentsService?.create(user?.id || null, commitment);
      if (error) {
        setError(error?.message || 'Failed to add commitment');
      } else {
        setCommitments(prev => [...prev, data]);
      }
    } catch (err) {
      console.error('Add commitment error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleEditCommitment = async (id, updatedCommitment) => {
    try {
      const { data, error } = await commitmentsService?.update(id, updatedCommitment);
      if (error) {
        setError(error?.message || 'Failed to update commitment');
      } else {
        setCommitments(prev => 
          prev?.map(c => c?.id === id ? data : c)
        );
      }
    } catch (err) {
      console.error('Update commitment error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteCommitment = async (id) => {
    try {
      const { error } = await commitmentsService?.delete(id);
      if (error) {
        setError(error?.message || 'Failed to delete commitment');
      } else {
        setCommitments(prev => prev?.filter(c => c?.id !== id));
      }
    } catch (err) {
      console.error('Delete commitment error:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
        <ScheduleHeader />
        
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center mt-12">
            <p className="text-muted-foreground">Loading commitments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
            <div className="lg:col-span-2">
              <WeeklyCalendar
                commitments={commitments}
                onAddCommitment={handleAddCommitment}
                onEditCommitment={handleEditCommitment}
                onDeleteCommitment={handleDeleteCommitment}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            </div>
            
            <div className="lg:col-span-1">
              <UpcomingCommitments
                commitments={commitments}
                onEditCommitment={handleEditCommitment}
                onDeleteCommitment={handleDeleteCommitment}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;