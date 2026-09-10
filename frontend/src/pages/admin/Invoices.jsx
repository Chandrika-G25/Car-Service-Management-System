import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Search, CheckCircle, CreditCard, PlusCircle } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Payment Recording Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [txRef, setTxRef] = useState('');
  const [recording, setRecording] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await invoiceService.getInvoices(params);
      setInvoices(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.total_amount);
    setPaymentMethod('CASH');
    setTxRef('');
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setRecording(true);
    try {
      await invoiceService.recordPayment(selectedInvoice.id, {
        amount: paymentAmount,
        payment_method: paymentMethod,
        transaction_reference: txRef,
      });
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record payment.');
    } finally {
      setRecording(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Invoices & Billing Desk</h1>
          <p>Supervise tax invoices, collect payments, and track workshop cashflow.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by invoice #, customer name, ticket #..."
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
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Loading billing statements..." />
      ) : invoices.length === 0 ? (
        <div className="card empty-state">
          <FileText size={40} />
          <h3>No Invoices Found</h3>
          <p>No billing statements matched your query criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Total Due</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{inv.invoice_number}</td>
                    <td>{inv.service_request_number}</td>
                    <td>
                      <strong>{inv.customer_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{inv.customer_email}</div>
                    </td>
                    <td>{inv.car_name}</td>
                    <td>{inv.issued_date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${inv.total_amount}</td>
                    <td><StatusBadge status={inv.payment_status} /></td>
                    <td>
                      {inv.payment_status !== 'PAID' ? (
                        <button
                          onClick={() => openPaymentModal(inv)}
                          className="btn btn-sm btn-primary"
                        >
                          <DollarSign size={14} /> Record Payment
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                          ✓ Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoice_number}`}
      >
        <form onSubmit={handleRecordPayment}>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Customer:</span>
              <strong>{selectedInvoice?.customer_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Total Invoice Amount:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>${selectedInvoice?.total_amount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Current Status:</span>
              <StatusBadge status={selectedInvoice?.payment_status} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              min={0.01}
              className="form-control"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method *</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="UPI">UPI / Instant Transfer</option>
              <option value="BANK_TRANSFER">Bank Wire Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Reference (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CARD-AUTH-94182, UPI-TXN-5541"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={recording}>
              <CheckCircle size={16} /> {recording ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvoices;
