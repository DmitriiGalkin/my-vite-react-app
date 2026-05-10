import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import './PlaceSelectPage.css'
import { places } from './mocks'

function PlaceSelectPage() {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0].id)

  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) {
        return
      }

      const { default: L } = await import('leaflet')

      if (!isMounted || !mapRef.current) {
        return
      }

      const placeIcon = L.divIcon({
        className: 'place-osm-marker',
        html: '<span>📍</span>',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36],
      })

      const map = L.map(mapRef.current, {
        center: [55.755864, 37.617698],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      markersRef.current = places.map((place) => {
        const marker = L.marker([place.latitude, place.longitude], {
          icon: placeIcon,
          title: place.title,
        })
            .addTo(map)
            .bindPopup(`
          <div class="place-popup">
            <strong>${place.title}</strong>
            <span>${place.address}</span>
          </div>
        `)

        marker.on('click', () => {
          setSelectedPlaceId(place.id)
          map.setView([place.latitude, place.longitude], 14)
        })

        return marker
      })
    }

    initMap()

    return () => {
      isMounted = false
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) || places[0]

  const handlePlaceClick = (placeId: number) => {
    const place = places.find((place) => place.id === placeId)

    if (!place) {
      return
    }

    setSelectedPlaceId(place.id)

    mapInstanceRef.current?.setView([place.latitude, place.longitude], 14)

    const marker = markersRef.current.find((marker) => {
      const position = marker.getLatLng()

      return position.lat === place.latitude && position.lng === place.longitude
    })

    marker?.openPopup()
  }

  return (
      <main className="place-select-page">
        <header className="place-select-header">
          <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
            ←
          </button>
          <div>
            <h1>Выбор места</h1>
            <p>Выберите площадку для проведения проекта</p>
          </div>
        </header>

        <section className="place-map-card">
          <div className="place-map" ref={mapRef} />
        </section>

        <section className="place-selected-card">
          <div>
            <span>Выбранное место</span>
            <h2>{selectedPlace.title}</h2>
            <p>{selectedPlace.address}</p>
          </div>
          <button type="button" onClick={() => navigate('/project/1/edit')}>
            Выбрать
          </button>
        </section>

        <section className="place-list">
          <h2>Доступные места</h2>

          {places.map((place) => (
              <article
                  className={`place-card ${selectedPlaceId === place.id ? 'place-card-selected' : ''}`}
                  key={place.id}
              >
                <button
                    className="place-card-main"
                    type="button"
                    onClick={() => handlePlaceClick(place.id)}
                >
                  <span className="place-card-icon">📍</span>

                  <span className="place-card-content">
                <strong>{place.title}</strong>
                <small>{place.description}</small>
                <em>{place.address}</em>
              </span>
                </button>

                <div className="place-card-action">
                  <button type="button" onClick={() => navigate('/project/1/edit')}>
                    Выбрать
                  </button>
                </div>
              </article>
          ))}
        </section>
      </main>
  )
}

export default PlaceSelectPage