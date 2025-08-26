import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
	console.log('socket connected', socket.id);
	// Receive location updates and broadcast to others
	socket.on('location:update', (payload: any) => {
		socket.broadcast.emit('location:receive', payload);
	});

	socket.on('disconnect', () => {
		console.log('socket disconnected', socket.id);
	});
});

// Simple auth: phone + name (+ location for labour) -> returns jwt-less token for demo
app.post('/auth/simple', (req, res) => {
	const { name, phone, role, location } = req.body || {};
	if (!name || !phone || !role) {
		return res.status(400).json({ error: 'name, phone, role are required' });
	}
	if (role === 'labour' && !location) {
		return res.status(400).json({ error: 'location required for labour' });
	}
	const id = randomUUID();
	// For demo we do not verify OTP; generate a pseudo token
	const token = Buffer.from(`${id}:${phone}`).toString('base64');
	return res.json({
		user: { id, name, phone, role },
		token,
	});
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`server listening on ${PORT}`);
});