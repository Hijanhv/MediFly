import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const OperatorPanel = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/deliveries`);
      setDeliveries(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch deliveries');
      setLoading(false);
    }
  };

  const assignDelivery = async (deliveryId) => {
    try {
      await axios.patch(`${API_URL}/api/deliveries/${deliveryId}/assign`);
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign delivery');
    }
  };

  const updateStatus = async (deliveryId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/deliveries/${deliveryId}/status`, {
        status: newStatus
      });
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      emergency: 'text-red-600 font-bold'
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Delivery Operations</h2>
        <p className="text-gray-600">Manage and track drone deliveries</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'preparing', 'in-transit', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            <span className="ml-2 text-sm">
              ({deliveries.filter((d) => status === 'all' || d.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Deliveries Grid */}
      <div className="grid gap-4">
        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No deliveries found
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      Delivery #{delivery.id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {delivery.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`text-sm ${getPriorityColor(delivery.priority)}`}>
                      ⚡ {delivery.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(delivery.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Medicine</p>
                  <p className="text-lg">
                    {delivery.medicine_icon} {delivery.medicine_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Route</p>
                  <p className="text-gray-800">
                    {delivery.hospital_name} → {delivery.village_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Distance</p>
                  <p className="text-gray-800">{delivery.distance_km} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">ETA</p>
                  <p className="text-gray-800">{delivery.eta_minutes} minutes</p>
                </div>
                {delivery.drone_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Drone</p>
                    <p className="text-gray-800">
                      {delivery.drone_name} ({delivery.battery_level}% battery)
                    </p>
                  </div>
                )}
                {delivery.user_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Requested By</p>
                    <p className="text-gray-800">{delivery.user_name}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {delivery.status === 'pending' && (
                  <button
                    onClick={() => assignDelivery(delivery.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign & Prepare
                  </button>
                )}
                {delivery.status === 'preparing' && (
                  <button
                    onClick={() => updateStatus(delivery.id, 'in-transit')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Launch Drone
                  </button>
                )}
                {delivery.status === 'in-transit' && (
                  <button
                    onClick={() => updateStatus(delivery.id, 'delivered')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                {['pending', 'preparing'].includes(delivery.status) && (
                  <button
                    onClick={() => updateStatus(delivery.id, 'failed')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Mark as Failed
                  </button>
                )}
              </div>

              {delivery.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-800">{delivery.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OperatorPanel;