import React, { useEffect, useState } from 'react';
import { bookings } from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Check, X, MapPin, Phone, Mail } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const Bookings: React.FC = () => {
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookings.getProviderBookings();
      setBookingList(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await bookings.updateStatus(bookingId, status);
      await fetchBookings();
      alert(`Booking ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update booking status');
    }
  };

  const filteredBookings = filter === 'ALL'
    ? bookingList
    : bookingList.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bookings Management</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 overflow-x-auto">
        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-xl text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.payment_status === 'PAID' && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Paid
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{booking.service_name}</h3>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">
                        <strong>Customer:</strong> {booking.customer_name}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Phone size={14} className="mr-1" />
                        {booking.customer_phone}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Mail size={14} className="mr-1" />
                        {booking.customer_email}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600"><strong>Date:</strong> {booking.date}</p>
                      <p className="text-gray-600"><strong>Time:</strong> {booking.time}</p>
                      <p className="text-gray-600"><strong>Duration:</strong> {booking.duration_hours} hour(s)</p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{booking.amount.toLocaleString()}
                      </p>
                      {booking.drone_name && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Drone:</strong> {booking.drone_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="mt-3 text-purple-600 hover:underline text-sm flex items-center"
                  >
                    <MapPin size={14} className="mr-1" />
                    View Location on Map
                  </button>
                </div>

                {/* Action Buttons */}
                {booking.status === 'PENDING' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Check size={18} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                      className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <X size={18} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange(booking.id, 'IN_PROGRESS')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-4"
                  >
                    Start Job
                  </button>
                )}

                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-4"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Job Location</h2>
            <div className="mb-4">
              <p><strong>Customer:</strong> {selectedBooking.customer_name}</p>
              <p><strong>Service:</strong> {selectedBooking.service_name}</p>
              <p><strong>Date:</strong> {selectedBooking.date} at {selectedBooking.time}</p>
            </div>
            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
              <MapContainer
                center={[selectedBooking.latitude, selectedBooking.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[selectedBooking.latitude, selectedBooking.longitude]}>
                  <Popup>
                    <div>
                      <p><strong>{selectedBooking.service_name}</strong></p>
                      <p>{selectedBooking.customer_name}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Coordinates: {selectedBooking.latitude.toFixed(6)}, {selectedBooking.longitude.toFixed(6)}
            </p>
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
