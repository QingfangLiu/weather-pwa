import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type LatLngTuple = [number, number]

function CenterAndLocate({ center }: { center: LatLngTuple }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c: LatLngTuple = [pos.coords.latitude, pos.coords.longitude]
          map.setView(c)
        },
        () => {
          // fallback silently
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      )
    }
  }, [center, map])

  return null
}

export default function MapView() {
  const center: LatLngTuple = [27.5146, 90.4336]
  const [alertData, setAlertData] = useState<any>(null)

  useEffect(() => {
    // Load mock alert data
    fetch('/src/data/mockAlert.geojson')
      .then((res) => res.json())
      .then((data) => setAlertData(data))
      .catch((err) => console.error('Failed to load alert data', err))
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Reactively set view and location on load */}
      <CenterAndLocate center={center} />

      <Marker position={center}>
        <Popup>You are here</Popup>
      </Marker>

      {alertData && (
        <GeoJSON
          data={alertData}
          style={() => ({ color: '#f59e0b', weight: 2, fillOpacity: 0.15 })}
          onEachFeature={(feature, layer) => {
            const p = feature.properties
            layer.bindPopup(`${p.event} (${p.severity})<br/>${p.instructions}`)
          }}
        />
      )}
    </MapContainer>
  )
}
