import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ClaimCard from '../components/ClaimCard';

const STATUSES = ['All', 'Submitted', 'Needs Review', 'Verified', 'Rejected', 'Needs More Evidence'];

export default function UserDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const filtered = claims.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.contributorName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const StatCard = ({ icon, value, label, color = 'var(--primary)' }) => (
    <div className="stats-card">
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-value" style={{ color }}>{value}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header">
        <h1>Knowledge Dashboard</h1>
        <p>Track your submitted claims, scores, and reviewer feedback</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <StatCard icon="📝" value={stats.total} label="Total Claims" color="var(--primary-light)" />
          <StatCard icon="✅" value={stats.verified} label="Verified" color="var(--success)" />
          <StatCard icon="⏳" value={stats.pending} label="Submitted" color="var(--info)" />
          <StatCard icon="⚡" value={stats.averageScore} label="Avg Score" color="var(--warning)" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search claims..."
          style={{ maxWidth: '280px' }}
        />
        <div className="filter-bar" style={{ margin: 0 }}>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`filter-pill${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Claims grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No claims found</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {claims.length === 0 ? "You haven't submitted any knowledge claims yet." : "No claims match the selected filters."}
          </p>
          <Link to="/submit" className="btn btn-primary">✍️ Submit First Claim</Link>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Showing {filtered.length} of {claims.length} claims
          </p>
          <div className="claims-grid">
            {filtered.map(claim => (
              <ClaimCard key={claim._id} claim={claim} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
