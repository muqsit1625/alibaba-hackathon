import { toast } from 'react-toastify';
import { createSlice } from '@reduxjs/toolkit';

import { RootState } from 'store';

import { getDateByTimeZone } from 'global/utils';

const notificationsMockData = [
  {
    notificationType: 'error',
    notificationTime: '2022-11-09 13:01:09.020818',
    notificationTitle: 'UNAUTHORIZED DRIVER',
    vehiclePlateNo: 'ABC-123',
    driverName: 'Driver A',
    location: 'Gulshan-e-Iqbal, Karachi',
  },
  {
    notificationType: 'warn',
    notificationTime: '2022-11-09 14:01:09.020818',
    notificationTitle: 'DROWSY DRIVER',
    vehiclePlateNo: 'ABC-123',
    driverName: 'Driver A',
    location: 'Gulshan-e-Iqbal',
  },
];

export type NotificationObjType = {
  notificationType: string;
  notificationTime: string;
  notificationTitle: string;
  vehiclePlateNo: string;
  driverName: string;
  location: string;
};
export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [] as NotificationObjType[],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = [...state.notifications, action.payload];
    },
    setMultiple: (state, action) => {
      return (state = {
        ...state,
        ...action.payload,
      });
    },
  },
});

export const { setNotifications, setMultiple } = notificationSlice.actions;
export const notificationSelector = (state: RootState) => state.notification;
export default notificationSlice.reducer;
