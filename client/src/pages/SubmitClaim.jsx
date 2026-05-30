import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Field Observation',
  'Local Knowledge',
  'AI Correction',
  'Expert Knowledge',
  'Infrastructure Issue',
  'Environment/Climate Observation',
  'Creative Idea',
  'Other',
];

const EXPERT_CATS = ['Expert Knowledge', 'AI Correction'];

function previewScore(form) {
  let score = 0;
  const flags = [];
  if (form.description && form.description.trim().length > 100) score += 20;
  else flags.push('Low Detail');
  if (form.evidenceLink && form.evidenceLink.trim()) score += 25;
  else flags.push('Missing Evidence');
  if (form.location && form.location.trim()) score += 10;
  else flags.push('No Location');
  if (form.date) score += 10;
  else flags.push('No Date');
  if (form.usefulnessExplanation && form.usefulnessExplanation.trim().length > 50) score += 20;
  else flags.push('Weak Usefulness Explanation');
  if (EXPERT_CATS.includes(form.category)) score += 15;
  return { score: Math.min(score, 100), flags };
}

function ScorePreview({ score, flags }) {
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const confidence = score >= 70 ? 'High Confidence' : score >= 40 ? 'Medium Confidence' : 'Low Confidence';
  let aiUsage = score >= 80 ? 'Useful for AI Training' : score >= 60 ? 'Useful for Knowledge Base' : score >= 40 ? 'Useful for AI Evaluation' : 'Needs More Evidence';

  return (
    <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: 'calc(var(--navbar-h) + 1rem)' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        ⚡ Live Score Preview
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg width="130" height="130">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
          <text x="65" y="58" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="Sora">{score}</text>
          <text x="65" y="75" textAnchor="middle" fill="#64748b" fontSize="11">/ 100</text>
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.3rem 0.9rem',
          background: `${color}18`,
          border: `1px solid ${color}40`,
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color,
          marginBottom: '0.5rem',
        }}>{confidence}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{aiUsage}</div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
          SCORING FACTORS
        </p>
        {[
          { label: 'Detailed Description', pts: 20 },
          { label: 'Evidence Attached', pts: 25 },
          { label: 'Location Provided', pts: 10 },
          { label: 'Date Provided', pts: 10 },
          { label: 'Usefulness Explanation', pts: 20 },
          { label: 'Expert Category', pts: 15 },
        ].map((f) => {
          const earned = !flags.some(flag =>
            (f.label.includes('Descrip') && flag === 'Low Detail') ||
            (f.label.includes('Evidence') && flag === 'Missing Evidence') ||
            (f.label.includes('Location') && flag === 'No Location') ||
            (f.label.includes('Date') && flag === 'No Date') ||
            (f.label.includes('Usefulness') && flag === 'Weak Usefulness Explanation') ||
            (f.label.includes('Expert') && !EXPERT_CATS.includes(''))
          );
          return (
            <div key={f.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.4rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: '0.78rem',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>+{f.pts}</span>
            </div>
          );
        })}
      </div>

      {flags.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>RISK FLAGS</p>
          {flags.map(flag => (
            <div key={flag} className="risk-flag" style={{ marginBottom: '0.4rem', display: 'flex' }}>
              ⚠ {flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const INITIAL_FORM = {
  title: '',
  category: '',
  description: '',
  usefulnessExplanation: '',
  evidenceLink: '',
  location: '',
  date: '',
  contributorName: '',
  consentGiven: false,
};

export default function SubmitClaim() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const { score, flags } = previewScore(form);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.consentGiven) {
      setError('Please provide your consent to submit a knowledge claim.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/claims', form);
      setSubmitted(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '640px', margin: '0 auto' }}>
        <div className="success-banner">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2>Claim Submitted Successfully!</h2>
          <p style={{ marginBottom: '1rem' }}>Your knowledge claim has been received and is pending review.</p>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.2rem',
            background: 'rgba(99,102,241,0.12)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: 'var(--primary-light)',
            marginBottom: '1.5rem',
          }}>
            Knowledge Value Score: <strong>{submitted.knowledgeValueScore}/100</strong> · {submitted.confidenceLevel}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/claim/${submitted._id}`)}>
              View Claim
            </button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(null); setForm(INITIAL_FORM); }}>
              Submit Another
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header">
        <h1>Submit Knowledge Claim</h1>
        <p>Contribute your real-world knowledge to improve AI systems</p>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>⚠ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Section: Basic Info */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
              📋 Basic Information
            </h2>
            <div className="form-group">
              <label className="form-label">Claim Title <span className="form-required">*</span></label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} required placeholder="Brief, descriptive title for your claim" />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span className="form-required">*</span></label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Description <span className="form-required">*</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  ({form.description.length} chars — aim for 100+ for full score)
                </span>
              </label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your knowledge claim in detail. What did you observe? What is the issue? The more detail, the better."
              />
            </div>
          </div>

          {/* Section: Usefulness */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
              🤖 AI Usefulness
            </h2>
            <div className="form-group">
              <label className="form-label">
                Why is this useful for AI? <span className="form-required">*</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  (50+ chars for full score)
                </span>
              </label>
              <textarea
                className="form-textarea"
                name="usefulnessExplanation"
                value={form.usefulnessExplanation}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Explain how this knowledge can help AI systems be more accurate, reduce hallucinations, or fill knowledge gaps."
              />
            </div>
          </div>

          {/* Section: Evidence & Metadata */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
              🔍 Evidence & Metadata
            </h2>
            <div className="form-group">
              <label className="form-label">Evidence Link <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>+25 points</span></label>
              <input
                className="form-input"
                name="evidenceLink"
                value={form.evidenceLink}
                onChange={handleChange}
                placeholder="https://... (article, report, image, video, or document URL)"
                type="url"
              />
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Location <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>+10 points</span></label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="City, Region, Country" />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Observation <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>+10 points</span></label>
                <input className="form-input" name="date" value={form.date} onChange={handleChange} type="date" />
              </div>
            </div>
          </div>

          {/* Section: Contributor */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
              👤 Contributor Details
            </h2>
            <div className="form-group">
              <label className="form-label">Your Name <span className="form-required">*</span></label>
              <input className="form-input" name="contributorName" value={form.contributorName} onChange={handleChange} required placeholder="Full name or username" />
            </div>
            <div className="form-group">
              <label className="form-checkbox-wrapper">
                <input className="form-checkbox" type="checkbox" name="consentGiven" checked={form.consentGiven} onChange={handleChange} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  I consent to this knowledge being used for AI training and evaluation purposes, and confirm the information is accurate to the best of my knowledge.
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? '⏳ Submitting...' : '🚀 Submit Knowledge Claim'}
          </button>
        </form>

        {/* Preview */}
        <ScorePreview score={score} flags={flags} />
      </div>
    </div>
  );
}
