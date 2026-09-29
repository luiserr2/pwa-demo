'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RadiobaseUbicacion {
  id: string;
  codigo: string;
  nombre: string;
  region: string;
  tecnologia: string;
  tipoTorre: string;
  estado: 'OPERATIVA' | 'MANTENIMIENTO' | 'ALERTA';
  lat: number;
  lng: number;
  alturaMetros: number;
  ultimoMantenimiento?: string;
  potenciaKw?: number;
}

interface RadiobasesMapProps {
  radiobases: RadiobaseUbicacion[];
  selectedId: string | null;
  onSelectRadiobase: (rb: RadiobaseUbicacion) => void;
}

export default function RadiobasesMapLeaflet({
  radiobases,
  selectedId,
  onSelectRadiobase,
}: RadiobasesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center in South America / Argentina / Regional Telecom Hub
    const defaultCenter: [number, number] = [-34.6037, -58.3816];
    const initialZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false,
    });

    // High quality, fast, free CartoDB Voyager Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Subtle attribution in bottom right corner
    L.control
      .attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; CARTO')
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when radiobases change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds: [number, number][] = [];

    radiobases.forEach((rb) => {
      bounds.push([rb.lat, rb.lng]);

      const isOperativa = rb.estado === 'OPERATIVA';
      const isMantenimiento = rb.estado === 'MANTENIMIENTO';
      
      const pinColor = isOperativa ? '#10b981' : isMantenimiento ? '#f59e0b' : '#ef4444';
      const pulseColor = isOperativa ? 'bg-emerald-400' : isMantenimiento ? 'bg-amber-400' : 'bg-rose-400';
      const statusBadge = isOperativa
        ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">OPERATIVA</span>'
        : isMantenimiento
        ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">EN MANTENIMIENTO</span>'
        : '<span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">ALERTA REQUERIDA</span>';

      // Custom Telecom Antenna Marker HTML
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div style="background-color: ${pinColor};" class="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/25 border-2 border-white transform transition-transform duration-200 group-hover:scale-110">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 22h16"></path>
              <path d="M12 2v20"></path>
              <path d="m7 7 5-5 5 5"></path>
              <path d="m8 12 4-4 4 4"></path>
              <path d="m9 17 3-3 3 3"></path>
            </svg>
            <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white ${pulseColor}"></span>
            </span>
          </div>
          <div class="absolute -bottom-6 bg-slate-900/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap opacity-90 group-hover:opacity-100">
            ${rb.codigo}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'telecom-custom-marker',
        html: iconHtml,
        iconSize: [36, 48],
        iconAnchor: [18, 24],
        popupAnchor: [0, -26],
      });

      const popupContent = `
        <div class="p-1 font-sans text-slate-800 min-w-[220px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
            <div>
              <span class="text-[10px] font-mono font-bold text-slate-500 uppercase">${rb.codigo}</span>
              <h4 class="text-sm font-black text-slate-900 leading-tight">${rb.nombre}</h4>
            </div>
            ${statusBadge}
          </div>
          
          <div class="space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span class="text-slate-500">Región:</span>
              <strong class="text-slate-800 font-semibold">${rb.region}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tecnología:</span>
              <strong class="text-slate-800 font-semibold">${rb.tecnologia}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tipo Torre:</span>
              <strong class="text-slate-800 font-semibold">${rb.tipoTorre} (${rb.alturaMetros}m)</strong>
            </div>
            <div class="flex justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-400">
              <span>GPS: ${rb.lat.toFixed(4)}, ${rb.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([rb.lat, rb.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: true,
          className: 'telecom-leaflet-popup',
        });

      marker.on('click', () => {
        onSelectRadiobase(rb);
      });

      markersRef.current.set(rb.id, marker);
    });

    if (bounds.length > 0 && !selectedId) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [radiobases]);

  // Fly to selected Radiobase when selected from external sidebar
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const targetRb = radiobases.find((r) => r.id === selectedId);
    if (!targetRb) return;

    map.flyTo([targetRb.lat, targetRb.lng], 14, {
      duration: 1.2,
    });

    const marker = markersRef.current.get(selectedId);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedId, radiobases]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[550px]" />
    </div>
  );
}
