import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, CheckCircle, AlertCircle, PlusCircle, CalendarPlus, Wrench, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCustomerAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading your automotive garage..." />;

  const kpis = analytics?.kpis || {};
  const activeService = analytics?.current_active_service;
  const recentRequests = analytics?.recent_requests || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome back, {user?.full_name}!</h1>
          <p>Here is the live status of your vehicles and ongoing garage operations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/customer/cars/add" className="btn btn-secondary">
            <PlusCircle size={16} /> Add Vehicle
          </Link>
          <Link to="/customer/services/book" className="btn btn-primary">
            <CalendarPlus size={16} /> Book Service
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Car size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.total_cars || 0}</h3>
            <p>Registered Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Clock size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.active_services || 0}</h3>
            <p>Active In-Bay Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.completed_services || 0}</h3>
            <p>Completed Services</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><AlertCircle size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.pending_services || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      {/* Active Service Live Tracker Card */}
      {activeService && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Service Tracker
              </span>
              <h3 style={{ fontSize: '1.25rem' }}>
                {activeService.car_details?.brand} {activeService.car_details?.model} ({activeService.car_details?.registration_number})
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusBadge status={activeService.current_status} />
              <Link to={`/customer/services/${activeService.id}`} className="btn btn-secondary btn-sm">
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <ProgressTracker currentStatus={activeService.current_status} />
        </div>
      )}

      {/* Recent Service Requests */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>Recent Service Bookings</h3>
          <Link to="/customer/services" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            View All Services →
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <Wrench size={40} />
            <h4>No service records found</h4>
            <p>Book your first vehicle maintenance check with our certified garage.</p>
            <Link to="/customer/services/book" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Book Service Now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date Scheduled</th>
                  <th>Assigned Tech</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{req.request_number}</td>
                    <td>{req.car_details?.brand} {req.car_details?.model} ({req.car_details?.registration_number})</td>
                    <td>{req.category_name}</td>
                    <td>{req.preferred_date}</td>
                    <td>{req.engineer_name || 'Pending assignment'}</td>
                    <td><StatusBadge status={req.current_status} /></td>
                    <td style={{ fontWeight: 600 }}>${req.final_cost || req.estimated_cost}</td>
                    <td>
                      <Link to={`/customer/services/${req.id}`} className="btn btn-sm btn-secondary">
                        Details
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

export default CustomerDashboard;
