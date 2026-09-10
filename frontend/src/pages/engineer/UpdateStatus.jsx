import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Wrench, ArrowRight } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const EngineerUpdateStatus = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await serviceRequestService.getEngineerServices();
        const activeOnly = (res.results || res).filter((j) => j.current_status !== 'COMPLETED' && j.current_status !== 'CANCELLED');
        setJobs(activeOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <Loading message="Loading active workorders..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Active Workorders Status Desk</h1>
          <p>Quickly advance vehicle diagnostic stages and update client progress.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card empty-state">
          <CheckCircle size={40} color="var(--success)" />
          <h3>All Workorders Completed</h3>
          <p>No active bay tickets currently need status updates.</p>
          <Link to="/engineer/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{job.request_number}</span>
                  <StatusBadge status={job.current_status} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                  {job.car_details?.brand} {job.car_details?.model}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Plate: {job.car_details?.registration_number}
                </span>

                <div style={{ margin: '1rem 0', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <strong>Service:</strong> {job.category_name}<br />
                  <strong>Customer:</strong> {job.customer_name} ({job.customer_phone})
                </div>
              </div>

              <Link to={`/engineer/services/${job.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                <CheckCircle size={16} /> Advance Stage / Add Notes
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngineerUpdateStatus;
