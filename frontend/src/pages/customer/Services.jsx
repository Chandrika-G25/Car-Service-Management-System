import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Filter, CalendarPlus, ArrowRight } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const CustomerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await serviceRequestService.getRequests(params);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Service Requests</h1>
          <p>Track progress, view technician remarks, and check diagnostic invoices.</p>
        </div>
        <Link to="/customer/services/book" className="btn btn-primary">
          <CalendarPlus size={16} /> Book New Service
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search request number or car license plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="INSPECTION">Inspection</option>
              <option value="REPAIRING">Repairing</option>
              <option value="TESTING">Testing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Fetching service records..." />
      ) : services.length === 0 ? (
        <div className="card empty-state">
          <Wrench size={40} />
          <h3>No Service Records Found</h3>
          <p>There are no service requests matching your criteria.</p>
          <Link to="/customer/services/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Book a Service Slot
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Booking Date</th>
                  <th>Assigned Tech</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.request_number}</td>
                    <td>
                      <strong>{s.car_details?.brand} {s.car_details?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {s.car_details?.registration_number}
                      </div>
                    </td>
                    <td>{s.category_name}</td>
                    <td>{s.preferred_date} ({s.preferred_time})</td>
                    <td>{s.engineer_name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                    <td><StatusBadge status={s.current_status} /></td>
                    <td style={{ fontWeight: 700 }}>${s.final_cost || s.estimated_cost}</td>
                    <td>
                      <Link to={`/customer/services/${s.id}`} className="btn btn-sm btn-secondary">
                        View Progress <ArrowRight size={14} />
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

export default CustomerServices;
