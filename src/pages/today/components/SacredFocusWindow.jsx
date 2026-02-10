import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { habitLogsService } from '../../../services/voltaService';

const SacredFocusWindow = ({ window, category }) => {
  const { user } = useAuth();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [todayHabits, setTodayHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date()?.toISOString()?.split('T')?.[0];

  useEffect(() => {
    loadTodayHabits();
  }, [user?.id]);

  const loadTodayHabits = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await habitLogsService?.getByDate(user?.id, today);
      if (!error && data) {
        setTodayHabits(data);
      }
    } catch (error) {
      console.error('Failed to load today habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomHabit = async () => {
    if (!customTitle?.trim() || !user?.id) return;
    
    try {
      const { data, error } = await habitLogsService?.create(
        user?.id,
        customTitle?.trim(),
        today,
        false
      );
      
      if (!error && data) {
        setTodayHabits([...todayHabits, data]);
        setCustomTitle('');
        setShowCustomInput(false);
      }
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  const handleToggleCompletion = async (habitLog) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await habitLogsService?.updateCompletion(
        user?.id,
        habitLog?.id,
        !habitLog?.completed
      );
      
      if (!error && data) {
        setTodayHabits(todayHabits?.map(h => 
          h?.id === habitLog?.id ? { ...h, completed: !h?.completed } : h
        ));
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleRemoveHabit = async (habitLogId) => {
    if (!user?.id) return;
    
    try {
      const { error } = await habitLogsService?.delete(user?.id, habitLogId);
      if (!error) {
        setTodayHabits(todayHabits?.filter(h => h?.id !== habitLogId));
      }
    } catch (error) {
      console.error('Failed to remove habit:', error);
    }
  };

  if (!window) return null;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'creative':
        return 'Lightbulb';
      case 'analytical':
        return 'Brain';
      case 'studying':
        return 'BookOpen';
      default:
        return 'Zap';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'creative':
        return 'Creative Work';
      case 'analytical':
        return 'Analytical Work';
      case 'studying':
        return 'Studying';
      default:
        return 'Focus Work';
    }
  };

  return (
    <div className="mb-12 md:mb-16">
      <div className="bg-accent/5 border-2 border-accent/30 rounded-2xl p-8 md:p-10 lg:p-12 transition-all duration-500 hover:border-accent/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon
              name={getCategoryIcon(category)}
              size={24}
              color="var(--color-accent)"
              strokeWidth={2}
            />
          </div>
          <p className="text-sm text-muted-foreground tracking-wide uppercase">
            Your most valuable time today
          </p>
        </div>
        
        <div className="mb-3">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-2">
            {window?.start} - {window?.end}
          </h2>
          <p className="text-lg text-muted-foreground">
            {getCategoryLabel(category)}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground/80 mt-6">
          Protect this window
        </p>
      </div>

      {/* Custom Habit Tracking Section */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading habits...
          </div>
        ) : (
          <>
            {todayHabits?.length > 0 && (
              <div className="space-y-3 mb-4">
                {todayHabits?.map((habit) => (
                  <div
                    key={habit?.id}
                    className="bg-muted/30 border border-muted rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleCompletion(habit)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          habit?.completed
                            ? 'bg-accent text-white' :'bg-accent/10 hover:bg-accent/20'
                        }`}
                      >
                        {habit?.completed ? (
                          <Icon name="Check" size={16} strokeWidth={2} />
                        ) : (
                          <Icon name="Target" size={16} color="var(--color-accent)" strokeWidth={2} />
                        )}
                      </button>
                      <p className={`text-sm font-medium ${
                        habit?.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}>
                        {habit?.habitTitle}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveHabit(habit?.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Icon name="X" size={16} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showCustomInput ? (
              <div className="bg-muted/20 border border-muted rounded-xl p-4">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e?.target?.value)}
                  placeholder="Enter habit or focus area to track..."
                  className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground mb-3"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter') handleAddCustomHabit();
                    if (e?.key === 'Escape') setShowCustomInput(false);
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustomHabit}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomTitle('');
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full bg-muted/20 hover:bg-muted/30 border border-dashed border-muted hover:border-accent/50 rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-300 group"
              >
                <Icon
                  name="Plus"
                  size={18}
                  color="var(--color-muted-foreground)"
                  strokeWidth={2}
                  className="group-hover:text-accent transition-colors"
                />
                <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors font-medium">
                  Track Custom Habit
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SacredFocusWindow;