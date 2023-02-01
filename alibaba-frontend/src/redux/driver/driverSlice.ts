//@ts-nocheck
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { RootState } from 'store';

import { extendedApiSlice } from 'redux/endpoints/drivers';
// import { mockData } from 'components/Datatable/Driver/mockData';

export const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    allDrivers: []
  },
  reducers: {
    setAllDrivers: (state, action) => {
      state.allDrivers = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(extendedApiSlice.endpoints.deleteDriverById.matchFulfilled, (state, action) => {
        toast.success(`Driver deleted!`, { autoClose: 3000 });
      })
      .addMatcher(extendedApiSlice.endpoints.deleteDriverById.matchRejected, (state, action) => {
        toast.error(`Some issue occured while deleting device`, { autoClose: 3000 });
      });
  }
});

export const { setAllDrivers } = driverSlice.actions;
export const driverSelector = (state: RootState) => state.driver;
export default driverSlice.reducer;
