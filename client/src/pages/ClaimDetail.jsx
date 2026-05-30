import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

function ScoreArc({ score }) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="170" height="170">
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="85" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        <circle
          cx="85" cy="85" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 85 85)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="85" y="78" textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="800" fontFamily="Sora">{score}</text>
        <text x="85" y="98" textAnchor="middle" fill="#64748b" fontSize="13">/ 100</text>
      </svg>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Knowledge Value Score</span>
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '0.85rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '1rem', width: '22px', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: highlight || 'var(--text-primary)', lineHeight: 1.6 }}>{value}</div>
      </div>
    </div>
  );
}

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    status: '',
    reviewerFeedback: '',
    reviewerScore: 0,
    aiUsefulnessClassification: 'Unclassified',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/claims/${id}`);
      setClaim(res.data);
      setReviewForm({
        status: res.data.status,
        reviewerFeedback: res.data.reviewerFeedback || '',
        reviewerScore: res.data.reviewerScore || 0,
        aiUsefulnessClassification: res.data.aiUsefulnessClassification || 'Unclassified',
      });
    } catch {
      setError('Claim not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch(`/api/claims/${id}`, reviewForm);
      setClaim(res.data);
      alert('✅ Review saved successfully!');
    } catch {
      alert('Failed to save review.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '6rem' }}><div className="spinner" /></div>;
  if (error) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <h2 style={{ marginBottom: '0.5rem' }}>{error}</h2>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const scoreColor = claim.knowledgeValueScore >= 70 ? '#10b981' : claim.knowledgeValueScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-secondary)' }}>Claim Detail</span>
      </div>

      {/* Header */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              marginBottom: '0.75rem',
              lineHeight: 1.3,
            }}>{claim.title}</h1>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={claim.status} />
              <span className="category-pill">{claim.category}</span>
              {claim.confidenceLevel && (
                <span style={{
                  padding: '0.25rem 0.65rem',
                  background: `${scoreColor}15`,
                  border: `1px solid ${scoreColor}30`,
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: scoreColor,
                }}>{claim.confidenceLevel}</span>
              )}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>👤 {claim.contributorName}</span>
          {claim.location && <span>📍 {claim.location}</span>}
          {claim.date && <span>📅 {new Date(claim.date).toLocaleDateString()}</span>}
          <span>🕐 Submitted {new Date(claim.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="detail-page-layout">

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Claim Details */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.25rem' }}>📋 Claim Details</h2>
            <InfoRow icon="📝" label="DESCRIPTION" value={claim.description} />
            <InfoRow icon="🤖" label="WHY IS THIS USEFUL FOR AI?" value={claim.usefulnessExplanation} highlight="var(--text-primary)" />
            {claim.evidenceLink && (
              <div style={{ padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', width: '22px' }}>🔗</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>EVIDENCE LINK</div>
                    <a href={claim.evidenceLink} target="_blank" rel="noopener noreferrer" style={{
                      color: 'var(--primary-light)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                    }}>
                      {claim.evidenceLink} ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
            <InfoRow icon="🏷️" label="SUGGESTED AI USAGE" value={claim.suggestedAIUsage} highlight="var(--secondary)" />
            <InfoRow icon="🏆" label="AI USEFULNESS CLASSIFICATION" value={claim.aiUsefulnessClassification !== 'Unclassified' ? claim.aiUsefulnessClassification : null} highlight="var(--success)" />
          </div>

          {/* Risk Flags */}
          {claim.riskFlags && claim.riskFlags.length > 0 && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--error)', marginBottom: '1rem' }}>⚠️ Risk Indicators</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {claim.riskFlags.map(flag => (
                  <div key={flag} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    background: 'var(--error-bg)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: '#fca5a5',
                  }}>
                    <span>⚠️</span> {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Feedback */}
          {claim.reviewerFeedback && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.75rem' }}>💬 Reviewer Feedback</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{claim.reviewerFeedback}</p>
              {claim.reviewerScore > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  marginTop: '0.75rem', padding: '0.3rem 0.8rem',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--primary-light)',
                }}>
                  🏆 Reviewer Score: <strong>{claim.reviewerScore}/10</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column — Score & Review Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 'calc(var(--navbar-h) + 1rem)' }}>

          {/* Score Card */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <ScoreArc score={claim.knowledgeValueScore || 0} />
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COMPLETENESS</div>
              <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${claim.completenessScore || 0}%`,
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s ease',
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {claim.completenessScore || 0}% complete
              </div>
            </div>
          </div>

          {/* Reviewer Action Panel */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary-light)' }}>🛡️ Reviewer Actions</h2>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Verified', 'Rejected', 'Needs Review', 'Needs More Evidence'].map(s => (
                  <button
                    key={s}
                    className={`btn btn-sm ${reviewForm.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReviewForm(f => ({ ...f, status: s }))}
                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
                  >
                    {s === 'Verified' ? '✅' : s === 'Rejected' ? '❌' : s === 'Needs Review' ? '🔍' : '📋'} {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">AI Classification</label>
              <select
                className="form-select"
                value={reviewForm.aiUsefulnessClassification}
                onChange={e => setReviewForm(f => ({ ...f, aiUsefulnessClassification: e.target.value }))}
                style={{ fontSize: '0.82rem' }}
              >
                <option value="Unclassified">Unclassified</option>
                {['Useful for AI Training', 'Useful for AI Evaluation', 'Useful for Knowledge Base', 'Useful for Hallucination Correction', 'Not Suitable'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reviewer Score: {reviewForm.reviewerScore}/10</label>
              <input
                type="range" min="0" max="10"
                value={reviewForm.reviewerScore}
                onChange={e => setReviewForm(f => ({ ...f, reviewerScore: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Feedback</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={reviewForm.reviewerFeedback}
                onChange={e => setReviewForm(f => ({ ...f, reviewerFeedback: e.target.value }))}
                placeholder="Add reviewer comments..."
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReviewSave} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
