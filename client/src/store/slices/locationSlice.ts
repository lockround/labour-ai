import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LatLng { lat: number; lng: number }
interface LiveLocationState {
	self?: LatLng;
	others: Record<string, { id: string; role: 'labour'|'seeker'; position: LatLng; name: string }>;
}

const initialState: LiveLocationState = { others: {} };

const locationSlice = createSlice({
	name: 'location',
	initialState,
	reducers: {
		setSelf(state, action: PayloadAction<LatLng>) { state.self = action.payload; },
		upsertOther(state, action: PayloadAction<{ id: string; role: 'labour'|'seeker'; position: LatLng; name: string }>) {
			const o = action.payload; state.others[o.id] = o;
		},
		removeOther(state, action: PayloadAction<string>) { delete state.others[action.payload]; }
	}
});

export const { setSelf, upsertOther, removeOther } = locationSlice.actions;
export default locationSlice.reducer;