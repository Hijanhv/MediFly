import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("cities");
  const [data, setData] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const tabs = [
    { id: "cities", label: "Cities", icon: "🏙️" },
    { id: "hospitals", label: "Hospitals", icon: "🏥" },
    { id: "villages", label: "Villages", icon: "🏘️" },
    { id: "medicine-types", label: "Medicines", icon: "💊" },
    { id: "drones", label: "Drones", icon: "🚁" },
  ];

  useEffect(() => {
    fetchData();
    fetchCities();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [activeTab]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/cities`);
      setCities(response.data);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/${activeTab}`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingItem) {
        await axios.put(
          `${API_URL}/api/admin/${activeTab}/${editingItem.id}`,
          formData
        );
      } else {
        await axios.post(`${API_URL}/api/admin/${activeTab}`, formData);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Operation failed";
      alert(errorMessage);
      console.error("Form submission error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/${activeTab}/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (activeTab === "cities") {
      if (!formData.name?.trim()) {
        errors.name = "City name is required";
      }
    } else if (activeTab === "hospitals") {
      if (!formData.name?.trim()) {
        errors.name = "Hospital name is required";
      }
      if (!formData.city_id) {
        errors.city_id = "Please select a city";
      }
      if (
        formData.contact_number &&
        !/^[+]?[\d\s-()]+$/.test(formData.contact_number)
      ) {
        errors.contact_number = "Please enter a valid contact number";
      }
    } else if (activeTab === "villages") {
      if (!formData.name?.trim()) {
        errors.name = "Village name is required";
      }
      if (!formData.city_id) {
        errors.city_id = "Please select a city";
      }
      if (
        formData.population &&
        (formData.population < 0 ||
          !Number.isInteger(Number(formData.population)))
      ) {
        errors.population = "Population must be a positive integer";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderForm = () => {
    switch (activeTab) {
      case "cities":
        return (
          <>
            <div>
              <input
                type="text"
                placeholder="e.g., Pune"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mb-3">{formErrors.name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="e.g., Maharashtra"
                value={formData.state || ""}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg mb-3"
              />
            </div>
          </>
        );
      case "hospitals":
        return (
          <>
            <div>
              <input
                type="text"
                placeholder="e.g., Sassoon General Hospital"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mb-3">{formErrors.name}</p>
              )}
            </div>
            <div>
              <select
                value={formData.city_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city_id: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.city_id ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
              {formErrors.city_id && (
                <p className="text-red-500 text-xs mb-3">
                  {formErrors.city_id}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="e.g., Wanowrie, Pune - 411040"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg mb-3"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="e.g., +91-20-2612-8000"
                value={formData.contact_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.contact_number
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formErrors.contact_number && (
                <p className="text-red-500 text-xs mb-3">
                  {formErrors.contact_number}
                </p>
              )}
            </div>
          </>
        );
      case "villages":
        return (
          <>
            <div>
              <input
                type="text"
                placeholder="e.g., Wagholi"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mb-3">{formErrors.name}</p>
              )}
            </div>
            <div>
              <select
                value={formData.city_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city_id: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.city_id ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
              {formErrors.city_id && (
                <p className="text-red-500 text-xs mb-3">
                  {formErrors.city_id}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={formData.population || ""}
                onChange={(e) =>
                  setFormData({ ...formData, population: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg mb-1 ${
                  formErrors.population ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.population && (
                <p className="text-red-500 text-xs mb-3">
                  {formErrors.population}
                </p>
              )}
            </div>
          </>
        );
      case "medicine-types":
        return (
          <>
            <input
              type="text"
              placeholder="Medicine Name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
              required
            />
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={formData.icon || ""}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />
            <textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
              rows="3"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requires_refrigeration || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requires_refrigeration: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Requires Refrigeration
            </label>
          </>
        );
      case "drones":
        return (
          <>
            <input
              type="text"
              placeholder="Drone Name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
              required
            />
            <input
              type="text"
              placeholder="Model"
              value={formData.model || ""}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />
            <select
              value={formData.status || "available"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
            >
              <option value="available">Available</option>
              <option value="delivering">Delivering</option>
              <option value="maintenance">Maintenance</option>
              <option value="charging">Charging</option>
            </select>
            <input
              type="number"
              placeholder="Battery Level (0-100)"
              value={formData.battery_level || 100}
              onChange={(e) =>
                setFormData({ ...formData, battery_level: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
              min="0"
              max="100"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max Payload (kg)"
              value={formData.max_payload_kg || 5}
              onChange={(e) =>
                setFormData({ ...formData, max_payload_kg: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max Range (km)"
              value={formData.max_range_km || 50}
              onChange={(e) =>
                setFormData({ ...formData, max_range_km: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h2>
        <p className="text-gray-600">Manage system data</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Button */}
      <button
        onClick={() => openModal()}
        className="mb-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        + Add New
      </button>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                {(activeTab === "hospitals" || activeTab === "villages") && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    City
                  </th>
                )}
                {activeTab === "drones" && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Battery
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.icon} {item.name}
                  </td>
                  {(activeTab === "hospitals" || activeTab === "villages") && (
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.city_name}
                    </td>
                  )}
                  {activeTab === "drones" && (
                    <>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.battery_level}%
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? "Edit" : "Add New"} {activeTab.replace("-", " ")}
            </h3>
            <form onSubmit={handleSubmit}>
              {renderForm()}
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
