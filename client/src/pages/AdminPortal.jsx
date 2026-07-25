// src/pages/AdminPortal.jsx
// Admin Moderation & Governance Portal

import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Users, CheckCircle, Flag, AlertTriangle, Check, X } from 'lucide-react';

export default function AdminPortal() {
  const [stats, setStats]       = useState(null);
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/admin/stats?demo=true'),
        api.get('/admin/reports?demo=true'),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
    } catch {
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.post('/admin/resolve-report?demo=true', { reportId, action });
      toast.success(`Report ${action}ed!`);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '5rem' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <Shield size={20} color="var(--color-primary2)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary2)', textTransform: 'uppercase' }}>Governance Portal</span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Platform Administration</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem' }}>Monitor system stats, review safety reports, and manage platform health.</p>
          </div>
          <span className="badge badge-agreed" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>Admin Access Verified</span>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--color-primary2)' }}>
                <Users size={22} />
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-secondary)' }}>
                <CheckCircle size={22} />
              </div>
              <div className="stat-label">Total Matches</div>
              <div className="stat-value">{stats.totalMatches}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                <CheckCircle size={22} />
              </div>
              <div className="stat-label">Completed Swaps</div>
              <div className="stat-value">{stats.completedMatches}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
                <Flag size={22} />
              </div>
              <div className="stat-label">Pending Reports</div>
              <div className="stat-value">{stats.pendingReports}</div>
            </div>
          </div>
        )}

        {/* Pending Reports Moderation Table */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--color-warning)" /> Trust & Safety Reports Queue
          </h2>

          {reports.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', padding: '1.5rem 0', textAlign: 'center' }}>
              🎉 No pending reports! Platform community safety is 100% clean.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Reported User</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reported By</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{report.reportedUser?.name || 'Unknown'}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{report.reportedBy?.name || 'Anonymous'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-muted)' }}>{report.reason}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleResolveReport(report._id, 'warn')} style={{ color: '#10b981' }}>
                            <Check size={14} /> Resolve
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleResolveReport(report._id, 'dismiss')} style={{ color: 'var(--color-muted)' }}>
                            <X size={14} /> Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recently Registered Users */}
        {stats?.recentUsers && (
          <div className="glass" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--color-primary2)" /> Recent User Registrations
            </h2>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              {stats.recentUsers.map((u) => (
                <div key={u._id} style={{ padding: '1rem', background: 'var(--color-surface2)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary2)', fontWeight: 600 }}>
                    {u.skillsOffered?.length || 0} offered · {u.skillsWanted?.length || 0} wanted
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
