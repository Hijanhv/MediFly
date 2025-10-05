import React, { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "./MapComponent";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const UserDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [dronePosition, setDronePosition] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchDeliveries, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeDelivery?.status === "in-transit") {
      const start = {
        lat: activeDelivery.village_lat,
        lng: activeDelivery.village_lng,
      };
      const end = {
        lat: activeDelivery.hospital_latitude,
        lng: activeDelivery.hospital_longitude,
      };
      animateDrone(start, end);
    }
  }, [activeDelivery]);

  const animateDrone = (start, end) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      if (progress >= 1) {
        clearInterval(interval);
        setDronePosition(null);
        return;
      }
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;
      setDronePosition({ lat, lng });
    }, 100);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [hospitalsRes, villagesRes, medicineRes, deliveriesRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/hospitals`, config),
          axios.get(`${API_URL}/api/villages`, config),
          axios.get(`${API_URL}/api/medicine-types`, config),
          axios.get(`${API_URL}/api/deliveries`, config),
        ]);

      setHospitals(hospitalsRes.data);
      setVillages(villagesRes.data);
      setMedicineTypes(medicineRes.data);
      setDeliveries(deliveriesRes.data);

      const active = deliveriesRes.data.find((d) =>
        ["preparing", "in-transit"].includes(d.status)
      );
      setActiveDelivery(active || null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(response.data);

      const active = response.data.find((d) =>
        ["preparing", "in-transit"].includes(d.status)
      );
      setActiveDelivery(active || null);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/deliveries`,
        {
          hospital_id: selectedHospital,
          village_id: selectedVillage,
          medicine_type_id: selectedMedicine,
          priority,
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("🎉 Delivery request created successfully!");
      setSelectedHospital("");
      setSelectedVillage("");
      setSelectedMedicine("");
      setPriority("normal");
      setNotes("");

      setTimeout(() => setSuccess(""), 5000);
      await fetchDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create delivery request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelivery = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to cancel this delivery?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeliveries();
    } catch (error) {
      console.error("Error cancelling delivery:", error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "status-pending", icon: "⏳", text: "Pending" },
      preparing: { class: "status-preparing", icon: "📦", text: "Preparing" },
      "in-transit": {
        class: "status-in-transit",
        icon: "🚁",
        text: "In Transit",
      },
      delivered: { class: "status-delivered", icon: "✅", text: "Delivered" },
      cancelled: { class: "status-cancelled", icon: "❌", text: "Cancelled" },
      failed: { class: "status-failed", icon: "⚠️", text: "Failed" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge ${badge.class}`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      emergency: { class: "priority-emergency", icon: "🚨", text: "Emergency" },
      high: { class: "priority-high", icon: "⚡", text: "High" },
      normal: { class: "priority-normal", icon: "📋", text: "Normal" },
      low: { class: "priority-low", icon: "📌", text: "Low" },
    };
    const badge = badges[priority] || badges.normal;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${badge.class}`}
      >
        {badge.icon} {badge.text}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
      {/* Map Section */}
      <div className="w-full lg:w-2/3">
        <div className="card h-[600px] p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🗺️</span>
            <span>Delivery Map</span>
          </h2>
          <MapComponent
            hospitals={hospitals}
            villages={villages}
            dronePosition={dronePosition}
            activeDelivery={activeDelivery}
          />
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-1/3 space-y-6">
        {/* Request Form Card */}
        <div className="card p-6 slide-in-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <span className="text-3xl">🚁</span>
            <span>New Delivery Request</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hospital Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🏥</span> Pickup Hospital
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="input-modern"
                required
                disabled={isLoading || activeDelivery}
              >
                <option value="">-- Select Hospital --</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}{" "}
                    {hospital.pincode ? `📍 ${hospital.pincode}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🏘️</span> Delivery Location
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="input-modern"
                required
                disabled={isLoading || activeDelivery}
              >
                <option value="">-- Select Village --</option>
                {villages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicine Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>💊</span> Medicine Type
              </label>
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="input-modern"
                required
                disabled={isLoading || activeDelivery}
              >
                <option value="">-- Select Medicine --</option>
                {medicineTypes.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.icon} {medicine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>⚡</span> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-modern"
                disabled={isLoading || activeDelivery}
              >
                <option value="low">📌 Low Priority</option>
                <option value="normal">📋 Normal Priority</option>
                <option value="high">⚡ High Priority</option>
                <option value="emergency">🚨 Emergency</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>📝</span> Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-modern"
                rows="3"
                placeholder="Any special instructions..."
                disabled={isLoading || activeDelivery}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-medium fade-in">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-sm font-medium fade-in">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || activeDelivery}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : activeDelivery ? (
                "🚁 Delivery in Progress"
              ) : (
                "🚀 Request Delivery"
              )}
            </button>
          </form>
        </div>

        {/* Deliveries List Card */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span>My Deliveries</span>
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {deliveries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-medium">No deliveries yet</p>
                <p className="text-sm">
                  Create your first delivery request above!
                </p>
              </div>
            ) : (
              deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-4 border-2 border-slate-100 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(delivery.status)}
                        {getPriorityBadge(delivery.priority)}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        ID: #{delivery.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">🏥 From:</span>
                      <span>Hospital {delivery.hospital_id}</span>
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">🏘️ To:</span>
                      <span>Village {delivery.village_id}</span>
                    </p>
                    {delivery.notes && (
                      <p className="text-gray-600 italic flex items-start gap-2">
                        <span className="font-semibold">💬</span>
                        <span>{delivery.notes}</span>
                      </p>
                    )}
                  </div>

                  {delivery.status === "pending" && (
                    <button
                      onClick={() => cancelDelivery(delivery.id)}
                      className="mt-4 w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ❌ Cancel Request
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
