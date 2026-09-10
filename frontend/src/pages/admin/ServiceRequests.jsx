import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Filter, UserCheck, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Assign Engineer Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assignEstimatedCost, setAssignEstimatedCost] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await serviceRequestService.getRequests(params);
      setRequests(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const data = await adminService.getEngineers({ status: 'AVAILABLE' });
      setEngineers(data);
      if (data.length > 0) setSelectedEngineerId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchEngineers();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const openAssignModal = (req) => {
    setSelectedRequest(req);
    setAssignEstimatedCost(req.estimated_cost || '');
    setAssignRemarks('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEngineerId) {
      alert('Please choose an engineer.');
      return;
    }

    setAssigning(true);
    try {
      await serviceRequestService.assignEngineer(selectedRequest.id, {
        engineer_id: selectedEngineerId,
        estimated_cost: assignEstimatedCost,
        remarks: assignRemarks,
      });
      setAssignModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign engineer.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Service Request Queue</h1>
          <p>Assign incoming tickets to bays, supervise diagnostics, and coordinate maintenance workflow.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by request #, vehicle plate, or customer name..."
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
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Loading workshop request tickets..." />
      ) : requests.length === 0 ? (
        <div className="card empty-state">
          <Wrench size={40} />
          <h3>No Requests in Queue</h3>
          <p>No service tickets matched the current filter criteria.</p>
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
                  <th>Date</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <Link to={`/admin/services/${req.id}`} style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {req.request_number}
                      </Link>
                    </td>
                    <td>
                      <strong>{req.customer_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{req.customer_phone || req.customer_email}</div>
                    </td>
                    <td>
                      <strong>{req.car_details?.brand} {req.car_details?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{req.car_details?.registration_number}</div>
                    </td>
                    <td>{req.category_name}</td>
                    <td>{req.preferred_date}</td>
                    <td>
                      {req.engineer_name ? (
                        <span style={{ fontWeight: 600 }}>{req.engineer_name}</span>
                      ) : (
                        <button
                          onClick={() => openAssignModal(req)}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <UserCheck size={12} /> Assign Tech
                        </button>
                      )}
                    </td>
                    <td><StatusBadge status={req.current_status} /></td>
                    <td style={{ fontWeight: 700 }}>${req.final_cost || req.estimated_cost}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link to={`/admin/services/${req.id}`} className="btn btn-sm btn-secondary">
                          Manage
                        </Link>
                        {req.current_status === 'PENDING' && (
                          <button
                            onClick={() => openAssignModal(req)}
                            className="btn btn-sm btn-primary"
                            title="Assign Engineer"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Engineer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Engineer to Ticket ${selectedRequest?.request_number}`}
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Certified Service Engineer *</label>
            <select
              className="form-select"
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
              required
            >
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.full_name} ({eng.engineer_profile?.employee_id}) - {eng.engineer_profile?.specialization} [{eng.engineer_profile?.availability_status}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Labor & Parts Cost ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={assignEstimatedCost}
              onChange={(e) => setAssignEstimatedCost(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Remarks / Bay Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Assigned to Diagnostic Bay 2 for high voltage safety scan."
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={assigning}>
              <UserCheck size={16} /> {assigning ? 'Allocating Bay...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServiceRequests;
