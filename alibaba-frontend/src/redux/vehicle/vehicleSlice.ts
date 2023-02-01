// @ts-ignore
// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { RootState } from 'store';

import { extendedApiSlice } from 'redux/endpoints/vehicles';

export const vehicleSlice: any = createSlice({
  name: 'vehicle',
  initialState: {
    pageNo: 0,
    noOfItems: 10,
    vehicle: null,
    metaData: {},
  },
  reducers: {
    setVehiclePageNo: (state, action) => {
      state.pageNo = action.payload;
    },
    setVehicle: (state, action) => {
      state.vehicle = action.payload;
    },
    setMetaData: (state, action) => {
      state.metaData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(extendedApiSlice.endpoints.getAllVehiclesPaginated.matchFulfilled, (state, action) => {
        console.log('here the action payload is', action.payload);
        let vehiclesData = action.payload.result;
        if (!state.vehicle) {
          //jahan jahan pe 22 he woh baad mein dynamic krta he through meta data
          const totalVehicles: any[] = new Array(22).fill({});

          const leftIndex = state.pageNo * 10;
          const rightIndex = state.pageNo * 10 + (vehiclesData.length - 1);

          for (let i = leftIndex; i <= rightIndex; i++) {
            totalVehicles[i] = vehiclesData[i];
          }

          state.vehicle = totalVehicles;
        } else {
          const leftIndex = state.pageNo * 10;
          const rightIndex = state.pageNo * 10 + (vehiclesData.length - 1);

          for (let i = leftIndex; i <= rightIndex; i++) {
            state.vehicle[i] = vehiclesData[i - state.pageNo * 10];
          }
        }
      })
      .addMatcher(extendedApiSlice.endpoints.addVehicleRequest.matchFulfilled, (state, action) => {
        toast.success('Vehicle Request Sent Successfully', { autoClose: 3000 });
      })
      .addMatcher(extendedApiSlice.endpoints.addVehicleRequest.matchRejected, (_, action: any) => {
        toast.error(action?.payload?.data?.detail || action?.error?.message || 'Some error occurred', {
          autoClose: 3000,
        });
      });
  },
});

export const { setVehiclePageNo, setVehicle, setMetaData } = vehicleSlice.actions;

export const vehicleSelector = (state: RootState) => state.vehicle;
export default vehicleSlice.reducer;
