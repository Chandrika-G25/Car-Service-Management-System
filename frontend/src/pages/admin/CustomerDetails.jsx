import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Car, Wrench, Mail, Phone, MapPin } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export const AdminCustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await adminService.getCustomerDetails(id);
        setCustomer(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Loading message="Loading customer dossier..." />;
  if (!customer) return <div className="card empty-state">Customer record not found.</div>;

  const profile = customer.customer_profile || {};
  const cars = customer.cars || [];
  const services = customer.service_history || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/admin/customers')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
          <h1>Customer: {customer.full_name}</h1>
          <p>Customer Profile #{customer.id} • Registered {new Date(customer.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Contact Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{customer.email}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{customer.phone || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Address</span>
              <p style={{ margin: '0.2rem 0', color: 'var(--text-muted)' }}>
                {profile.address || 'N/A'}<br />
                {profile.city ? `${profile.city}, ${profile.state || ''} ${profile.pincode || ''}` : ''}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Account Status</span>
              <p style={{ margin: '0.2rem 0' }}>
                {customer.is_active ? <span className="badge badge-completed">Active</span> : <span className="badge badge-danger">Deactivated</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Registered Cars */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Registered Vehicles ({cars.length})</h3>
          {cars.length === 0 ? (
            <p style={{ color: 'var(--text-dim)' }}>No vehicles added by this customer.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0' }}>{car.brand} {car.model}</h4>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>{car.registration_number}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                    Year: {car.manufacturing_year} • {car.fuel_type} • {car.mileage?.toLocaleString()} km
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Request History */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Service Job History</h3>
        {services.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No service requests booked by this customer.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.request_number}</td>
                    <td>{s.car_details?.brand} {s.car_details?.model} ({s.car_details?.registration_number})</td>
                    <td>{s.category_name}</td>
                    <td>{s.preferred_date}</td>
                    <td>{s.engineer_name || 'Unassigned'}</td>
                    <td><StatusBadge status={s.current_status} /></td>
                    <td>${s.final_cost || s.estimated_cost}</td>
                    <td>
                      <Link to={`/admin/services/${s.id}`} className="btn btn-sm btn-secondary">
                        Manage Ticket
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

export default AdminCustomerDetails;
