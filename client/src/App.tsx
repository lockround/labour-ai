import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { setCredentials, type UserRole } from './store/slices/authSlice';
import { setSelf, upsertOther } from './store/slices/locationSlice';
import { ThemeToggle } from './components/ThemeToggle';
import { io, type Socket } from 'socket.io-client';
import axios from 'axios';
import { GoogleMap } from './components/map/GoogleMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function App() {
	const dispatch = useDispatch();
	const auth = useSelector((s: RootState) => s.auth);
	const locations = useSelector((s: RootState) => s.location);
	const [role, setRole] = useState<UserRole>('labour');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [locationText, setLocationText] = useState('');
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!auth.user) return;
		socketRef.current = io(API_URL);
		const s = socketRef.current;
		s.on('location:receive', (payload: any) => {
			dispatch(upsertOther(payload));
		});
		return () => { s.disconnect(); };
	}, [auth.user]);

	useEffect(() => {
		if (!navigator.geolocation || !auth.user || !socketRef.current) return;
		const watchId = navigator.geolocation.watchPosition((pos) => {
			const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
			dispatch(setSelf(coords));
			socketRef.current!.emit('location:update', {
				id: auth.user!.id,
				role: auth.user!.role,
				position: coords,
				name: auth.user!.name,
			});
		});
		return () => navigator.geolocation.clearWatch(watchId);
	}, [auth.user, socketRef.current]);

	const markers = useMemo(() => {
		const list = Object.values(locations.others).map(o => ({ id: o.id, lat: o.position.lat, lng: o.position.lng, label: o.name }));
		if (locations.self) list.unshift({ id: 'me', lat: locations.self.lat, lng: locations.self.lng, label: 'Me' });
		return list;
	}, [locations]);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload: any = { name, phone, role };
		if (role === 'labour') payload.location = locationText;
		const res = await axios.post(`${API_URL}/auth/simple`, payload);
		dispatch(setCredentials(res.data));
	};

	return (
		<div className="min-h-screen container mx-auto p-4 flex flex-col gap-4">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Labour Connect</h1>
				<ThemeToggle />
			</header>

			{!auth.user && (
				<form onSubmit={submit} className="grid gap-4 max-w-xl">
					<div className="flex gap-2">
						<button type="button" onClick={() => setRole('labour')} className={`px-3 py-2 rounded-md border ${role==='labour'?'bg-primary text-primary-foreground':''}`}>Labour</button>
						<button type="button" onClick={() => setRole('seeker')} className={`px-3 py-2 rounded-md border ${role==='seeker'?'bg-primary text-primary-foreground':''}`}>Seeker</button>
					</div>
					<input className="border rounded-md px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
					<input className="border rounded-md px-3 py-2" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required />
					{role==='labour' && (
						<input className="border rounded-md px-3 py-2" placeholder="Location (area/city)" value={locationText} onChange={e=>setLocationText(e.target.value)} required />
					)}
					<button type="submit" className="px-3 py-2 rounded-md border bg-primary text-primary-foreground">Continue</button>
				</form>
			)}

			{auth.user && (
				<div className="grid gap-4">
					<div className="rounded-md border p-3">
						<div className="text-sm text-muted-foreground">Logged in as</div>
						<div className="font-medium">{auth.user.name} · {auth.user.role}</div>
					</div>
					<GoogleMap apiKey={MAPS_KEY} markers={markers} />
				</div>
			)}

			<footer className="mt-auto text-center text-xs text-muted-foreground">Built with React, Tailwind, Redux, Socket.IO</footer>
		</div>
	);
}
