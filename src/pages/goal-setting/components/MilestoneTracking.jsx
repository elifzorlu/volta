import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const MilestoneTracking = ({ milestones, onToggle, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    targetDate: ''
  });

  const handleAddMilestone = () => {
    if (newMilestone?.title?.trim() && newMilestone?.targetDate) {
      onAdd(newMilestone);
      setNewMilestone({ title: '', targetDate: '' });
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewMilestone({ title: '', targetDate: '' });
    setIsAdding(false);
  };

  const completedCount = milestones?.filter(m => m?.completed)?.length;
  const totalCount = milestones?.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div 
      className="rounded-lg p-6 md:p-8 transition-all duration-300"
      style={{
        backgroundColor: '#0B0B0B',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Flag" size={24} color="var(--color-accent)" strokeWidth={2} />
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Milestone Tracking
          </h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
          >
            <Icon name="Plus" size={16} color="#000" strokeWidth={2} />
            Add Milestone
          </button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-lg font-semibold text-foreground">
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: 'var(--color-accent)'
            }}
          />
        </div>
      </div>

      {/* Add Milestone Form */}
      {isAdding && (
        <div 
          className="mb-6 p-4 rounded-md space-y-4"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
        >
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Milestone Description
            </label>
            <Input
              type="text"
              value={newMilestone?.title}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e?.target?.value }))}
              placeholder="e.g., Achieve 90+ score for 7 consecutive days"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Target Date
            </label>
            <Input
              type="date"
              value={newMilestone?.targetDate}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e?.target?.value }))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddMilestone}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
            >
              Add
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#EDEDED' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Flag" size={48} color="rgba(255, 255, 255, 0.1)" strokeWidth={1} />
            <p className="text-sm text-muted-foreground mt-4">
              No milestones yet. Add your first productivity milestone to start tracking.
            </p>
          </div>
        ) : (
          milestones?.map((milestone) => {
            const targetDate = new Date(milestone?.targetDate);
            const today = new Date();
            const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntil < 0 && !milestone?.completed;

            return (
              <div
                key={milestone?.id}
                className="group p-4 rounded-md transition-all duration-300 hover:bg-white/5"
                style={{ 
                  backgroundColor: milestone?.completed ? 'rgba(57, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                  border: milestone?.completed ? '1px solid rgba(57, 255, 136, 0.2)' : '1px solid transparent'
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={milestone?.completed}
                      onChange={() => onToggle(milestone?.id)}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p 
                      className={`text-base font-medium mb-2 ${
                        milestone?.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {milestone?.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} color="currentColor" strokeWidth={2} />
                        <span>
                          {targetDate?.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      {!milestone?.completed && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: isOverdue ? '#ef4444' : '#3b82f6'
                          }}
                        >
                          {isOverdue 
                            ? `${Math.abs(daysUntil)} days overdue` 
                            : daysUntil === 0 
                            ? 'Due today' 
                            : `${daysUntil} days left`
                          }
                        </span>
                      )}
                      {milestone?.completed && (
                        <span 
                          className="flex items-center gap-1"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <Icon name="CheckCircle" size={14} color="currentColor" strokeWidth={2} />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(milestone?.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-white/10 transition-all"
                    aria-label="Delete milestone"
                  >
                    <Icon name="Trash2" size={16} color="#ef4444" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MilestoneTracking;