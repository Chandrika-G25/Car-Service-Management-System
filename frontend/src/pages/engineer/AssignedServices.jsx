import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Filter, ArrowRight } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const EngineerAssignedServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await serviceRequestService.getEngineerServices(params);
      setServices(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Assigned Service Tickets</h1>
          <p>Vehicles allocated to your bay for diagnostic evaluation, maintenance, and repair.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter Bay State:</span>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Assigned Jobs</option>
          <option value="ASSIGNED">Assigned (Not Started)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="INSPECTION">Inspection</option>
          <option value="REPAIRING">Repairing</option>
          <option value="TESTING">Testing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <Loading message="Fetching bay jobs..." />
      ) : services.length === 0 ? (
        <div className="card empty-state">
          <Wrench size={40} />
          <h3>No Jobs In This Queue</h3>
          <p>No service workorders match the selected stage filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Scheduled Date</th>
                  <th>Current State</th>
                  <th>Finalized Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{job.request_number}</td>
                    <td>
                      <strong>{job.customer_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{job.customer_phone}</div>
                    </td>
                    <td>
                      <strong>{job.car_details?.brand} {job.car_details?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{job.car_details?.registration_number}</div>
                    </td>
                    <td>{job.category_name}</td>
                    <td>{job.preferred_date}</td>
                    <td><StatusBadge status={job.current_status} /></td>
                    <td style={{ fontWeight: 600 }}>${job.final_cost || job.estimated_cost}</td>
                    <td>
                      <Link to={`/engineer/services/${job.id}`} className="btn btn-sm btn-primary">
                        Open Bay Docket <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerAssignedServices;
