import React, { useEffect, useState } from 'react';
import { bookings } from '../api';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookings.getMine();
      setBookingList(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-600" size={20} />;
      case 'CONFIRMED':
      case 'IN_PROGRESS':
        return <AlertCircle className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

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

  const filteredBookings = filter === 'ALL'
    ? bookingList
    : bookingList.filter(b => b.status === filter);

  const stats = {
    total: bookingList.length,
    pending: bookingList.filter(b => b.status === 'PENDING').length,
    confirmed: bookingList.filter(b => b.status === 'CONFIRMED').length,
    completed: bookingList.filter(b => b.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-lg mb-2">Pending</h3>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg mb-2">Confirmed</h3>
          <p className="text-3xl font-bold">{stats.confirmed}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg mb-2">Completed</h3>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
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
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-xl text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(booking.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.payment_status === 'PAID' && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Paid
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{booking.service_name}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <p><strong>Provider:</strong> {booking.provider_company}</p>
                      <p><strong>Contact:</strong> {booking.provider_phone}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
                      <p><strong>Duration:</strong> {booking.duration_hours} hour(s)</p>
                    </div>
                  </div>

                  {booking.drone_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Drone:</strong> {booking.drone_name} ({booking.drone_type})
                    </p>
                  )}

                  {booking.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{booking.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
