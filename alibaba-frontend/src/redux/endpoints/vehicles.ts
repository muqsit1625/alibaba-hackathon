//@ts-nocheck
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { apiSlice } from 'redux/apiSlice';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVehicles: builder.query({
      query: () => ({ url: '/vehicles/api/v1/all', method: 'GET' }),
    }),
    getAllVehiclesPaginated: builder.query({
      query: ({ pageNo = 0 }) => ({ url: `/vehicles/api/v1/all/${pageNo + 1}`, method: 'GET' }),
    }),
    // getAllVehiclesPaginated: builder.query({
    //   async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
    //     const {pageNo, noOfItems} = arg;
    //     const allVehicleResponse: any = await fetchWithBQ({
    //       url: `/vehicles/all/${pageNo}`,
    //       method: 'GET',
    //     })

    //     if (allVehicleResponse.error) {
    //       return {error: allVehicleResponse.error as FetchBaseQueryError };
    //     }

    //     return {
    //       data: {
    //         data:
    //       }
    //     }

    //   }),

    // }),
    getAllVehiclesPlateNo: builder.query<any, void>({
      query: () => ({ url: '/vehicles/api/v1/all_license_plate_no', method: 'GET' }),
    }),
    getAllVehiclesPlateNos: builder.mutation({
      query: () => {
        return {
          url: '/vehicles/api/v1/all_license_plate_no',
          method: 'GET',
        };
      },
    }),
    getVehiclesLocations: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let allVehiclesLocationResponse: any = await fetchWithBQ({ url: '/vehicles/api/v1/locations', method: 'GET' });

        if (allVehiclesLocationResponse.error) {
          return { error: allVehiclesLocationResponse.error as FetchBaseQueryError };
        }

        return { data: allVehiclesLocationResponse.data };
      },
    }),
    getSingleVehicle: builder.query({
      query: (vehicleId) => ({ url: `/vehicles/api/v1/get_vehicle/${vehicleId}`, method: 'GET' }),
    }),
    getCurrentDriverInVehicle: builder.query({
      query: (vehicleId) => ({ url: `/vehicles/api/v1/current_driver/${vehicleId}`, method: 'GET' }),
    }),
    getLastOnline: builder.query({
      query: (vehicleId) => ({ url: `/vehicles/api/v1/last_online/${vehicleId}`, method: 'GET' }),
    }),
    getOnlineStatus: builder.query({
      query: (vehicleId) => ({ url: `/vehicles/api/v1/online_status/${vehicleId}`, method: 'GET' }),
    }),
    addVehicleRequest: builder.mutation({
      query: (data) => {
        return {
          url: `/vehicles/api/v1/manager/add_vehicle`,
          method: 'POST',
          data: data,
        };
      },
    }),
  }),
});

export const {
  useGetAllVehiclesQuery,
  useGetAllVehiclesPaginatedQuery,
  useGetAllVehiclesPlateNoQuery,
  useGetAllVehiclesPlateNosMutation,
  useGetVehiclesLocationsQuery,
  useGetSingleVehicleQuery,
  useGetCurrentDriverInVehicleQuery,
  useGetLastOnlineQuery,
  useGetOnlineStatusQuery,
  useAddVehicleRequestMutation,
} = extendedApiSlice;
