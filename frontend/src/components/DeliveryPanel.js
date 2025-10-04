import React, { useState } from "react";

const DeliveryPanel = ({
  hospitals,
  villages,
  medicineTypes,
  drones,
  deliveries,
  activeDelivery,
  onSendDrone,
}) => {
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const availableDrones = drones.filter(
    (drone) => drone.status === "available"
  );

  const handleSendDrone = async () => {
    if (!selectedHospital || !selectedVillage || !selectedMedicine) {
      setError("Please select all options");
      return;
    }

    if (availableDrones.length === 0) {
      setError("No drones available at the moment");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSendDrone(selectedHospital, selectedVillage, selectedMedicine);
      // Reset form after successful delivery
      setSelectedHospital("");
      setSelectedVillage("");
      setSelectedMedicine("");
    } catch (err) {
      setError("Failed to send drone. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "preparing":
        return "status-preparing";
      case "in-transit":
        return "status-in-transit";
      case "delivered":
        return "status-delivered";
      default:
        return "";
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Medical Delivery Control
        </h2>

        {/* Drone Status */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Drone Fleet Status
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available Drones:</span>
            <span className="font-bold text-blue-600">
              {availableDrones.length}/{drones.length}
            </span>
          </div>
        </div>

        {/* Delivery Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Hospital (Pickup)
            </label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!activeDelivery}
            >
              <option value="">-- Select Hospital --</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}, {hospital.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Village (Drop-off)
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!activeDelivery}
            >
              <option value="">-- Select Village --</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}, {village.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Medicine Type
            </label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!activeDelivery}
            >
              <option value="">-- Select Medicine --</option>
              {medicineTypes.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.icon} {medicine.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleSendDrone}
            disabled={
              isLoading || !!activeDelivery || availableDrones.length === 0
            }
            className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Processing..." : "Send Drone"}
          </button>
        </div>
      </div>

      {/* Active Delivery Status */}
      {activeDelivery && (
        <div className="mt-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Active Delivery
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Drone:</span>
              <span className="text-sm font-bold">
                {activeDelivery.droneName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Medicine:
              </span>
              <span className="text-sm">
                {activeDelivery.medicineIcon} {activeDelivery.medicine}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Route:</span>
              <span className="text-sm">
                {activeDelivery.hospital} → {activeDelivery.village}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span
                className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusClass(
                  activeDelivery.status
                )}`}
              >
                {activeDelivery.status.charAt(0).toUpperCase() +
                  activeDelivery.status.slice(1).replace("-", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">ETA:</span>
              <span className="text-sm font-bold">
                {activeDelivery.etaMinutes} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Arrival Time:
              </span>
              <span className="text-sm">
                {formatTime(activeDelivery.estimatedArrival)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery History */}
      {deliveries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Delivery History
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {deliveries
              .slice()
              .reverse()
              .map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {delivery.medicineIcon} {delivery.medicine}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusClass(
                            delivery.status
                          )}`}
                        >
                          {delivery.status.charAt(0).toUpperCase() +
                            delivery.status.slice(1).replace("-", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {delivery.hospital} → {delivery.village}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(delivery.startTime)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPanel;
