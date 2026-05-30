import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function ScoreRingMini({ score }) {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="56" height="56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

export default function ClaimCard({ claim }) {
  const navigate = useNavigate();
  const date = claim.createdAt
    ? new Date(claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="claim-card" onClick={() => navigate(`/claim/${claim._id}`)}>
      <div className="claim-card-header">
        <h3 className="claim-card-title">{claim.title}</h3>
        <ScoreRingMini score={claim.knowledgeValueScore || 0} />
      </div>

      <div className="claim-card-meta">
        <StatusBadge status={claim.status} />
        <span className="category-pill">{claim.category}</span>
      </div>

      <p className="claim-card-desc">{claim.description}</p>

      {claim.riskFlags && claim.riskFlags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
          {claim.riskFlags.slice(0, 2).map((flag) => (
            <span key={flag} className="risk-flag">⚠ {flag}</span>
          ))}
          {claim.riskFlags.length > 2 && (
            <span className="risk-flag">+{claim.riskFlags.length - 2} more</span>
          )}
        </div>
      )}

      <div className="claim-card-footer">
        <span className="contributor-text">👤 {claim.contributorName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="claim-score-pill">
            ⚡ {claim.confidenceLevel || 'Low Confidence'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{date}</span>
        </div>
      </div>
    </div>
  );
}
