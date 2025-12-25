import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { providers, bookings, payments } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  );
};

const BookService: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const service = location.state?.service;

  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [providerList, setProviderList] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    duration: 2,
    notes: '',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (!service) {
      navigate('/services');
    }
  }, [isAuthenticated, service, navigate]);

  useEffect(() => {
    if (selectedLocation) {
      fetchProviders();
    }
  }, [selectedLocation]);

  const fetchProviders = async () => {
    if (!selectedLocation) return;
    try {
      const response = await providers.search(selectedLocation[0], selectedLocation[1], 100);
      setProviderList(response.data.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  };

  const calculateTotal = () => {
    return service?.base_price * formData.duration || 0;
  };

  const handleNext = () => {
    if (step === 1 && !selectedLocation) {
      alert('Please select a location on the map');
      return;
    }
    if (step === 2 && !selectedProvider) {
      alert('Please select a provider');
      return;
    }
    if (step === 3 && (!formData.date || !formData.time)) {
      alert('Please select date and time');
      return;
    }
    setStep(step + 1);
  };

  const handleBooking = async () => {
    if (!selectedLocation || !selectedProvider) return;

    setLoading(true);
    try {
      const bookingData = {
        provider_id: selectedProvider.id,
        service_id: service.id,
        date: formData.date,
        time: formData.time,
        latitude: selectedLocation[0],
        longitude: selectedLocation[1],
        amount: calculateTotal(),
        duration_hours: formData.duration,
        notes: formData.notes,
      };

      const response = await bookings.create(bookingData);
      setBookingId(response.data.booking_id);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;

    try {
      // Step 1: Create payment order
      const orderResponse = await payments.createOrder(bookingId, calculateTotal());
      const { order_id } = orderResponse.data;

      // Step 2: Simulate payment (fake Razorpay)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Verify payment
      await payments.verify(order_id, bookingId);

      alert('Payment successful! Booking confirmed.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (!service) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book: {service.name}</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div className={`w-24 h-1 ${s < step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 space-x-12 text-sm">
          <span className={step >= 1 ? 'text-blue-600' : 'text-gray-500'}>Location</span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-gray-500'}>Provider</span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-gray-500'}>Details</span>
          <span className={step >= 4 ? 'text-blue-600' : 'text-gray-500'}>Review</span>
        </div>
      </div>

      {/* Step 1: Select Location */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" />
              Select Service Location
            </h2>
            <p className="text-gray-600 mb-4">Click on the map to set your location</p>
            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
              <MapContainer
                center={[19.076, 72.8777]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationMarker position={selectedLocation} setPosition={setSelectedLocation} />
              </MapContainer>
            </div>
            {selectedLocation && (
              <p className="mt-4 text-sm text-gray-600">
                Selected: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
              </p>
            )}
          </div>
          <button onClick={handleNext} className="btn-primary w-full">
            Next: Choose Provider
          </button>
        </div>
      )}

      {/* Step 2: Select Provider */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Available Providers</h2>
            {providerList.length === 0 ? (
              <p className="text-gray-600">No providers found in your area</p>
            ) : (
              <div className="space-y-4">
                {providerList.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.id === provider.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{provider.company}</h3>
                        <p className="text-gray-600">{provider.name}</p>
                        <p className="text-sm text-gray-500">
                          Cities: {provider.cities.join(', ')}
                        </p>
                        {provider.distance && (
                          <p className="text-sm text-blue-600 mt-1">
                            {provider.distance} km away
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleNext} className="btn-primary flex-1">
              Next: Schedule
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Booking Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={18} />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  <Clock className="inline mr-2" size={18} />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map(h => (
                    <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Any special requirements..."
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleNext} className="btn-primary flex-1">
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Payment */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold">{selectedProvider?.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">{formData.date} at {formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{formData.duration} hour(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold text-sm">
                  {selectedLocation?.[0].toFixed(4)}, {selectedLocation?.[1].toFixed(4)}
                </span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-xl">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-blue-600">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <CreditCard className="mr-2" />
              Payment
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Amount to pay:</p>
              <p className="text-3xl font-bold text-blue-600">₹{calculateTotal().toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Test Payment Mode</strong>
              </p>
              <p className="text-sm text-yellow-800">
                Use card: <strong>4111 1111 1111 1111</strong><br />
                Any future date, Any CVV
              </p>
            </div>
            <button
              onClick={handlePayment}
              className="w-full btn-primary mb-3"
            >
              Pay ₹{calculateTotal().toLocaleString()}
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
