//@ts-nocheck
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { apiSlice } from 'redux/apiSlice';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        let loginResponse = await fetchWithBQ({
          url: '/auth/api/v1/login',
          method: 'POST',
          data: arg,
        });

        if (loginResponse.error) {
          return { error: loginResponse.error as FetchBaseQueryError };
        }

        const data: any = loginResponse.data;
        const managerImageUrl = data.user.image;

        let getManagerImageResponse: any;

        try {
          getManagerImageResponse = await fetchWithBQ({
            url: `/managers/api/v1/get_image//managers/${managerImageUrl}`,
            method: 'GET',
            params: {
              token: data.token,
            },
          });
        } catch (error) {
          console.log('%cgetManagerImage error in auth endpoint:', error);
        }

        const finalData = {
          ...data,
          user: {
            ...data?.user,
            awsImageUrl: getManagerImageResponse?.data?.result?.result || '',
          },
        };

        return { data: finalData };
      },
    }),
  }),
});

export const { useLoginMutation } = extendedApiSlice;
