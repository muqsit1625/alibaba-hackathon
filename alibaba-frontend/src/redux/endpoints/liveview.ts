//@ts-nocheck
import { apiSlice } from 'redux/apiSlice';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    currentAuthAndDriver: builder.query({
      query: (vehicle_plate_no) => ({
        url: `/liveview/api/v1/current_auth_and_driver/${vehicle_plate_no}`,
        method: 'GET',
      }),
    }),
    getLiveStream: builder.query({
      query: ({ vehicle_plate_no, status }) => ({
        url: `/liveview/api/v1/request_videofeed/${vehicle_plate_no}/${status}`,
        method: 'GET',
      }),
    }),
    getDriverLiveAnomalies: builder.query({
      query: (driverId) => ({ url: `/liveview/api/v1/drivers_anomalies_count/${driverId}`, method: 'GET' }),
    }),
  }),
});

export const { useCurrentAuthAndDriverQuery, useGetLiveStreamQuery, useGetDriverLiveAnomaliesQuery } = extendedApiSlice;
