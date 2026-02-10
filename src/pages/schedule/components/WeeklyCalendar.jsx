import { useState } from 'react';

import Button from '../../../components/ui/Button';
import AddCommitmentModal from './AddCommitmentModal';

const WeeklyCalendar = ({
  commitments,
  onAddCommitment,
  onEditCommitment,
  onDeleteCommitment,
  selectedDay,
  setSelectedDay
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
    '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  const handleAddClick = (day) => {
    setSelectedDay(day);
    setEditingCommitment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (commitment) => {
    setEditingCommitment(commitment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCommitment(null);
    setSelectedDay(null);
  };

  const handleModalSubmit = (commitment) => {
    if (editingCommitment) {
      onEditCommitment(editingCommitment?.id, commitment);
    } else {
      onAddCommitment(commitment);
    }
    handleModalClose();
  };

  const getCommitmentsForDayAndTime = (day, timeSlot) => {
    return commitments?.filter(c => {
      if (c?.day !== day) return false;
      const slotHour = parseInt(timeSlot);
      const startHour = parseInt(c?.startTime?.split(':')?.[0]);
      const endHour = parseInt(c?.endTime?.split(':')?.[0]);
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-medium text-foreground">
          Weekly View
        </h2>
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          onClick={() => handleAddClick(null)}
        >
          Add Commitment
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Days header */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="text-xs text-muted-foreground"></div>
            {daysOfWeek?.map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-foreground py-2 bg-muted/50 rounded-md"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="space-y-1">
            {timeSlots?.map((time, timeIndex) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                <div className="text-xs text-muted-foreground py-2 text-right pr-2">
                  {time}
                </div>
                {daysOfWeek?.map(day => {
                  const dayCommitments = getCommitmentsForDayAndTime(day, time);
                  const hasCommitment = dayCommitments?.length > 0;

                  return (
                    <button
                      key={`${day}-${time}`}
                      onClick={() => hasCommitment ? handleEditClick(dayCommitments?.[0]) : handleAddClick(day)}
                      className={`
                        h-12 rounded border transition-all duration-200
                        ${hasCommitment
                          ? 'bg-accent/20 border-accent/40 hover:bg-accent/30' :'bg-background border-border/40 hover:border-accent/30 hover:bg-muted/50'
                        }
                      `}
                      title={hasCommitment ? dayCommitments?.[0]?.title : 'Add commitment'}
                    >
                      {hasCommitment && (
                        <div className="text-xs text-foreground truncate px-1">
                          {dayCommitments?.[0]?.title}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddCommitmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialData={editingCommitment}
          selectedDay={selectedDay}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;