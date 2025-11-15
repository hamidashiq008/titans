import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios/Axios';
import { toast } from 'react-toastify';

// Async thunk for login

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            // localStorage.setItem('access_token', res.data.access_token);
            toast.success('Logged in successfully');
            return res.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Login failed');
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};
// console.log("user",initialState?.user   )
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            // localStorage.removeItem('access_token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                console.log("user",action.payload.user)
                state.token = action.payload.access_token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Login failed';
            });
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;