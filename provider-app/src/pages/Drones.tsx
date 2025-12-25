import React, { useEffect, useState } from 'react';
import { drones } from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Drones: React.FC = () => {
  const [droneList, setDroneList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDrone, setEditingDrone] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price_per_hour: '',
    available: 1,
    specs: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await drones.getAll();
      setDroneList(response.data.drones);
    } catch (error) {
      console.error('Failed to fetch drones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const droneData = {
        ...formData,
        price_per_hour: parseFloat(formData.price_per_hour),
      };

      if (editingDrone) {
        await drones.update(editingDrone.id, droneData);
      } else {
        await drones.create(droneData);
      }

      await fetchDrones();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save drone:', error);
      alert('Failed to save drone');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drone: any) => {
    setEditingDrone(drone);
    setFormData({
      name: drone.name,
      type: drone.type,
      price_per_hour: drone.price_per_hour.toString(),
      available: drone.available,
      specs: drone.specs || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this drone?')) return;

    try {
      await drones.delete(id);
      await fetchDrones();
    } catch (error) {
      console.error('Failed to delete drone:', error);
      alert('Failed to delete drone');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      price_per_hour: '',
      available: 1,
      specs: '',
    });
    setEditingDrone(null);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Drones</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} />
          <span>Add Drone</span>
        </button>
      </div>

      {/* Drones Grid */}
      {droneList.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-xl text-gray-600 mb-4">No drones added yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Add Your First Drone
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {droneList.map(drone => (
            <div key={drone.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{drone.name}</h3>
                  <p className="text-gray-600">{drone.type}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(drone)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(drone.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{drone.price_per_hour}/hour
                </p>
                {drone.specs && (
                  <p className="text-sm text-gray-600">{drone.specs}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  drone.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {drone.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingDrone ? 'Edit Drone' : 'Add New Drone'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Drone Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="DJI Mavic 3 Pro"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Camera Drone">Camera Drone</option>
                  <option value="Mapping Drone">Mapping Drone</option>
                  <option value="Agriculture Drone">Agriculture Drone</option>
                  <option value="Cinema Drone">Cinema Drone</option>
                  <option value="FPV Drone">FPV Drone</option>
                  <option value="Delivery Drone">Delivery Drone</option>
                  <option value="Inspection Drone">Inspection Drone</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Price per Hour (₹) *</label>
                <input
                  type="number"
                  step="100"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  className="input"
                  placeholder="3000"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Specifications</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="4K Camera, 46min flight, 15km range"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available === 1}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700">Available for booking</span>
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingDrone ? 'Update' : 'Add Drone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drones;
