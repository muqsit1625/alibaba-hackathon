//@ts-nocheck
import { apiSlice } from 'redux/apiSlice';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: () => ({ url: '/drivers/api/v1/all', method: 'GET' }),
    }),
    getAllDrivers: builder.query<any, void>({
      query: () => {
        return {
          url: '/drivers/api/v1/all',
          method: 'GET',
        };
      },
    }),
    getAllDriversName: builder.query<any, void>({
      query: () => {
        return {
          url: '/drivers/api/v1/all_driver_name',
          method: 'GET',
        };
      },
    }),
    getSingleDriverById: builder.query({
      query: (driverId) => ({ url: `/drivers/api/v1/get_driver/${driverId}`, method: 'GET' }),
    }),
    deleteDriverById: builder.mutation({
      query: (driverId) => {
        return {
          url: `/drivers/api/v1/${driverId}`,
          method: 'DELETE',
        };
      },
    }),
    addDriver: builder.mutation({
      query: (data) => {
        return {
          url: `/drivers/api/v1/add_driver`,
          method: 'POST',
          data: data,
        };
      },
    }),
    editDriver: builder.mutation({
      query: (data) => {
        return {
          url: `/drivers/api/v1/update_driver`,
          method: 'PUT',
          data: data,
        };
      },
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetAllDriversQuery,
  useLazyGetAllDriversQuery,
  useGetAllDriversNameQuery,
  useLazyGetAllDriversNameQuery,
  useGetSingleDriverByIdQuery,
  useLazyGetSingleDriverByIdQuery,
  useDeleteDriverByIdMutation,
  useAddDriverMutation,
  useEditDriverMutation,
} = extendedApiSlice;
