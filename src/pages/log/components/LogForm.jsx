import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { dailyLogsService, customCategoriesService } from '../../../services/voltaService';
import { trackHabitEvent, trackFormSubmit } from '../../../utils/analytics';

const LogForm = () => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [dailyContext, setDailyContext] = useState({
    sleepHours: '',
    sleepQuality: '',
    caffeineTotal: '',
    energyLevel: '',
    moodTone: '',
    notes: ''
  });

  const [sessions, setSessions] = useState([{
    id: Date.now(),
    category: '',
    startTime: '',
    endTime: '',
    efficiency: '',
    felt: '',
    tags: []
  }]);

  const [customCategories, setCustomCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load custom categories on mount
  useEffect(() => {
    loadCustomCategories();
  }, [user?.id]);

  // Load existing log data when date changes
  useEffect(() => {
    if (selectedDate && user?.id) {
      loadExistingLogData();
    }
  }, [selectedDate, user?.id]);

  const loadCustomCategories = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await customCategoriesService?.getAll(user?.id);
      if (!error && data) {
        setCustomCategories(data);
      }
    } catch (error) {
      console.error('Failed to load custom categories:', error);
    }
  };

  const loadExistingLogData = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await dailyLogsService?.getByDate(user?.id, selectedDate);
      
      if (!error && data) {
        // Pre-fill daily context with existing data
        setDailyContext({
          sleepHours: data?.sleepHours?.toString() || '',
          sleepQuality: data?.sleepQuality || '',
          caffeineTotal: data?.caffeineTotal?.toString() || '',
          energyLevel: data?.energyLevel || '',
          moodTone: data?.moodTone || '',
          notes: data?.notes || ''
        });
      } else {
        // Clear form for new date
        setDailyContext({
          sleepHours: '',
          sleepQuality: '',
          caffeineTotal: '',
          energyLevel: '',
          moodTone: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to load existing log data:', error);
    }
  };

  const sleepQualityOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const energyLevelOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Combine default and custom categories
  const categoryOptions = [
    { value: 'creative', label: 'Creative Work' },
    { value: 'analytical', label: 'Analytical/Assignment Work' },
    { value: 'studying', label: 'Studying/Cramming' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'mixed', label: 'Mixed' },
    ...customCategories?.map(cat => ({
      value: cat?.name?.toLowerCase()?.replace(/\s+/g, '_'),
      label: cat?.name
    }))
  ];

  const efficiencyOptions = [
    { value: '5', label: '5 - Extremely productive' },
    { value: '4', label: '4 - Very productive' },
    { value: '3', label: '3 - Moderately productive' },
    { value: '2', label: '2 - Somewhat productive' },
    { value: '1', label: '1 - Barely productive' }
  ];

  const feltOptions = [
    { value: 'locked-in', label: 'Locked-in' },
    { value: 'scattered', label: 'Scattered' },
    { value: 'forced', label: 'Forced' }
  ];

  const tagOptions = [
    'deep-work', 'meetings', 'research', 'writing', 'coding', 
    'design', 'planning', 'review', 'collaboration', 'learning'
  ];

  const handleDateChange = (e) => {
    setSelectedDate(e?.target?.value);
  };

  const handleDailyContextChange = (field, value) => {
    setDailyContext(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[`context_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[`context_${field}`];
        return newErrors;
      });
    }
  };

  const handleSessionChange = (sessionId, field, value) => {
    setSessions(prev => prev?.map(session => 
      session?.id === sessionId 
        ? { ...session, [field]: value }
        : session
    ));
    
    if (errors?.[`session_${sessionId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[`session_${sessionId}_${field}`];
        return newErrors;
      });
    }
  };

  const handleTagToggle = (sessionId, tag) => {
    setSessions(prev => prev?.map(session => {
      if (session?.id === sessionId) {
        const currentTags = session?.tags || [];
        const newTags = currentTags?.includes(tag)
          ? currentTags?.filter(t => t !== tag)
          : [...currentTags, tag];
        return { ...session, tags: newTags };
      }
      return session;
    }));
  };

  const addSession = () => {
    setSessions(prev => [...prev, {
      id: Date.now(),
      category: '',
      startTime: '',
      endTime: '',
      efficiency: '',
      felt: '',
      tags: []
    }]);
  };

  const removeSession = (sessionId) => {
    if (sessions?.length > 1) {
      setSessions(prev => prev?.filter(session => session?.id !== sessionId));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if this is an existing log by checking if any daily context field is already filled
    const hasExistingContext = dailyContext?.sleepHours || dailyContext?.sleepQuality || 
                               dailyContext?.caffeineTotal || dailyContext?.energyLevel;

    // Only validate daily context if it's a new log (no existing context)
    if (!hasExistingContext) {
      // Validate daily context for new logs
      if (!dailyContext?.sleepHours || dailyContext?.sleepHours < 0 || dailyContext?.sleepHours > 24) {
        newErrors.context_sleepHours = 'Please enter valid sleep hours (0-24)';
      }

      if (!dailyContext?.sleepQuality) {
        newErrors.context_sleepQuality = 'Please select your sleep quality';
      }

      if (!dailyContext?.caffeineTotal || dailyContext?.caffeineTotal < 0) {
        newErrors.context_caffeineTotal = 'Please enter valid caffeine total';
      }

      if (!dailyContext?.energyLevel) {
        newErrors.context_energyLevel = 'Please select your energy level';
      }
    }

    // Validate sessions
    sessions?.forEach(session => {
      if (!session?.category) {
        newErrors[`session_${session?.id}_category`] = 'Please select a category';
      }

      if (!session?.startTime) {
        newErrors[`session_${session?.id}_startTime`] = 'Please enter start time';
      }

      if (!session?.endTime) {
        newErrors[`session_${session?.id}_endTime`] = 'Please enter end time';
      }

      if (session?.startTime && session?.endTime && session?.startTime >= session?.endTime) {
        newErrors[`session_${session?.id}_endTime`] = 'End time must be after start time';
      }

      if (!session?.efficiency) {
        newErrors[`session_${session?.id}_efficiency`] = 'Please rate efficiency';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure user is loaded before submission
    if (!isDemoMode && !user?.id) {
      setErrors({ submit: 'User session not loaded. Please refresh and try again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = isDemoMode ? null : user?.id;
      
      const { data, error } = await dailyLogsService?.create(
        userId,
        dailyContext,
        sessions,
        selectedDate
      );

      if (error) {
        setErrors({ submit: error?.message || 'Failed to save log. Please try again.' });
        setIsSubmitting(false);
        return;
      }

      // Track habit logging event
      trackHabitEvent('logged', {
        session_count: sessions?.length,
        has_notes: !!dailyContext?.notes,
        sleep_hours: dailyContext?.sleepHours,
        user_type: user?.id ? 'authenticated' : 'demo',
        log_date: selectedDate
      });

      // Track form submission
      trackFormSubmit('daily_log_form', {
        success: true,
        session_count: sessions?.length
      });

      // Success - navigate to today page
      navigate('/today');
    } catch (error) {
      console.error('Log submission error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8 lg:space-y-10">
      {/* Daily Context Section */}
      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
            <Icon name="Calendar" size={20} color="var(--color-accent)" strokeWidth={2} />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Daily Context</h2>
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Input
            type="date"
            label="Date"
            value={selectedDate}
            onChange={handleDateChange}
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Input
            type="number"
            label="Sleep Hours"
            description="Total hours of sleep"
            placeholder="7.5"
            value={dailyContext?.sleepHours}
            onChange={(e) => handleDailyContextChange('sleepHours', e?.target?.value)}
            error={errors?.context_sleepHours}
            required
            min="0"
            max="24"
            step="0.5"
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Select
            label="Sleep Quality"
            description="How well did you sleep?"
            options={sleepQualityOptions}
            value={dailyContext?.sleepQuality}
            onChange={(value) => handleDailyContextChange('sleepQuality', value)}
            error={errors?.context_sleepQuality}
            placeholder="Select quality"
            required
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Input
            type="number"
            label="Caffeine Total (mg)"
            description="Total caffeine consumed (1 cup coffee ≈ 95mg)"
            placeholder="200"
            value={dailyContext?.caffeineTotal}
            onChange={(e) => handleDailyContextChange('caffeineTotal', e?.target?.value)}
            error={errors?.context_caffeineTotal}
            required
            min="0"
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Select
            label="Energy Level"
            description="Overall energy level today"
            options={energyLevelOptions}
            value={dailyContext?.energyLevel}
            onChange={(value) => handleDailyContextChange('energyLevel', value)}
            error={errors?.context_energyLevel}
            placeholder="Select energy level"
            required
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <Input
            type="text"
            label="Mood Tone (Optional)"
            description="How are you feeling today?"
            placeholder="e.g., focused, stressed, motivated"
            value={dailyContext?.moodTone}
            onChange={(e) => handleDailyContextChange('moodTone', e?.target?.value)}
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-3 lg:space-y-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Notes (Optional)
          </label>
          <textarea
            placeholder="Any additional notes about your day..."
            value={dailyContext?.notes}
            onChange={(e) => handleDailyContextChange('notes', e?.target?.value)}
            rows={3}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 resize-none"
          />
        </div>
      </div>
      {/* Work Sessions Section */}
      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
              <Icon name="Briefcase" size={20} color="var(--color-accent)" strokeWidth={2} />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Work Sessions</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSession}
            iconName="Plus"
            iconPosition="left"
          >
            Add Session
          </Button>
        </div>

        {sessions?.map((session, index) => (
          <div key={session?.id} className="p-4 md:p-6 bg-muted/30 rounded-lg border border-border space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base md:text-lg font-medium text-foreground">
                Session {index + 1}
              </h3>
              {sessions?.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSession(session?.id)}
                  iconName="Trash2"
                  className="text-destructive hover:text-destructive"
                />
              )}
            </div>

            <div className="space-y-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={session?.category}
                onChange={(value) => handleSessionChange(session?.id, 'category', value)}
                error={errors?.[`session_${session?.id}_category`]}
                placeholder="Select work category"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Start Time"
                  value={session?.startTime}
                  onChange={(e) => handleSessionChange(session?.id, 'startTime', e?.target?.value)}
                  error={errors?.[`session_${session?.id}_startTime`]}
                  required
                />
                <Input
                  type="time"
                  label="End Time"
                  value={session?.endTime}
                  onChange={(e) => handleSessionChange(session?.id, 'endTime', e?.target?.value)}
                  error={errors?.[`session_${session?.id}_endTime`]}
                  required
                />
              </div>

              <Select
                label="Efficiency (1-5)"
                options={efficiencyOptions}
                value={session?.efficiency}
                onChange={(value) => handleSessionChange(session?.id, 'efficiency', value)}
                error={errors?.[`session_${session?.id}_efficiency`]}
                placeholder="Rate your efficiency"
                required
              />

              <div className="space-y-3 lg:space-y-4">
                <Select
                  label="How did it feel? (Optional)"
                  description="Your mental state during this session"
                  options={feltOptions}
                  value={session?.felt}
                  onChange={(value) => handleSessionChange(session?.id, 'felt', value)}
                  placeholder="Select state"
                  className="transition-all duration-300"
                />
              </div>

              <div className="space-y-3 lg:space-y-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagOptions?.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(session?.id, tag)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                        session?.tags?.includes(tag)
                          ? 'bg-accent text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 lg:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate('/today')}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Log'}
        </Button>
        {errors?.submit && (
          <p className="text-sm text-destructive mt-2 text-center">{errors?.submit}</p>
        )}
      </div>
    </form>
  );
};

export default LogForm;