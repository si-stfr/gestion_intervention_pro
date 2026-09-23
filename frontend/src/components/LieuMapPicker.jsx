import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [16.258666, -61.268513]; // Guadeloupe
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 15;

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

function RecenterOnSelect({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, SELECTED_ZOOM);
    }
  }, [position, map]);

  return null;
}

function ClickToPlaceMarker({ onPlace }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function LieuMapPicker({ value, onChange }) {
  const { lieu = "", latitude = null, longitude = null } = value || {};

  const [query, setQuery] = useState(lieu || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const position =
    latitude != null && longitude != null ? [latitude, longitude] : null;

  useEffect(() => {
    setQuery(lieu || "");
  }, [lieu]);

  const handleQueryChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange({ lieu: next, latitude, longitude });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            next
          )}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  const selectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    setQuery(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({ lieu: s.display_name, latitude: lat, longitude: lon });
  };

  const placeMarker = async (lat, lon) => {
    const label = await reverseGeocode(lat, lon);
    setQuery(label);
    onChange({ lieu: label, latitude: lat, longitude: lon });
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    placeMarker(lat, lng);
  };

  return (
    <div className="lieu-map-picker">
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Rechercher une adresse ou cliquer sur la carte..."
        className="lieu-map-search"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="lieu-map-suggestions">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              className="lieu-map-suggestion"
              onMouseDown={() => selectSuggestion(s)}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}

      <div className="lieu-map-container">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? SELECTED_ZOOM : DEFAULT_ZOOM}
          style={{ height: "260px", width: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlaceMarker onPlace={placeMarker} />
          <RecenterOnSelect position={position} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{ dragend: handleMarkerDragEnd }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
