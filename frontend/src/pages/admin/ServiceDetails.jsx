import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Car, Wrench, DollarSign, Calendar, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { adminService } from '../../services/adminService';
import { invoiceService } from '../../services/invoiceService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';
import Modal from '../../components/Modal';

export const AdminServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Costs Modal
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [estCost, setEstCost] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [updatingCosts, setUpdatingCosts] = useState(false);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [engineerId, setEngineerId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  // Invoice creation
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [serviceData, engData] = await Promise.all([
        serviceRequestService.getRequestById(id),
        adminService.getEngineers(),
      ]);
      setService(serviceData);
      setEngineers(engData);
      setEstCost(serviceData.estimated_cost);
      setFinalCost(serviceData.final_cost);
      if (serviceData.assigned_engineer) {
        setEngineerId(serviceData.assigned_engineer);
      } else if (engData.length > 0) {
        setEngineerId(engData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateCosts = async (e) => {
    e.preventDefault();
    setUpdatingCosts(true);
    try {
      await serviceRequestService.updateCosts(id, {
        estimated_cost: estCost,
        final_cost: finalCost,
      });
      setCostModalOpen(false);
      fetchDetails();
    } catch (err) {
      alert('Failed to update cost figures.');
    } finally {
      setUpdatingCosts(false);
    }
  };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    try {
      await serviceRequestService.assignEngineer(id, {
        engineer_id: engineerId,
        estimated_cost: estCost,
        remarks: assignRemarks || 'Assigned by administrator.',
      });
      setAssignModalOpen(false);
      fetchDetails();
    } catch (err) {
      alert('Failed to assign engineer.');
    }
  };

  const handleCreateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      await invoiceService.createInvoice({
        service_request_id: id,
        subtotal: service.final_cost || service.estimated_cost,
        tax: roundCost((service.final_cost || service.estimated_cost) * 0.18),
        discount: 0.00,
        payment_status: 'PENDING',
      });
      alert('Invoice generated successfully! Accessible under Invoices.');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const roundCost = (num) => Math.round(num * 100) / 100;

  if (loading) return <Loading message="Loading ticket dossier..." />;
  if (!service) return <div className="card empty-state">Ticket record not found.</div>;

  const car = service.car_details || {};

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/admin/services')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Service Queue
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>Ticket #{service.request_number}</h1>
            <StatusBadge status={service.current_status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setAssignModalOpen(true)}>
            <UserCheck size={16} /> {service.assigned_engineer ? 'Reassign Tech' : 'Assign Engineer'}
          </button>
          <button className="btn btn-secondary" onClick={() => setCostModalOpen(true)}>
            <DollarSign size={16} /> Adjust Costs
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateInvoice}
            disabled={generatingInvoice}
          >
            <FileText size={16} /> {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </div>

      {/* 7-Stage Status Tracker */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Lifecycle Progress Stage</h3>
        <ProgressTracker currentStatus={service.current_status} history={service.history} />
      </div>

      {/* Ticket Details & Costs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Workorder Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{service.customer_name}</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{service.customer_email}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Automobile</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{car.brand} {car.model}</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{car.registration_number}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Service Package</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{service.category_name}</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scheduled: {service.preferred_date}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Assigned Tech</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{service.engineer_name || 'Unassigned'}</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{service.engineer_employee_id || ''}</span>
            </div>
          </div>

          {service.description && (
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Customer Description</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{service.description}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Financial Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Cost:</span>
              <strong>${service.estimated_cost}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Final Cost:</span>
              <strong style={{ color: 'var(--success)' }}>${service.final_cost || service.estimated_cost}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <span>Est. Tax (18%):</span>
              <span>${roundCost((service.final_cost || service.estimated_cost) * 0.18)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Audit Timeline</h3>
        {(!service.history || service.history.length === 0) ? (
          <p style={{ color: 'var(--text-dim)' }}>No timeline entries found.</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-subtle)' }}>
            {service.history.map((h) => (
              <div key={h.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.05rem',
                    top: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '3px solid var(--bg-surface)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <StatusBadge status={h.new_status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0', fontSize: '0.925rem' }}>{h.remarks}</p>
                {h.updated_by_name && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    By: {h.updated_by_name} ({h.updated_by_role})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adjust Costs Modal */}
      <Modal
        isOpen={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        title="Adjust Service Costs"
      >
        <form onSubmit={handleUpdateCosts}>
          <div className="form-group">
            <label className="form-label">Estimated Cost ($)</label>
            <input
              type="number"
              step="0.01"
              required
              className="form-control"
              value={estCost}
              onChange={(e) => setEstCost(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Final Cost ($)</label>
            <input
              type="number"
              step="0.01"
              required
              className="form-control"
              value={finalCost}
              onChange={(e) => setFinalCost(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCostModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingCosts}>
              Save Costs
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Engineer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Workshop Technician"
      >
        <form onSubmit={handleAssignEngineer}>
          <div className="form-group">
            <label className="form-label">Select Engineer</label>
            <select
              className="form-select"
              value={engineerId}
              onChange={(e) => setEngineerId(e.target.value)}
              required
            >
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.full_name} ({eng.engineer_profile?.employee_id}) - {eng.engineer_profile?.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assignment Remarks</label>
            <textarea
              className="form-control"
              rows={2}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Assigned to Bay 3 for full inspection scan."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServiceDetails;
