//@ts-nocheck
import { apiSlice } from 'redux/apiSlice';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDriverReport: builder.query({
      query: ({ driver_id, start_date, end_date }) => {
        return { url: `/reporting/api/v1/driver_reports/${driver_id}/${start_date}/${end_date}`, method: 'GET' };
      },
    }),
    getDriverReportBySession: builder.query({
      query: ({ driver_id, start_date, end_date }) => ({
        url: `/reporting/api/v1/driver_reports_by_session/${driver_id}/${start_date}/${end_date}`,
        method: 'GET',
      }),
    }),
    getVehicleReport: builder.query({
      query: ({ vehicle_id, start_date, end_date }) => ({
        url: `/reporting/api/v1/vehicle_reports/${vehicle_id}/${start_date}/${end_date}`,
        method: 'GET',
      }),
    }),

    getVehicleReportNew: builder.query({
      query: ({ vehicle_id, start_date, end_date }) => ({
        url: `/reporting/api/v1/vehicle_reports_v2/${vehicle_id}/${start_date}/${end_date}`,
        method: 'GET',
      }),
    }),

    getVehicleReportBySession: builder.query({
      query: ({ vehicle_id, start_date, end_date }) => ({
        url: `/reporting/api/v1/vehicle_reports_by_session/${vehicle_id}/${start_date}/${end_date}`,
        method: 'GET',
      }),
    }),
    getVehicleReportByTrip: builder.query({
      query: ({ vehicle_id, start_date, end_date }) => ({
        url: `/reporting/api/v1/vehicle_reports_by_trip/${vehicle_id}/${start_date}/${end_date}`,
        method: 'GET',
      }),
    }),
    getActiveTripId: builder.query({
      query: ({ vehicle_id }) => ({
        url: `/reporting/api/v1/get_active_tripid/${vehicle_id}`,
        method: 'GET',
      }),
    }),
    startStopTrip: builder.mutation({
      query: ({ data }) => ({
        url: `/reporting/api/v1/trip`,
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useGetDriverReportQuery,
  useLazyGetDriverReportQuery,
  useGetDriverReportBySessionQuery,
  useLazyGetDriverReportBySessionQuery,
  useGetVehicleReportQuery,
  useLazyGetVehicleReportQuery,
  useLazyGetVehicleReportNewQuery,
  useGetVehicleReportBySessionQuery,
  useLazyGetVehicleReportBySessionQuery,
  useGetVehicleReportByTripQuery,
  useLazyGetVehicleReportByTripQuery,
  useGetActiveTripIdQuery,
  useLazyGetActiveTripIdQuery,
  useStartStopTripMutation,
} = extendedApiSlice;
