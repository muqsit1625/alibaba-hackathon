import { createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { extendedApiSlice } from 'redux/endpoints/vehicles';
import { extendedApiSlice as reportExtendedApiSlice } from 'redux/endpoints/reports';
import axios from 'axios';

import { apiRoute, fetchToken } from 'global/apiRoute';

export const mapOverviewSlice: any = createSlice({
  name: 'mapOverview',
  initialState: {
    vehiclesLocationsCoordinates: {},
    fetchSingleVehicleId: null,
    fetchSingleDriverId: null,
    vehiclePlateNo: null,
    vehicleId: null,
    vehicleDriverStats: {
      Online: 0,
      Offline: 0,
      Unauthorized: 0,
      Authorized: 0,
    },
    filterTouched: {
      online: true,
      offline: true,
      unauthorized: false,
    },
    driverIdForFilteredVehicle: null,
    vehiclePlateNoForFilteredVehicle: null,
    selectedDriverByName: '',
    selectedVehicleByPlateNo: '',
    selectedVehicleOnMap: null,
    clickCount: 0,
    tripStarted: null,
  },
  reducers: {
    setVehiclesLocationsCoordinates: (state, action) => {
      state.vehiclesLocationsCoordinates = action.payload;
    },
    setFetchSingleVehicleId: (state, action) => {
      state.fetchSingleVehicleId = action.payload;
    },
    setFetchSingleDriverId: (state, action) => {
      state.fetchSingleDriverId = action.payload;
    },
    setVehiclePlateNo: (state, action) => {
      state.vehiclePlateNo = action.payload;
    },
    setVehicleId: (state, action) => {
      state.vehicleId = action.payload;
    },
    setVehicleDriverStats: (state, action) => {
      state.vehicleDriverStats = action.payload;
    },
    setFilterTouched: (state, action) => {
      console.log('payload', action.payload);
      state.filterTouched = action.payload;
    },
    setDriverIdForFilteredVehicle: (state, action) => {
      state.driverIdForFilteredVehicle = action.payload;
    },
    setPlateNoForFilteredVehicle: (state, action) => {
      state.vehiclePlateNoForFilteredVehicle = action.payload;
    },
    setSelectedVehicleOnMap: (state, action) => {
      state.selectedVehicleOnMap = action.payload;
    },
    setSelectedDriverByName: (state, action) => {
      state.selectedDriverByName = action.payload;
    },
    setSelectedVehicleByPlateNo: (state, action) => {
      state.selectedVehicleByPlateNo = action.payload;
    },
    setClickCount: (state, action) => {
      state.clickCount = action.payload;
    },
    setTripStarted: (state, action) => {
      state.tripStarted = action.payload;
    },
    setMultiple: (state, action) => {
      return (state = {
        ...state,
        ...action.payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(extendedApiSlice.endpoints.getVehiclesLocations.matchFulfilled, (state, action) => {
        const allVehicles = action.payload?.result || [];

        const vehicleStats: any = {
          Unauthorized: 0,
          Online: 0,
          Offline: 0,
          Authorized: 0,
        };

        for (let i = 0; i < allVehicles.length; i++) {
          if (allVehicles[i]?.is_online === true) {
            vehicleStats['Online']++;
          }
          if (allVehicles[i]?.is_online === false) {
            vehicleStats['Offline']++;
          }
          if (allVehicles[i]?.auth_status === 'Unauthorized') {
            vehicleStats['Unauthorized']++;
          }
          if (allVehicles[i]?.auth_status === 'Authorized') {
            vehicleStats['Authorized']++;
          }
        }

        state.vehicleDriverStats = vehicleStats;
      })
      .addMatcher(reportExtendedApiSlice.endpoints.getActiveTripId.matchFulfilled, (state, action) => {
        console.log('%caction in getActiveTripId fulfilledMatcher:', 'background-color:green;color:white;', action);
        const tripStarted = action?.payload?.ongoing;

        state.tripStarted = tripStarted;
      })
      .addMatcher(reportExtendedApiSlice.endpoints.startStopTrip.matchFulfilled, (state, action) => {
        console.log('%caction in startStopTrip fulfilledMatcher:', 'background-color:green;color:white;', action);

        const tripStarted: string = action?.meta?.arg?.originalArgs?.data?.status;

        state.tripStarted = tripStarted;
      })
      .addMatcher(reportExtendedApiSlice.endpoints.startStopTrip.matchRejected, (state, action) => {
        console.log('%caction in startStopTrip rejectedMatcher:', 'background-color:green;color:white;', action);
        const tripStarted: string = action?.meta?.arg?.originalArgs?.data?.status;

        state.tripStarted = tripStarted;
      });
  },
});

export const {
  setVehiclesLocationsCoordinates,
  setFetchSingleVehicleId,
  setFetchSingleDriverId,
  setVehiclePlateNo,
  setVehicleId,
  setVehicleDriverStats,
  setFilterTouched,
  setDriverIdForFilteredVehicle,
  setPlateNoForFilteredVehicle,
  setSelectedVehicleOnMap,
  setSelectedDriverByName,
  setSelectedVehicleByPlateNo,
  setClickCount,
  setTripStarted,
  setMultiple,
} = mapOverviewSlice.actions;
export const mapOverviewSelector = (state: RootState) => state.mapOverview;
export default mapOverviewSlice.reducer;
