import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['All', 'Submitted', 'Needs Review', 'Verified', 'Rejected', 'Needs More Evidence'];
const CATEGORIES = ['All', 'Field Observation', 'Local Knowledge', 'AI Correction', 'Expert Knowledge', 'Infrastructure Issue', 'Environment/Climate Observation', 'Creative Idea', 'Other'];
const AI_CLASSIFICATIONS = [
  'Useful for AI Training',
  'Useful for AI Evaluation',
  'Useful for Knowledge Base',
  'Useful for Hallucination Correction',
  'Not Suitable',
];

function ReviewModal({ claim, onClose, onSave }) {
  const [form, setForm] = useState({
    status: claim.status,
    reviewerFeedback: claim.reviewerFeedback || '',
    reviewerScore: claim.reviewerScore || 0,
    aiUsefulnessClassification: claim.aiUsefulnessClassification || 'Unclassified',
  });
  const [saving, setSaving] = useState(false);

  const handleQuick = (status) => setForm(f => ({ ...f, status }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(claim._id, form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          🛡️ Review Claim
        </h2>

        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{claim.title}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>by {claim.contributorName} · Score: {claim.knowledgeValueScore}/100</p>

        {/* Quick Actions */}
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>QUICK STATUS</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button className={`btn btn-sm ${form.status === 'Verified' ? 'btn-success' : 'btn-secondary'}`} onClick={() => handleQuick('Verified')}>✅ Verify</button>
          <button className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => handleQuick('Rejected')}>❌ Reject</button>
          <button className={`btn btn-sm ${form.status === 'Needs Review' ? 'btn-warning' : 'btn-secondary'}`} onClick={() => handleQuick('Needs Review')}>🔍 Needs Review</button>
          <button className={`btn btn-sm ${form.status === 'Needs More Evidence' ? '' : 'btn-secondary'}`} style={form.status === 'Needs More Evidence' ? { background: '#7c3aed', color: '#fff' } : {}} onClick={() => handleQuick('Needs More Evidence')}>📋 More Evidence</button>
        </div>

        <div className="form-group">
          <label className="form-label">AI Usefulness Classification</label>
          <select className="form-select" value={form.aiUsefulnessClassification} onChange={e => setForm(f => ({ ...f, aiUsefulnessClassification: e.target.value }))}>
            <option value="Unclassified">Unclassified</option>
            {AI_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Reviewer Score (0-10)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range" min="0" max="10" value={form.reviewerScore}
              onChange={e => setForm(f => ({ ...f, reviewerScore: Number(e.target.value) }))}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: 700, color: 'var(--primary-light)', minWidth: '24px' }}>{form.reviewerScore}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reviewer Feedback</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.reviewerFeedback}
            onChange={e => setForm(f => ({ ...f, reviewerFeedback: e.target.value }))}
            placeholder="Add your reviewer comments and feedback..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        axios.get('/api/claims'),
        axios.get('/api/claims/stats/overview'),
      ]);
      setClaims(claimsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id, data) => {
    const res = await axios.patch(`/api/claims/${id}`, data);
    setClaims(prev => prev.map(c => c._id === id ? res.data : c));
    showToast('✅ Claim updated successfully');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this claim permanently?')) return;
    await axios.delete(`/api/claims/${id}`);
    setClaims(prev => prev.filter(c => c._id !== id));
    showToast('🗑️ Claim deleted');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = claims.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchCat = catFilter === 'All' || c.category === catFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.contributorName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '1.5rem', zIndex: 3000,
          background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--success)', padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-lg)', animation: 'fadeInUp 0.3s ease',
          fontWeight: 600, fontSize: '0.875rem',
        }}>{toast}</div>
      )}

      <div className="page-header">
        <h1>Reviewer Dashboard</h1>
        <p>Validate knowledge claims, classify AI usefulness, and provide expert feedback</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '📋', v: stats.total, l: 'Total Claims', c: 'var(--text-primary)' },
            { icon: '⏳', v: stats.pending, l: 'Submitted', c: 'var(--info)' },
            { icon: '🔍', v: stats.needsReview, l: 'Needs Review', c: 'var(--warning)' },
            { icon: '✅', v: stats.verified, l: 'Verified', c: 'var(--success)' },
            { icon: '❌', v: stats.rejected, l: 'Rejected', c: 'var(--error)' },
            { icon: '⚡', v: stats.averageScore, l: 'Avg Score', c: 'var(--primary-light)' },
          ].map(s => (
            <div key={s.l} className="stats-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by title or contributor..."
          style={{ maxWidth: '280px' }}
        />
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ maxWidth: '230px' }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {filtered.length} claim{filtered.length !== 1 ? 's' : ''} shown
      </p>

      {/* Claims Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No claims found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(claim => (
            <div key={claim._id} style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{claim.title}</span>
                  <StatusBadge status={claim.status} />
                  <span className="category-pill">{claim.category}</span>
                  <span className="claim-score-pill">⚡ {claim.knowledgeValueScore}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>👤 {claim.contributorName}</span>
                  {claim.location && <span>📍 {claim.location}</span>}
                  <span>🏷️ {claim.aiUsefulnessClassification}</span>
                  <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                </div>
                {claim.riskFlags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {claim.riskFlags.map(f => <span key={f} className="risk-flag">⚠ {f}</span>)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/claim/${claim._id}`)}>
                  👁 View
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setReviewing(claim)}>
                  🛡️ Review
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(claim._id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewModal
          claim={reviewing}
          onClose={() => setReviewing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
