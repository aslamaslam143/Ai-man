const STATUS_CONFIG = {
  'Submitted':            { cls: 'status-submitted',           label: 'Submitted' },
  'Needs Review':         { cls: 'status-needs-review',        label: 'Needs Review' },
  'Verified':             { cls: 'status-verified',            label: 'Verified' },
  'Rejected':             { cls: 'status-rejected',            label: 'Rejected' },
  'Needs More Evidence':  { cls: 'status-needs-more-evidence', label: 'Needs More Evidence' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { cls: 'status-submitted', label: status };
  return (
    <span className={`status-badge ${config.cls}`}>
      {config.label}
    </span>
  );
}
