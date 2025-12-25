import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { services } from '../api';
import { Search, Filter } from 'lucide-react';

const Services: React.FC = () => {
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [selectedCategory, searchQuery, serviceList]);

  const fetchServices = async () => {
    try {
      const response = await services.getAll();
      setServiceList(response.data.services);
      setFilteredServices(response.data.services);
      
      const uniqueCategories = ['All', ...new Set(response.data.services.map((s: any) => s.category))] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = serviceList;

    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleBook = (service: any) => {
    navigate('/book', { state: { service } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Services</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className="card hover:shadow-xl transition-shadow">
            <img
              src={service.image_url || 'https://via.placeholder.com/400'}
              alt={service.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="flex items-center justify-between mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {service.category}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
            <div className="flex justify-between items-center mt-auto">
              <div>
                <span className="text-gray-500 text-sm">Starting from</span>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{service.base_price.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleBook(service)}
                className="btn-primary"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No services found</p>
        </div>
      )}
    </div>
  );
};

export default Services;
