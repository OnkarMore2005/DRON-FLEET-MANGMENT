import React, { useEffect, useState } from 'react';
import { admin } from '../api';
import { Check, X, Clock, Building2, MapPin, Phone, Mail } from 'lucide-react';

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, [statusFilter]);

  const fetchProviders = async () => {
    try {
      const response = await admin.getProviders(statusFilter);
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await admin.updateProviderStatus(id, status);
      await fetchProviders();
      alert(`Provider ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update provider status:', error);
      alert('Failed to update provider status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading providers...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Provider Management</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex space-x-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'ALL' ? '' : status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (status === 'ALL' && !statusFilter) || statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      {providers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No providers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {providers.map(provider => (
            <div key={provider.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="text-purple-600" size={24} />
                    <h3 className="text-xl font-semibold">{provider.company}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(provider.status)}`}>
                    {provider.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-700">
                  <Mail className="mr-2 text-gray-400" size={16} />
                  <span className="text-sm">{provider.name}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="mr-2 text-gray-400" size={16} />
                  <span className="text-sm">{provider.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="mr-2 text-gray-400" size={16} />
                  <span className="text-sm">{provider.phone}</span>
                </div>
                <div className="flex items-start text-gray-700">
                  <MapPin className="mr-2 text-gray-400 mt-0.5" size={16} />
                  <span className="text-sm">{provider.cities.join(', ')}</span>
                </div>
                {provider.latitude && provider.longitude && (
                  <p className="text-xs text-gray-500">
                    📍 {provider.latitude.toFixed(4)}, {provider.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Registered: {new Date(provider.created_at).toLocaleDateString()}
              </div>

              {provider.status === 'PENDING' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(provider.id, 'APPROVED')}
                    className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Check size={18} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(provider.id, 'REJECTED')}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <X size={18} />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {provider.status === 'APPROVED' && (
                <button
                  onClick={() => handleStatusUpdate(provider.id, 'PENDING')}
                  className="w-full flex items-center justify-center space-x-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  <Clock size={18} />
                  <span>Set to Pending</span>
                </button>
              )}

              {provider.status === 'REJECTED' && (
                <button
                  onClick={() => handleStatusUpdate(provider.id, 'PENDING')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Reconsider
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;
