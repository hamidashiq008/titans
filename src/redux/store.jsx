import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import authReducer from './slices/AuthSlice'

// Configuration for redux-persist
const persistConfig = {
    // Use a slice-specific key since we're persisting only the auth slice
    key: 'auth',
    storage,
    // Persist only the fields we need from the auth slice
    whitelist: ['user', 'token']
}

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
    reducer: {
        auth: persistedReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
})

export const persistor = persistStore(store)