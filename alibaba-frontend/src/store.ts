import { configureStore, Action } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { ThunkAction } from 'redux-thunk';

import { apiSlice } from 'redux/apiSlice';

import anomalies from 'redux/anomalies/anomaliesSlice';
import auth from './redux/auth/authSlice';
import driver from './redux/driver/driverSlice';
import mapOverview from './redux/mapOverview/mapOverviewSlice';
import notification from 'redux/notification/notificationSlice';
import vehicle from './redux/vehicle/vehicleSlice';

const store = configureStore({
  reducer: {
    anomalies,
    auth,
    driver,
    mapOverview,
    notification,
    vehicle,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch();
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;

export default store;
