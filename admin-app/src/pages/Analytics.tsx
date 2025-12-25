import React, { useEffect, useState } from 'react';
import { admin } from '../api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics: React.FC = () => {
  const [bookingAnalytics, setBookingAnalytics] = useState<any[]>([]);
  const [serviceAnalytics, setServiceAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        admin.getBookingAnalytics(),
        admin.getServiceAnalytics(),
      ]);

      setBookingAnalytics(bookingsRes.data.data.reverse());
      setServiceAnalytics(servicesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <TrendingUp className="mr-3 text-blue-600" />
        Platform Analytics
      </h1>

      {/* Monthly Trends */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-6">Monthly Performance Trends</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={bookingAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Total Bookings"
              dot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              name="Revenue (₹)"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Service Analytics */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Bookings by Service */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bookings by Service</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={serviceAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booking_count" fill="#8b5cf6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={serviceAnalytics}
                dataKey="total_revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.name}: ₹${(entry.value / 1000).toFixed(0)}K`}
                labelLine={false}
              >
                {serviceAnalytics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Service Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Bookings</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Avg Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceAnalytics.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{service.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">{service.booking_count}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">
                    ₹{service.total_revenue?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-purple-600 font-semibold">
                    ₹{service.booking_count > 0 
                      ? Math.round(service.total_revenue / service.booking_count).toLocaleString()
                      : 0
                    }
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

export default Analytics;
