//@ts-nocheck
import { apiSlice } from 'redux/apiSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

import { anomalyTypeEnum, anomalyTypeEnumType } from 'global/variables';

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getAllAnomaliesByManager: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { managerId, pageNo, noOfItems } = arg;
        const allAnomaliesResponse: any = await fetchWithBQ({
          url: `/anomalies/api/v1/all/${managerId}/${pageNo}/${noOfItems}`,
          method: 'GET',
        });

        if (allAnomaliesResponse.error) {
          return { error: allAnomaliesResponse.error as FetchBaseQueryError };
        }

        async function getAnomalyImage(imageUrl: string) {
          try {
            return await fetchWithBQ({ url: `/anomalies/api/v1/get_anomaly_image_url/${imageUrl}`, method: 'GET' });
          } catch (error) {
            return error;
          }
        }

        const allAnomaliesImagesUrls = allAnomaliesResponse.data.data.map((anomaly: any) => {
          if (anomaly?.payload?.timeStamp) {
            const timestamp = anomaly.payload.timeStamp.split(' ').join('-');
            return `${anomalyTypeEnum[anomaly.anomaly_type as keyof anomalyTypeEnumType]}_${timestamp}.jpg`;
          }

          return null;
        });
        console.log('%callAnomaliesImagesUrls', 'background-color:red;color:white;', allAnomaliesImagesUrls);
        const allAnomaliesImagesUrlsPromise = allAnomaliesImagesUrls.map((anomalyImageUrl: string) => {
          if (anomalyImageUrl) {
            return getAnomalyImage(anomalyImageUrl);
          }

          return null;
        });
        const allAnomaliesImagesUrlsPromiseResult: any = await Promise.allSettled(allAnomaliesImagesUrlsPromise);
        console.log(
          '%callAnomaliesImageUrlsPromiseResult:',
          'background-color:orange;',
          allAnomaliesImagesUrlsPromiseResult,
        );

        const allAnomalies = allAnomaliesResponse.data.data.map((anomaly: any, index: number) => {
          return {
            ...anomaly,
            anomalyImage: allAnomaliesImagesUrlsPromiseResult[index]?.value?.data?.result || null,
          };
        });

        console.log('%cfinalAnomalies:', 'background-color:yellow;', allAnomalies);

        return {
          data: {
            data: allAnomalies,
            metadata: allAnomaliesResponse.data.metadata,
          },
        };
      },
    }),
    getAllAnomaliesGroupByDrivers: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const anomaliesCountByDriversResponse: any = await fetchWithBQ({
          url: '/anomalies/api/v1/get_count_by_drivers',
          method: 'GET',
        });

        if (anomaliesCountByDriversResponse.error) {
          return { error: anomaliesCountByDriversResponse.error as FetchBaseQueryError };
        }

        const allDriversIds: string[] = anomaliesCountByDriversResponse.data?.result
          ? anomaliesCountByDriversResponse.data?.result?.map((driver: any) => driver._id.driverId)
          : [];

        async function getAnomaliesByDriverId(driverId: string) {
          try {
            return await fetchWithBQ({ url: `/drivers/api/v1/driver_anomalies/${driverId}`, method: 'GET' });
          } catch (error) {
            return error;
          }
        }

        const getAllDriversAnomaliesPromise = allDriversIds.map((driverId: string) => getAnomaliesByDriverId(driverId));

        const getAllDriversAnomaliesResult = await Promise.allSettled(getAllDriversAnomaliesPromise);

        let allAnomalies = getAllDriversAnomaliesResult.map((anomaliesResult: any) => {
          return anomaliesResult.value.data?.result || {};
        });

        allAnomalies = allAnomalies.flat(1);

        async function getDriverById(driverId: string) {
          try {
            return await fetchWithBQ({ url: `/drivers/api/v1/get_driver/${driverId}`, method: 'GET' });
          } catch (error) {
            return error;
          }
        }

        const allDriverIds = allAnomalies.map((anomaly) => anomaly.driverId);
        const allDriverIdsPromise = allDriverIds.map((driverId) => getDriverById(driverId));
        const allDriverIdsResult: any = await Promise.allSettled(allDriverIdsPromise);

        allAnomalies = allAnomalies.map((anomaly, index) => {
          const driverFirstName = allDriverIdsResult[index]?.value?.data?.result?.driver_first_name || '';
          const driverLastName = allDriverIdsResult[index]?.value?.data?.result?.driver_last_name || '';
          return {
            ...anomaly,
            driverName: driverFirstName && driverLastName ? `${driverFirstName} ${driverLastName}` : '-',
          };
        });

        return { data: allAnomalies };
      },
    }),
    getAnomaliesByDriverId: builder.query({
      query: (driverId) => ({ url: `/drivers/api/v1/driver_anomalies/${driverId}`, method: 'GET' }),
    }),
  }),
});

export const {
  useGetAllAnomaliesByManagerQuery,
  useGetAllAnomaliesGroupByDriversQuery,
  useGetAnomaliesByDriverIdQuery,
} = extendedApiSlice;
