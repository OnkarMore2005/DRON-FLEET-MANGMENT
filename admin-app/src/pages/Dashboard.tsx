import React, { useEffect, useState } from 'react';
import { admin } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, Package, DollarSign, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<any[]>([]);
  const [serviceAnalytics, setServiceAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, servicesRes] = await Promise.all([
        admin.getStats(),
        admin.getBookingAnalytics(),
        admin.getServiceAnalytics(),
      ]);

      setStats(statsRes.data.stats);
      setBookingAnalytics(bookingsRes.data.data.reverse());
      setServiceAnalytics(servicesRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Total Users</h3>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm mt-2 opacity-90">Active customers</p>
            </div>
            <Users size={56} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Providers</h3>
              <p className="text-4xl font-bold">{stats.totalProviders}</p>
              <p className="text-sm mt-2 opacity-90">Approved partners</p>
            </div>
            <Building2 size={56} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Total Bookings</h3>
              <p className="text-4xl font-bold">{stats.totalBookings}</p>
              <p className="text-sm mt-2 opacity-90">All time</p>
            </div>
            <Package size={56} className="opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-2">Total Revenue</h3>
              <p className="text-4xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-sm mt-2 opacity-90">Platform earnings</p>
            </div>
            <DollarSign size={56} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Bookings & Revenue */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" />
            Monthly Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
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
                strokeWidth={2}
                name="Bookings"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Services by Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
              <Bar dataKey="booking_count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Revenue Distribution */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Revenue by Service Category</h2>
        <div className="flex flex-wrap items-center">
          <ResponsiveContainer width="50%" height={300}>
            <PieChart>
              <Pie
                data={serviceAnalytics}
                dataKey="total_revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `₹${(entry.value / 1000).toFixed(0)}K`}
              >
                {serviceAnalytics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2 space-y-3">
            {serviceAnalytics.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{service.name}</span>
                </div>
                <span className="text-sm font-semibold">
                  ₹{service.total_revenue?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
