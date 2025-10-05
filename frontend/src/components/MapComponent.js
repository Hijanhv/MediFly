import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapComponent = ({
  hospitals,
  villages,
  dronePosition,
  activeDelivery,
}) => {
  const [map, setMap] = useState(null);

  // Center of India (Pune, Maharashtra)
  const centerPosition = [18.5204, 73.8567];

  // Custom icons for hospitals and villages
  const hospitalIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const villageIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const droneIcon = new L.DivIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full shadow-lg drone-pulse">
             <span class="text-white text-sm">🚁</span>
           </div>`,
    className: "custom-drone-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Update map view when drone position changes
  useEffect(() => {
    if (map && dronePosition) {
      map.flyTo(dronePosition, 12, {
        duration: 2,
      });
    }
  }, [dronePosition, map]);

  // Get marker position from database coordinates
  const getMarkerPosition = (item) => {
    if (item.latitude && item.longitude) {
      return [parseFloat(item.latitude), parseFloat(item.longitude)];
    }
    // Fallback to center if coordinates are missing
    return centerPosition;
  };

  return (
    <div className="h-96 lg:h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={centerPosition}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Hospital markers - Note: Hospitals now use pincode, coordinates not available */}
        {hospitals
          .filter((hospital) => hospital.latitude && hospital.longitude)
          .map((hospital) => (
            <Marker
              key={hospital.id}
              position={getMarkerPosition(hospital)}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-blue-600">{hospital.name}</h3>
                  <p className="text-sm text-gray-600">
                    {hospital.city_name || "Unknown City"}
                  </p>
                  {hospital.address && (
                    <p className="text-xs text-gray-500">{hospital.address}</p>
                  )}
                  {hospital.pincode && (
                    <p className="text-xs text-gray-500">
                      Pincode: {hospital.pincode}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Medical Facility</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Village markers */}
        {villages.map((village) => (
          <Marker
            key={village.id}
            position={getMarkerPosition(village)}
            icon={villageIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-green-600">{village.name}</h3>
                <p className="text-sm text-gray-600">
                  {village.city_name || "Unknown City"}
                </p>
                {village.population && (
                  <p className="text-xs text-gray-500">
                    Population: {village.population}
                  </p>
                )}
                <p className="text-xs text-gray-500">Delivery Location</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drone marker */}
        {dronePosition && (
          <Marker position={dronePosition} icon={droneIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-red-600">
                  {activeDelivery?.droneName || "MediDrone"}
                </h3>
                <p className="text-sm text-gray-600">
                  Status: {activeDelivery?.status || "In Transit"}
                </p>
                {activeDelivery && (
                  <p className="text-xs text-gray-500">
                    Delivering: {activeDelivery.medicine}{" "}
                    {activeDelivery.medicineIcon}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
