import React, { useEffect, useState } from 'react';
import { bookings } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [bookingList, setBookingList] = useState<any[]>([]);
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

  const stats = {
    totalBookings: bookingList.length,
    pending: bookingList.filter(b => b.status === 'PENDING').length,
    confirmed: bookingList.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length,
    completed: bookingList.filter(b => b.status === 'COMPLETED').length,
    totalEarnings: bookingList
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.amount, 0),
    monthlyEarnings: bookingList
      .filter(b => {
        const bookingDate = new Date(b.created_at);
        const currentMonth = new Date().getMonth();
        return bookingDate.getMonth() === currentMonth && b.status === 'COMPLETED';
      })
      .reduce((sum, b) => sum + b.amount, 0),
  };

  // Monthly earnings data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    const earnings = bookingList
      .filter(b => {
        const bookingDate = new Date(b.created_at);
        return (
          bookingDate.getMonth() === month.getMonth() &&
          bookingDate.getFullYear() === month.getFullYear() &&
          b.status === 'COMPLETED'
        );
      })
      .reduce((sum, b) => sum + b.amount, 0);

    return { month: monthName, earnings };
  });

  // Category-wise bookings
  const categoryData = bookingList.reduce((acc: any, booking) => {
    const category = booking.service_category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, count: 0 };
    }
    acc[category].count++;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            <Package size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Pending</h3>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Completed</h3>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle size={48} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <DollarSign size={48} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Earnings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Categories */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bookings by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookingList.slice(0, 10).map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{booking.id}</td>
                  <td className="px-4 py-3 text-sm">{booking.customer_name}</td>
                  <td className="px-4 py-3 text-sm">{booking.service_name}</td>
                  <td className="px-4 py-3 text-sm">{booking.date}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{booking.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
