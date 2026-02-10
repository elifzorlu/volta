import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ResetDataModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleteProfile, setDeleteProfile] = useState(false);

  if (!isOpen) return null;

  const isConfirmValid = confirmText === 'RESET';

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm?.(deleteProfile);
      setConfirmText('');
      setDeleteProfile(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setDeleteProfile(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#0A0A0A] border border-[rgba(255,68,68,0.3)] rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[rgba(255,68,68,0.1)]">
            <Icon name="AlertTriangle" size={24} color="#FF4444" />
          </div>
          <h2 className="text-xl font-semibold text-[#FF4444]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Reset Your Data
          </h2>
        </div>

        {/* Warning Message */}
        <div className="mb-6">
          <p className="text-sm text-[rgba(237,237,237,0.8)] mb-4">
            This will permanently delete:
          </p>
          <ul className="text-sm text-[rgba(237,237,237,0.7)] space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <Icon name="X" size={14} color="#FF4444" className="mt-0.5" />
              <span>All work sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="X" size={14} color="#FF4444" className="mt-0.5" />
              <span>Daily logs and brain check-ins</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="X" size={14} color="#FF4444" className="mt-0.5" />
              <span>Commitments and schedules</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="X" size={14} color="#FF4444" className="mt-0.5" />
              <span>Recommendations and predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="X" size={14} color="#FF4444" className="mt-0.5" />
              <span>Evolution badges</span>
            </li>
          </ul>
          <p className="text-xs text-[rgba(237,237,237,0.6)] italic">
            Your profile (display name, timezone) will be kept unless you choose to delete it below.
          </p>
        </div>

        {/* Delete Profile Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteProfile}
              onChange={(e) => setDeleteProfile(e?.target?.checked)}
              className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent text-[#FF4444] focus:ring-[#FF4444] focus:ring-offset-0"
            />
            <span className="text-sm text-[rgba(237,237,237,0.8)]">
              Also delete my profile (display name, timezone)
            </span>
          </label>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[rgba(237,237,237,0.8)]">
            Type <span className="font-bold text-[#FF4444]">RESET</span> to confirm
          </label>
          <Input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e?.target?.value)}
            placeholder="Type RESET"
            className="w-full"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-transparent border border-[rgba(255,255,255,0.1)] text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmValid || loading}
            loading={loading}
            className="flex-1 bg-[#FF4444] text-white hover:bg-[#FF4444]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetDataModal;