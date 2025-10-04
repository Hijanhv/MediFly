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
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchDeliveries, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [hospitalsRes, villagesRes, medicineRes, deliveriesRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/hospitals`),
          axios.get(`${API_URL}/api/villages`),
          axios.get(`${API_URL}/api/medicine-types`),
          axios.get(`${API_URL}/api/deliveries`),
        ]);

      setHospitals(hospitalsRes.data);
      setVillages(villagesRes.data);
      setMedicineTypes(medicineRes.data);
      setDeliveries(deliveriesRes.data);

      // Find active delivery
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
      const response = await axios.get(`${API_URL}/api/deliveries`);
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
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/deliveries`, {
        hospital_id: selectedHospital,
        village_id: selectedVillage,
        medicine_type_id: selectedMedicine,
        priority,
        notes,
      });

      // Reset form
      setSelectedHospital("");
      setSelectedVillage("");
      setSelectedMedicine("");
      setPriority("normal");
      setNotes("");

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
    if (!window.confirm("Are you sure you want to cancel this delivery?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/deliveries/${deliveryId}`);
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      "in-transit": "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Center of India (Pune, Maharashtra)
  const centerPosition = [18.5204, 73.8567];

  const dronePosition = activeDelivery
    ? centerPosition // Use center position for drone since we don't have coordinates
    : null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Map */}
      <div className="w-full lg:w-2/3 p-4">
        <MapComponent
          hospitals={hospitals}
          villages={villages}
          dronePosition={dronePosition}
          activeDelivery={activeDelivery}
        />
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-1/3 p-4 bg-white shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Request Medical Delivery
        </h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital (Pickup)
            </label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading || activeDelivery}
            >
              <option value="">-- Select Hospital --</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} {hospital.city ? `(${hospital.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Village (Delivery)
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading || activeDelivery}
            >
              <option value="">-- Select Village --</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name} {village.city ? `(${village.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Type
            </label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || activeDelivery}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Any special instructions..."
              disabled={isLoading || activeDelivery}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || activeDelivery}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Requesting..." : "Request Delivery"}
          </button>
        </form>

        {/* Active Delivery */}
        {activeDelivery && (
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Active Delivery
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Status:
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusColor(
                    activeDelivery.status
                  )}`}
                >
                  {activeDelivery.status.toUpperCase().replace("-", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Medicine:
                </span>
                <span className="text-sm">
                  {activeDelivery.medicine_icon} {activeDelivery.medicine_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Route:
                </span>
                <span className="text-sm text-right">
                  {activeDelivery.hospital_name} → {activeDelivery.village_name}
                </span>
              </div>
              {activeDelivery.drone_name && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Drone:
                  </span>
                  <span className="text-sm">{activeDelivery.drone_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">ETA:</span>
                <span className="text-sm font-bold">
                  {activeDelivery.eta_minutes} min
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            My Deliveries
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {deliveries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No deliveries yet. Request one above!
              </p>
            ) : (
              deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium">
                        {delivery.medicine_icon} {delivery.medicine_name}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {delivery.hospital_name} → {delivery.village_name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {delivery.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {new Date(delivery.created_at).toLocaleString()}
                    </span>
                    {["pending", "preparing"].includes(delivery.status) && (
                      <button
                        onClick={() => cancelDelivery(delivery.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
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
