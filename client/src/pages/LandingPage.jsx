import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const PROBLEMS = [
  { icon: '🌀', title: 'Hallucinations', desc: 'AI models fabricate facts with confident tone, misleading users with plausible-sounding falsehoods.' },
  { icon: '⏱️', title: 'Outdated Info', desc: 'Training data cutoffs mean AI systems miss critical recent events, policy changes, and discoveries.' },
  { icon: '📍', title: 'Missing Local Context', desc: 'Global AI models lack granular local knowledge — community-specific facts are invisible to them.' },
  { icon: '🔬', title: 'Unverified Assumptions', desc: 'AI confidently applies generalizations where domain-specific expertise is required.' },
  { icon: '🔗', title: 'No Correction Loop', desc: 'There is currently no simple mechanism for humans to flag and correct AI errors at scale.' },
];

const STEPS = [
  {
    num: '01',
    icon: '✍️',
    title: 'Submit Knowledge',
    desc: 'Contributors submit structured claims — field observations, AI corrections, expert insights, local knowledge, and more.',
    color: '#6366f1',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Evaluate & Score',
    desc: 'Our scoring engine evaluates submission quality across 6 dimensions: description depth, evidence, location, date, usefulness, and category.',
    color: '#8b5cf6',
  },
  {
    num: '03',
    icon: '✅',
    title: 'Human Validation',
    desc: 'Expert reviewers approve, reject, or request more evidence — ensuring human oversight before knowledge enters AI systems.',
    color: '#10b981',
  },
];

const FEATURES = [
  { icon: '📝', title: 'Structured Submissions', desc: '8 claim categories with guided metadata fields ensure every contribution is rich and actionable.', color: '#6366f1' },
  { icon: '🔢', title: 'Value Scoring Engine', desc: 'Rule-based scoring instantly evaluates quality and generates confidence levels for each claim.', color: '#8b5cf6' },
  { icon: '🛡️', title: 'Reviewer Dashboard', desc: 'Dedicated admin panel for claim validation, AI usefulness classification, and feedback loop.', color: '#10b981' },
  { icon: '🤖', title: 'AI Usefulness Tags', desc: 'Classify verified knowledge for AI Training, Evaluation, Knowledge Base, or Hallucination Correction.', color: '#f59e0b' },
  { icon: '⚠️', title: 'Risk Indicators', desc: 'Automatic detection of weak submissions: missing evidence, low detail, incomplete metadata.', color: '#ef4444' },
];

function CounterCard({ value, label, icon }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const target = parseInt(value) || 0;
        let current = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          setDisplay(current);
          if (current >= target) clearInterval(timer);
        }, 30);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{
      textAlign: 'center',
      padding: '1.5rem',
      background: 'rgba(99,102,241,0.06)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2.5rem',
        fontWeight: 800,
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>{display}+</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

// Animated orb background
function CosmicBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Grid lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      {/* Orb 1 */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      {/* Orb 2 */}
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        animation: 'float 12s ease-in-out infinite reverse',
      }} />
      {/* Orb 3 */}
      <div style={{
        position: 'absolute', top: '40%', left: '40%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        animation: 'float 15s ease-in-out infinite',
      }} />
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

  useEffect(() => {
    axios.get('/api/claims/stats/overview')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 0',
        overflow: 'hidden',
      }}>
        <CosmicBackground />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1.2rem',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-light)',
            }}>
              🚀 Human-in-the-Loop AI Knowledge Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            Validate the Knowledge<br />
            <span className="gradient-text">AI Gets Wrong</span>
          </h1>

          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '620px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            AIMan Knowledge Commons is a collaborative platform where humans submit, validate, and improve knowledge for AI systems — fighting hallucinations, outdated information, and missing context.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <Link to="/submit" className="btn btn-primary btn-lg">
              ✍️ Submit Knowledge Claim
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              📊 View Dashboard
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid-3" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <CounterCard value={stats.total || 128} label="Claims Submitted" icon="📝" />
            <CounterCard value={stats.verified || 74} label="Verified Claims" icon="✅" />
            <CounterCard value={stats.pending || 23} label="Pending Review" icon="⏳" />
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="section" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              The Problem with AI Knowledge
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
              Modern AI models excel at many tasks, but they fundamentally lack real-world grounding, human verification, and correction mechanisms.
            </p>
          </div>
          <div className="grid-3" style={{ gap: '1rem' }}>
            {PROBLEMS.map((p) => (
              <div key={p.title} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Three simple steps from raw insight to verified AI knowledge</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'flex-start',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${step.color}30`,
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = step.color + '60'}
              onMouseLeave={e => e.currentTarget.style.borderColor = step.color + '30'}
              >
                <div style={{
                  minWidth: '64px', height: '64px',
                  background: `${step.color}20`,
                  border: `2px solid ${step.color}40`,
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step.color, letterSpacing: '0.1em', marginBottom: '0.35rem' }}>STEP {step.num}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-20px', right: '-20px',
                  width: '80px', height: '80px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: step.color,
                  opacity: 0.06,
                  lineHeight: 1,
                }}>{step.num}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              Platform Features
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything needed to build trustworthy AI knowledge infrastructure</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}35`,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.12) 50%, rgba(236,72,153,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1rem',
            }}>
              Help Build Better AI Systems
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              maxWidth: '540px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}>
              Your real-world knowledge can make AI systems more accurate, reliable, and trustworthy. Every contribution matters.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/submit" className="btn btn-primary btn-lg">
                ✍️ Submit Your First Claim
              </Link>
              <Link to="/reviewer" className="btn btn-secondary btn-lg">
                🛡️ Become a Reviewer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        background: 'rgba(2,6,23,0.8)',
      }}>
        <div className="container">
          <p>© 2026 AIMan Knowledge Commons · Human Validation Infrastructure for AI Knowledge</p>
        </div>
      </footer>
    </div>
  );
}
