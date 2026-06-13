import {
  CertificateStatus,
  ComplaintStatus,
  RectificationStatus,
  StallStatus,
  certificateStatusNames,
  complaintStatusNames,
  rectificationStatusNames,
  stallStatusNames,
} from '@/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: CertificateStatus | ComplaintStatus | RectificationStatus | StallStatus;
  type?: 'certificate' | 'complaint' | 'rectification' | 'stall';
  size?: 'sm' | 'md';
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700 border-warning-200',
  approved: 'bg-success-100 text-success-700 border-success-200',
  rejected: 'bg-danger-100 text-danger-700 border-danger-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  processing: 'bg-primary-100 text-primary-700 border-primary-200',
  resolved: 'bg-success-100 text-success-700 border-success-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
  in_progress: 'bg-warning-100 text-warning-700 border-warning-200',
  completed: 'bg-primary-100 text-primary-700 border-primary-200',
  verified: 'bg-success-100 text-success-700 border-success-200',
  active: 'bg-success-100 text-success-700 border-success-200',
  suspended: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StatusTag({
  status,
  type = 'certificate',
  size = 'md',
}: StatusTagProps) {
  const getStatusText = () => {
    switch (type) {
      case 'certificate':
        return certificateStatusNames[status as CertificateStatus];
      case 'complaint':
        return complaintStatusNames[status as ComplaintStatus];
      case 'rectification':
        return rectificationStatusNames[status as RectificationStatus];
      case 'stall':
        return stallStatusNames[status as StallStatus];
      default:
        return status;
    }
  };

  const colorClass = statusColorMap[status] || 'bg-gray-100 text-gray-600';

  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-medium',
        colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'pending' || status === 'in_progress' || status === 'processing'
            ? 'bg-current animate-pulse'
            : 'bg-current'
        )}
      />
      {getStatusText()}
    </span>
  );
}
