import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, Search, Edit, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

export const AdminEngineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEng, setSelectedEng] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminService.getEngineers(params);
      setEngineers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEngineers();
  };

  const openEditModal = (eng) => {
    setSelectedEng(eng);
    setEditFormData({
      full_name: eng.full_name,
      phone: eng.phone || '',
      specialization: eng.engineer_profile?.specialization || '',
      experience_years: eng.engineer_profile?.experience_years || 0,
      availability_status: eng.engineer_profile?.availability_status || 'AVAILABLE',
      is_active: eng.is_active,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateEngineer(selectedEng.id, editFormData);
      setEditModalOpen(false);
      fetchEngineers();
    } catch (err) {
      alert('Failed to update engineer profile.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Service Engineers Directory</h1>
          <p>Technician credentials, bay specializations, and live availability statuses.</p>
        </div>
        <Link to="/admin/engineers/add" className="btn btn-primary">
          <UserPlus size={16} /> Onboard Engineer
        </Link>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by engineer name, employee ID, specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Availabilities</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Fetching certified engineers..." />
      ) : engineers.length === 0 ? (
        <div className="card empty-state">
          <ShieldCheck size={40} />
          <h3>No Engineers Found</h3>
          <p>Onboard certified automobile engineers to assign vehicle tickets.</p>
          <Link to="/admin/engineers/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Onboard Engineer Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {engineers.map((eng) => {
            const prof = eng.engineer_profile || {};
            return (
              <div key={eng.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.2rem 0' }}>{eng.full_name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                        {prof.employee_id || 'ID Pending'}
                      </span>
                    </div>
                    <span
                      className={`badge ${
                        prof.availability_status === 'AVAILABLE'
                          ? 'badge-completed'
                          : prof.availability_status === 'BUSY'
                          ? 'badge-pending'
                          : 'badge-danger'
                      }`}
                    >
                      {prof.availability_status || 'AVAILABLE'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <Award size={15} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent)' }} />
                    {prof.specialization || 'General Automobile Diagnostics'}
                  </p>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <div><Mail size={13} style={{ verticalAlign: 'middle', marginRight: '6px' }} />{eng.email}</div>
                    <div><Phone size={13} style={{ verticalAlign: 'middle', marginRight: '6px' }} />{eng.phone || 'N/A'}</div>
                    <div>Experience: <strong>{prof.experience_years || 0} years</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '1rem' }}>
                  <button onClick={() => openEditModal(eng)} className="btn btn-sm btn-secondary">
                    <Edit size={14} /> Edit Technician
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Engineer Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Engineer: ${selectedEng?.full_name}`}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={editFormData.full_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              value={editFormData.phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specialization Area</label>
            <input
              type="text"
              className="form-control"
              value={editFormData.specialization || ''}
              onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                className="form-control"
                value={editFormData.experience_years || 0}
                onChange={(e) => setEditFormData({ ...editFormData, experience_years: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select
                className="form-select"
                value={editFormData.availability_status || 'AVAILABLE'}
                onChange={(e) => setEditFormData({ ...editFormData, availability_status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Updates
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEngineers;
