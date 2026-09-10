import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car as CarIcon, Plus, Trash2, Edit, Fuel, Gauge, Calendar, Hash, AlertTriangle } from 'lucide-react';
import { carService } from '../../services/carService';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

export const CustomerCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await carService.getCars();
      setCars(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const openDeleteModal = (car) => {
    setSelectedCar(car);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCar) return;
    setDeleting(true);
    try {
      await carService.deleteCar(selectedCar.id);
      setCars(cars.filter((c) => c.id !== selectedCar.id));
      setDeleteModalOpen(false);
    } catch (err) {
      alert('Could not delete car. Check if there are active service requests linked to this vehicle.');
    } finally {
      setDeleting(false);
      setSelectedCar(null);
    }
  };

  const openEditModal = (car) => {
    setSelectedCar(car);
    setEditFormData({
      brand: car.brand,
      model: car.model,
      registration_number: car.registration_number,
      manufacturing_year: car.manufacturing_year,
      fuel_type: car.fuel_type,
      color: car.color || '',
      mileage: car.mileage || 0,
      vin_number: car.vin_number || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await carService.updateCar(selectedCar.id, editFormData);
      setCars(cars.map((c) => (c.id === selectedCar.id ? updated : c)));
      setEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.registration_number?.[0] || 'Error updating vehicle details.');
    }
  };

  if (loading) return <Loading message="Loading registered vehicles..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Vehicles</h1>
          <p>Manage your fleet, review mileage statistics, or register new automobiles.</p>
        </div>
        <Link to="/customer/cars/add" className="btn btn-primary">
          <Plus size={16} /> Register Vehicle
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="card empty-state">
          <CarIcon size={48} />
          <h3>No Vehicles Registered Yet</h3>
          <p>Add your car to schedule bookings, track maintenance history, and view invoices.</p>
          <Link to="/customer/cars/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Register First Vehicle
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {cars.map((car) => (
            <div key={car.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
                      {car.brand} {car.model}
                    </h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                      {car.registration_number}
                    </span>
                  </div>
                  <span className="badge badge-assigned" style={{ fontSize: '0.75rem' }}>
                    {car.fuel_type}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span>Year: {car.manufacturing_year}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gauge size={15} color="var(--primary)" />
                    <span>{car.mileage?.toLocaleString()} km</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Fuel size={15} color="var(--primary)" />
                    <span>Color: {car.color || 'Standard'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hash size={15} color="var(--primary)" />
                    <span>VIN: {car.vin_number ? car.vin_number.slice(0, 8) + '...' : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <Link to={`/customer/services/book?car_id=${car.id}`} className="btn btn-sm btn-primary">
                  Book Service
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(car)} className="btn btn-sm btn-secondary" title="Edit Vehicle">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => openDeleteModal(car)} className="btn btn-sm btn-danger" title="Delete Vehicle">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete Vehicle"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Vehicle'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              Are you sure you want to delete <strong>{selectedCar?.brand} {selectedCar?.model} ({selectedCar?.registration_number})</strong>?
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              This will remove the automobile from your garage registry. Past completed service invoices will remain archived.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${selectedCar?.brand} ${selectedCar?.model}`}
      >
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                required
                className="form-control"
                value={editFormData.brand || ''}
                onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                required
                className="form-control"
                value={editFormData.model || ''}
                onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                required
                className="form-control"
                value={editFormData.registration_number || ''}
                onChange={(e) => setEditFormData({ ...editFormData, registration_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturing Year</label>
              <input
                type="number"
                required
                className="form-control"
                value={editFormData.manufacturing_year || ''}
                onChange={(e) => setEditFormData({ ...editFormData, manufacturing_year: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                value={editFormData.fuel_type || 'PETROL'}
                onChange={(e) => setEditFormData({ ...editFormData, fuel_type: e.target.value })}
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Odometer (km)</label>
              <input
                type="number"
                className="form-control"
                value={editFormData.mileage || 0}
                onChange={(e) => setEditFormData({ ...editFormData, mileage: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerCars;
