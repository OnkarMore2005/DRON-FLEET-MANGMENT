import React, { useEffect, useState } from 'react';
import { admin } from '../api';
import { Download, Calendar, DollarSign } from 'lucide-react';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFrom, dateTo]);

  const fetchBookings = async () => {
    try {
      const response = await admin.getBookings(statusFilter, dateFrom, dateTo);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Customer', 'Email', 'Service', 'Provider', 'Date', 'Amount', 'Status', 'Payment'];
    const rows = bookings.map(b => [
      b.id,
      b.customer_name,
      b.customer_email,
      b.service_name,
      b.provider_company,
      b.date,
      b.amount,
      b.status,
      b.payment_status || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalRevenue = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.amount, 0);

  if (loading) {
    return <div className="p-8 text-center">Loading bookings...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-blue-50">
          <h3 className="text-gray-700 mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-gray-700 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card bg-purple-50">
          <h3 className="text-gray-700 mb-2">Average Booking</h3>
          <p className="text-3xl font-bold text-purple-600">
            ₹{bookings.length > 0 ? Math.round(totalRevenue / bookings.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input pl-10"
              placeholder="From date"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input pl-10"
              placeholder="To date"
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Provider</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">#{booking.id}</td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500">{booking.customer_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{booking.service_name}</td>
                <td className="px-4 py-3 text-sm">{booking.provider_company}</td>
                <td className="px-4 py-3 text-sm">{booking.date}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign size={16} />
                    {booking.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {booking.payment_status ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment_status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.payment_status}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
