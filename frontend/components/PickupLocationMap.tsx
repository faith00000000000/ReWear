"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths — Leaflet's default icon lookup breaks
// under Webpack/Next.js bundling, so we point it at the CDN assets instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]; // Kathmandu fallback

interface PickupLocationMapProps {
    lat: number | null;
    lng: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], Math.max(map.getZoom(), 15));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng]);
    return null;
}

export default function PickupLocationMap({
                                              lat,
                                              lng,
                                              onLocationSelect,
                                          }: PickupLocationMapProps) {
    const hasPin = lat !== null && lng !== null;
    const center: [number, number] = hasPin ? [lat as number, lng as number] : DEFAULT_CENTER;
    const markerRef = useRef<L.Marker | null>(null);

    return (
        <MapContainer
            center={center}
            zoom={hasPin ? 15 : 12}
            scrollWheelZoom={false}
            style={{ height: "220px", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onSelect={onLocationSelect} />
            {hasPin && (
                <>
                    <Marker
                        position={[lat as number, lng as number]}
                        draggable
                        ref={markerRef}
                        eventHandlers={{
                            dragend: () => {
                                const marker = markerRef.current;
                                if (marker) {
                                    const pos = marker.getLatLng();
                                    onLocationSelect(pos.lat, pos.lng);
                                }
                            },
                        }}
                    />
                    <RecenterMap lat={lat as number} lng={lng as number} />
                </>
            )}
        </MapContainer>
    );
}