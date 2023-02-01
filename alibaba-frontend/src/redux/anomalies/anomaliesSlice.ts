import { createSlice } from '@reduxjs/toolkit';
import { extendedApiSlice } from 'redux/endpoints/anomalies';
import { RootState } from 'store';
import moment from 'moment';

import { anomalyTypeEnum, anomalyTypeEnumType } from 'global/variables';

export const anomaliesSlice: any = createSlice({
  name: 'anomalies',
  initialState: {
    anomalies: null,
    pageNo: 0,
    noOfItems: 10,
    metaData: {},
  },
  reducers: {
    setAnomalies: (state, action) => {
      state.anomalies = action.payload;
    },
    setPageNo: (state, action) => {
      state.pageNo = action.payload;
    },
    setNoOfItems: (state, action) => {
      state.noOfItems = action.payload;
    },
    setMetaData: (state, action) => {
      state.metaData = action.payload;
    },
    setMultiple: (state, action) => {
      return (state = { ...state, ...action.payload });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(extendedApiSlice.endpoints.getAllAnomaliesByManager.matchFulfilled, (state, action) => {
      state.metaData = action?.payload?.metadata;

      console.log('%caction in addMatcher:', 'background-color:pink;', action);

      let anomaliesData = action?.payload?.data || [];
      anomaliesData = anomaliesData.map((anomaly: any) => {
        return {
          type: anomalyTypeEnum[anomaly.anomaly_type as keyof anomalyTypeEnumType],
          anomalyImage: anomaly.anomalyImage,
          anomalyCount:
            anomaly?.anomaly_type === 'drowsy_anomaly'
              ? +anomaly?.payload?.drowsyCount
              : anomaly?.anomaly_type === 'distracted_anomaly'
              ? +anomaly?.payload?.distractedCount
              : 0,
          driver: anomaly.driver_name,
          vehicleId: anomaly.vehicleId,
          plateNo: anomaly.payload.plateNo,
          date: moment(anomaly.sentTime).utcOffset(600).format('DD MMMM YYYY'),
          time: moment(anomaly.sentTime).utcOffset(600).format('h:mm:ss A'),
          timestamp: anomaly.sentTime,
        };
      });
      const totalRecords = action.payload?.metadata?.total;

      if (!state.anomalies) {
        const totalAnomalies = new Array(totalRecords - 1).fill({});
        const leftIndex = state.pageNo * state.noOfItems;
        const rightIndex = state.pageNo * state.noOfItems + (anomaliesData.length - 1);

        for (let i = leftIndex; i <= rightIndex; i++) {
          totalAnomalies[i] = anomaliesData[i];
        }

        state.anomalies = totalAnomalies;
      } else {
        const leftIndex = state.pageNo * state.noOfItems;
        const rightIndex = state.pageNo * state.noOfItems + (anomaliesData.length - 1);

        for (let i = leftIndex; i <= rightIndex; i++) {
          state.anomalies[i] = anomaliesData[i - state.pageNo * state.noOfItems];
        }
      }
    });
  },
});

export const { setAnomalies, setPageNo, setNoOfItems, setMetaData, setMultiple } = anomaliesSlice.actions;
export default anomaliesSlice.reducer;
export const anomaliesSelector = (state: RootState) => state.anomalies;
