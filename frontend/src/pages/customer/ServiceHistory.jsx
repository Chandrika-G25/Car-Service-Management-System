import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const CustomerServiceHistory = () => {
  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await serviceRequestService.getRequests({ status: 'COMPLETED' });
        setCompletedServices(res.results || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Loading message="Loading past completed service history..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Service History</h1>
          <p>Archived record of all successfully completed maintenance and repair jobs.</p>
        </div>
      </div>

      {completedServices.length === 0 ? (
        <div className="card empty-state">
          <History size={40} />
          <h3>No Completed Services Yet</h3>
          <p>When your scheduled maintenance passes testing and is marked completed, records appear here.</p>
          <Link to="/customer/services/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Book Service
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Number</th>
                  <th>Vehicle</th>
                  <th>Service Package</th>
                  <th>Completion Date</th>
                  <th>Technician</th>
                  <th>Final Cost</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {completedServices.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.request_number}</td>
                    <td>
                      <strong>{item.car_details?.brand} {item.car_details?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {item.car_details?.registration_number}
                      </div>
                    </td>
                    <td>{item.category_name}</td>
                    <td>{item.preferred_date}</td>
                    <td>{item.engineer_name || 'Chief Bay Tech'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>${item.final_cost}</td>
                    <td><StatusBadge status="COMPLETED" /></td>
                    <td>
                      <Link to={`/customer/services/${item.id}`} className="btn btn-sm btn-secondary">
                        View Log <ArrowRight size={14} />
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

export default CustomerServiceHistory;
