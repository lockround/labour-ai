import { useEffect, useRef } from 'react';

export interface MarkerData { id: string; lat: number; lng: number; label?: string }

export function GoogleMap({ apiKey, markers }: { apiKey: string; markers: MarkerData[] }) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<google.maps.Map | null>(null);
	const markerInstances = useRef<Record<string, google.maps.Marker>>({});

	useEffect(() => {
		if (!mapRef.current) return;
		const existing = document.querySelector('script[data-google-maps]');
		if (!existing) {
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
			script.async = true;
			script.setAttribute('data-google-maps', 'true');
			document.head.appendChild(script);
			script.onload = init;
		} else {
			init();
		}

		function init() {
			if (mapInstance.current) return;
			mapInstance.current = new google.maps.Map(mapRef.current as HTMLDivElement, {
				center: { lat: markers[0]?.lat || 0, lng: markers[0]?.lng || 0 },
				zoom: 13,
				mapId: 'DEMO_MAP',
			});
		}
	}, []);

	useEffect(() => {
		if (!mapInstance.current) return;
		markers.forEach(m => {
			const existing = markerInstances.current[m.id];
			if (existing) {
				existing.setPosition({ lat: m.lat, lng: m.lng });
				if (m.label) existing.setLabel(m.label);
			} else {
				const mk = new google.maps.Marker({
					position: { lat: m.lat, lng: m.lng },
					map: mapInstance.current!,
					label: m.label
				});
				markerInstances.current[m.id] = mk;
			}
		});
	}, [markers]);

	return <div ref={mapRef} className="w-full h-[400px] rounded-md border" />
}