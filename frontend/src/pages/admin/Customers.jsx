import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, CheckCircle, XCircle, ArrowRight, Phone, Mail } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getCustomers(params);
      setCustomers(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const toggleCustomerActive = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this customer account?`)) return;

    try {
      const res = await adminService.toggleCustomerActive(id);
      setCustomers(customers.map((c) => (c.id === id ? { ...c, is_active: res.is_active } : c)));
    } catch (err) {
      alert('Failed to update customer status.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Customer Accounts Directory</h1>
          <p>Search, review vehicle ownership, and manage customer account permissions.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Fetching customer accounts..." />
      ) : customers.length === 0 ? (
        <div className="card empty-state">
          <Users size={40} />
          <h3>No Customers Found</h3>
          <p>No customer profiles matched your query.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Location</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.full_name}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                        <span><Mail size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{c.email}</span>
                        <span><Phone size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{c.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      {c.customer_profile?.city ? `${c.customer_profile.city}, ${c.customer_profile.state || ''}` : 'Not Specified'}
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      {c.is_active ? (
                        <span className="badge badge-completed">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/customers/${c.id}`} className="btn btn-sm btn-secondary">
                          View Fleet
                        </Link>
                        <button
                          onClick={() => toggleCustomerActive(c.id, c.is_active)}
                          className={`btn btn-sm ${c.is_active ? 'btn-danger' : 'btn-primary'}`}
                        >
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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

export default AdminCustomers;
