import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, Wrench, Car as CarIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import { carService } from '../../services/carService';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';

export const BookService = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCarId = searchParams.get('car_id') || '';

  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdRequest, setCreatedRequest] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    car_id: initialCarId,
    service_category_id: '',
    preferred_date: minDate,
    preferred_time: '10:00 AM',
    description: '',
    current_mileage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carsRes, catsRes] = await Promise.all([
          carService.getCars(),
          serviceRequestService.getCategories(),
        ]);
        const carList = carsRes.results || carsRes;
        const catList = catsRes.results || catsRes;
        setCars(carList);
        setCategories(catList);

        if (carList.length > 0) {
          const selectedCar = initialCarId
            ? carList.find((c) => String(c.id) === String(initialCarId)) || carList[0]
            : carList[0];
          setFormData((prev) => ({
            ...prev,
            car_id: selectedCar.id,
            current_mileage: selectedCar.mileage || 0,
            service_category_id: catList.length > 0 ? catList[0].id : '',
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialCarId]);

  const handleCarChange = (e) => {
    const selectedId = e.target.value;
    const carObj = cars.find((c) => String(c.id) === String(selectedId));
    setFormData({
      ...formData,
      car_id: selectedId,
      current_mileage: carObj ? carObj.mileage : 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.car_id) {
      setError('Please select or register a vehicle first.');
      return;
    }
    if (!formData.service_category_id) {
      setError('Please select a service category.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await serviceRequestService.createRequest(formData);
      setCreatedRequest(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to schedule service appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading booking schedule options..." />;

  if (createdRequest) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Service Booking Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your request ticket has been generated and dispatched to the workshop coordination team.
          </p>

          <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Request Number:</span>
              <strong style={{ color: 'var(--accent)' }}>{createdRequest.request_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Vehicle:</span>
              <strong>{createdRequest.car_details?.brand} {createdRequest.car_details?.model} ({createdRequest.car_details?.registration_number})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Scheduled Date:</span>
              <strong>{createdRequest.preferred_date} at {createdRequest.preferred_time}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Estimated Cost:</span>
              <strong style={{ color: 'var(--success)' }}>${createdRequest.estimated_cost}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to={`/customer/services/${createdRequest.id}`} className="btn btn-primary">
              Track Service Progress
            </Link>
            <Link to="/customer/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(formData.service_category_id)
  );

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1>Book Vehicle Service</h1>
          <p>Schedule a routine service check, diagnostic scan, or major mechanical overhaul.</p>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="card empty-state">
          <CarIcon size={40} />
          <h3>No Vehicles Found</h3>
          <p>You need to register at least one vehicle before booking a service slot.</p>
          <Link to="/customer/cars/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Add Vehicle First
          </Link>
        </div>
      ) : (
        <div className="card">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Select Vehicle *</label>
                <select
                  className="form-select"
                  value={formData.car_id}
                  onChange={handleCarChange}
                  required
                >
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.registration_number}) - {car.fuel_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Package *</label>
                <select
                  className="form-select"
                  value={formData.service_category_id}
                  onChange={(e) => setFormData({ ...formData, service_category_id: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (${cat.estimated_cost}) - ~{cat.estimated_duration}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={minDate}
                  className="form-control"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Window *</label>
                <select
                  className="form-select"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                >
                  <option value="09:00 AM">09:00 AM - Morning Slot</option>
                  <option value="11:00 AM">11:00 AM - Mid-Day Slot</option>
                  <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                  <option value="04:00 PM">04:00 PM - Late Afternoon Slot</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Odometer Mileage (km)</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData({ ...formData, current_mileage: e.target.value })}
                />
              </div>
            </div>

            {selectedCategory && (
              <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--accent)' }}>{selectedCategory.name} Overview</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedCategory.description}</p>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Estimated Fee:</strong> ${selectedCategory.estimated_cost} &nbsp;|&nbsp; <strong>Expected Duration:</strong> {selectedCategory.estimated_duration}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Specific Vehicle Complaints / Notes (Optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Mention any unusual engine noises, brake vibrations, warning dashboard lights, or special instructions for the technician..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/customer/dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                <Wrench size={18} /> {submitting ? 'Confirming Booking...' : 'Confirm Service Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookService;
