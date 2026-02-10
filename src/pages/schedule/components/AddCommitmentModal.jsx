import { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AddCommitmentModal = ({ isOpen, onClose, onSubmit, initialData, selectedDay }) => {
  const [formData, setFormData] = useState({
    title: '',
    day: selectedDay || '',
    startTime: '',
    endTime: '',
    type: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (selectedDay) {
      setFormData(prev => ({ ...prev, day: selectedDay }));
    }
  }, [initialData, selectedDay]);

  const dayOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
  ];

  const typeOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'personal', label: 'Personal Time' },
    { value: 'class', label: 'Class/Lecture' },
    { value: 'workout', label: 'Workout' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData?.day) {
      newErrors.day = 'Please select a day';
    }

    if (!formData?.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData?.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData?.startTime && formData?.endTime) {
      const start = parseInt(formData?.startTime?.split(':')?.[0]);
      const end = parseInt(formData?.endTime?.split(':')?.[0]);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData?.type) {
      newErrors.type = 'Please select a commitment type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-primary border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary border-b border-border p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-medium text-foreground">
            {initialData ? 'Edit Commitment' : 'Add Commitment'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <Input
            type="text"
            label="Title"
            placeholder="e.g., Team Meeting"
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            error={errors?.title}
            required
          />

          <Select
            label="Day"
            options={dayOptions}
            value={formData?.day}
            onChange={(value) => handleInputChange('day', value)}
            error={errors?.day}
            placeholder="Select day"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Start Time"
              value={formData?.startTime}
              onChange={(e) => handleInputChange('startTime', e?.target?.value)}
              error={errors?.startTime}
              required
            />

            <Input
              type="time"
              label="End Time"
              value={formData?.endTime}
              onChange={(e) => handleInputChange('endTime', e?.target?.value)}
              error={errors?.endTime}
              required
            />
          </div>

          <Select
            label="Type"
            options={typeOptions}
            value={formData?.type}
            onChange={(value) => handleInputChange('type', value)}
            error={errors?.type}
            placeholder="Select type"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1"
            >
              {initialData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommitmentModal;