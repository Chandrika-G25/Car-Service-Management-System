import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle, AlertCircle, ArrowRight, User, Car } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const EngineerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await adminService.getEngineerAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading message="Opening technician bay console..." />;

  const kpis = analytics?.kpis || {};
  const activeJobs = analytics?.active_jobs || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Technician Bay: {user?.full_name}</h1>
          <p>
            Employee ID: <strong>{user?.engineer_profile?.employee_id || 'ENG'}</strong> • {user?.engineer_profile?.specialization || 'Master Diagnostic Tech'}
          </p>
        </div>
        <Link to="/engineer/services" className="btn btn-primary">
          <Wrench size={16} /> View Assigned Jobs
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.assigned_jobs || 0}</h3>
            <p>Assigned Awaiting Start</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Wrench size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.in_progress_jobs || 0}</h3>
            <p>In Progress / Diagnostic</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.completed_today || 0}</h3>
            <p>Completed Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.total_completed || 0}</h3>
            <p>Career Completed Jobs</p>
          </div>
        </div>
      </div>

      {/* Active Service Bay Jobs Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>Current Assigned Bay Workorders</h3>
          <Link to="/engineer/services" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View Full Queue →
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={40} color="var(--success)" />
            <h4>Service Bay Clear</h4>
            <p>You currently have zero pending vehicles waiting in your bay queue.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Vehicle Spec</th>
                  <th>Service Type</th>
                  <th>Booking Slot</th>
                  <th>Current State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{job.request_number}</td>
                    <td>
                      <strong>{job.customer_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{job.customer_phone}</div>
                    </td>
                    <td>
                      <strong>{job.car_details?.brand} {job.car_details?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Plate: {job.car_details?.registration_number}</div>
                    </td>
                    <td>{job.category_name}</td>
                    <td>{job.preferred_date} ({job.preferred_time})</td>
                    <td><StatusBadge status={job.current_status} /></td>
                    <td>
                      <Link to={`/engineer/services/${job.id}`} className="btn btn-sm btn-primary">
                        Update Job <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerDashboard;
