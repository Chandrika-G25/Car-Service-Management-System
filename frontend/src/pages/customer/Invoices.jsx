import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, CheckCircle, Clock } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await invoiceService.getInvoices();
        setInvoices(res.results || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const openInvoiceModal = (inv) => {
    setSelectedInvoice(inv);
    setInvoiceModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loading message="Loading billing statements and invoices..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Billing & Invoices</h1>
          <p>Official tax invoices, payment receipts, and diagnostic fee breakdown.</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card empty-state">
          <FileText size={40} />
          <h3>No Invoices Available</h3>
          <p>Invoices are generated upon completion of vehicle services.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Ticket Ref</th>
                  <th>Vehicle</th>
                  <th>Issued Date</th>
                  <th>Subtotal</th>
                  <th>Tax (18%)</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{inv.invoice_number}</td>
                    <td>{inv.service_request_number}</td>
                    <td>{inv.car_name}</td>
                    <td>{inv.issued_date}</td>
                    <td>${inv.subtotal}</td>
                    <td>${inv.tax}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${inv.total_amount}</td>
                    <td><StatusBadge status={inv.payment_status} /></td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openInvoiceModal(inv)}
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Professional Printable Invoice Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Official Service Invoice"
        maxWidth="750px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setInvoiceModalOpen(false)}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Save PDF
            </button>
          </>
        }
      >
        {selectedInvoice && (
          <div className="invoice-container">
            <div className="invoice-header">
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>CSMS AUTO CARE</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  450 Automotive Way, Bay Area CA<br />
                  Tax ID: CSMS-US-9920148<br />
                  support@csms-auto.com | +1 (800) 555-CSMS
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0284c7', margin: 0 }}>INVOICE</h3>
                <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#0f172a' }}>
                  {selectedInvoice.invoice_number}
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Date: {selectedInvoice.issued_date}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    backgroundColor: selectedInvoice.payment_status === 'PAID' ? '#dcfce7' : '#fef3c7',
                    color: selectedInvoice.payment_status === 'PAID' ? '#15803d' : '#b45309',
                  }}
                >
                  PAYMENT: {selectedInvoice.payment_status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Billed To:</strong>
                <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.customer_name}</p>
                <p style={{ margin: 0, color: '#64748b' }}>{selectedInvoice.customer_email}</p>
              </div>
              <div>
                <strong style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Vehicle & Service:</strong>
                <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.car_name}</p>
                <p style={{ margin: 0, color: '#64748b' }}>
                  Package: {selectedInvoice.service_category_name} (Ref: {selectedInvoice.service_request_number})
                </p>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{selectedInvoice.service_category_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Labor, diagnostics & replacement components</div>
                  </td>
                  <td>Service Job</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${selectedInvoice.subtotal}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-summary">
              <div className="invoice-summary-box">
                <div className="invoice-summary-row">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal}</span>
                </div>
                <div className="invoice-summary-row">
                  <span>GST / Tax (18%):</span>
                  <span>${selectedInvoice.tax}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="invoice-summary-row" style={{ color: '#16a34a' }}>
                    <span>Discount:</span>
                    <span>-${selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="invoice-summary-row total">
                  <span>Total Amount:</span>
                  <span>${selectedInvoice.total_amount}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#475569' }}>Payment Receipts:</strong>
                {selectedInvoice.payments.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '0.3rem' }}>
                    <span>Method: {p.payment_method} ({p.transaction_reference || 'REF-N/A'})</span>
                    <span>Paid: ${p.amount} on {new Date(p.payment_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerInvoices;
