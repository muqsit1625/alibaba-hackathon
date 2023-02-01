//@ts-nocheck
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { configVars } from 'global/variables';

let token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').token : null;

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      axios.interceptors.response.use(function (response) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.reload();
        }

        return response;
      });
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          Authorization: `Bearer ${params?.token || token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError as AxiosError;

      if (
        err?.response?.data?.message === 'Could not validate credentials' ||
        err?.response?.data?.message === 'Token expired' ||
        err?.response?.data?.message === 'Token does not exist'
      ) {
        localStorage.clear();
        window.location.reload();
      }
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice: any = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: `${configVars.apiRoute}`,
  }),
  endpoints: () => ({}),
});
