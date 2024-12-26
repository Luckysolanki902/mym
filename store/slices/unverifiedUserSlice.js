// store/slices/unverifiedUserSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const unverifiedUserSlice = createSlice({
    name: 'unverifiedUser',
    initialState: {
        userDetails: null,
        lastSaved: null,
    },
    reducers: {
        saveUnverifiedUserDetails: (state, action) => {
            state.userDetails = action.payload;
            state.lastSaved = Date.now();
        },
    },
});

export const { saveUnverifiedUserDetails } = unverifiedUserSlice.actions;

export default unverifiedUserSlice.reducer;
