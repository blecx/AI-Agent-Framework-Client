export type DiffLineType = 'add' | 'remove' | 'unchanged';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffView {
  before: string;
  after: string;
  lines?: DiffLine[];
}

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'pending';

export interface ValidationCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message?: string;
  blocking?: boolean;
}

export interface ReviewGateProps {
  diff: DiffView;
  checks: ValidationCheck[];
  onApprove: () => Promise<void>;
  onReject: (reason?: string) => Promise<void>;
  onEdit?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  editLabel?: string;
}
