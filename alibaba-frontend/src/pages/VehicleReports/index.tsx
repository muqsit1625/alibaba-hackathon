import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import moment from 'moment';
import axios from 'axios';

import { apiRoute, fetchToken } from 'global/apiRoute';
import { reportsTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import {
  useLazyGetVehicleReportBySessionQuery,
  useLazyGetVehicleReportByTripQuery,
  useLazyGetVehicleReportQuery,
  useLazyGetVehicleReportNewQuery,
} from 'redux/endpoints/reports';
import { authSelector } from 'redux/auth/authSlice';

import { Breadcrumbs } from 'components/Shared/Breadcrumbs';
import VehicleReportsInput from 'components/Reports/VehicleReports/VehicleReportInput/VehicleReportsInput';
import VehicleReportsOutput from 'components/Reports/VehicleReports/VehicleReportsOutput/VehicleReportsOutput';

const config = fetchToken();

const VehicleReports = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const [getVehicleReportNew, vehicleReportNewQueryState] = useLazyGetVehicleReportNewQuery();
  const [getVehicleReport, vehicleReportQueryState] = useLazyGetVehicleReportQuery();
  const [getVehicleReportBySession, vehicleReportBySessionQueryState] = useLazyGetVehicleReportBySessionQuery();
  const [getVehicleReportByTrip, vehicleReportByTripQueryState] = useLazyGetVehicleReportByTripQuery();
  console.log('%cvehicleReportQueryState:', 'background-color:chocolate;color:white', vehicleReportQueryState);
  console.log(
    '%cvehicleReportByTripQueryState:',
    'background-color:darkolivegreen;color:white',
    vehicleReportByTripQueryState,
  );

  const [vehicleData, setVehicleData] = useState<{ vehicle: any; dates: Date | Date[] | undefined }>({
    vehicle: null,
    dates: [],
  });
  const [vehicleImage, setVehicleImage] = useState<string>('');
  const [driverImage, setDriverImage] = useState<string>('');

  const breadcrumbs = [
    {
      link: '/reports',
      label: t(`${reportsTranslationsPath}.availableReportsHeading`),
    },
    {
      link: '',
      label: t(`${reportsTranslationsPath}.vehicleSummaryReportHeading`),
    },
  ];

  useEffect(() => {
    if (vehicleReportNewQueryState.isSuccess) {
      const vehicleImageUrl = vehicleReportNewQueryState?.data?.result?.vehicle_details?.vehicle_image;

      if (vehicleImageUrl) {
        const fetchVehicleImageResult = async () => {
          const vehicleImageUrlResult = await axios.get(
            `${apiRoute}/api/v1/vehicles/get_image//${vehicleImageUrl}`,
            config,
          );

          const vehicleImage = vehicleImageUrlResult?.data?.result?.result;
          if (vehicleImage) {
            setVehicleImage(vehicleImage);
          }
        };

        fetchVehicleImageResult();
      }
    }
  }, [vehicleReportNewQueryState?.data?.result?.vehicle_details?.vehicle_image, vehicleReportQueryState.isSuccess]);

  useEffect(() => {
    if (vehicleReportQueryState.isSuccess) {
      const driverImageUrl = vehicleReportQueryState?.data?.result?.current_driver?.driver_media_url;

      if (driverImageUrl) {
        const fetchDriverImageResult = async () => {
          const driverImageUrlResult = await axios.get(
            `${apiRoute}/api/v1/drivers/get_image//${driverImageUrl}`,
            config,
          );
          const driverImage = driverImageUrlResult?.data?.result?.result;
          if (driverImage) {
            setDriverImage(driverImage);
          }
        };

        fetchDriverImageResult();
      }
    }
  }, [vehicleReportQueryState?.data?.result?.current_driver?.driver_media_url, vehicleReportQueryState.isSuccess]);

  useEffect(() => {
    try {
      if (Array.isArray(vehicleData.dates)) {
        if (vehicleData.vehicle?.vehicle_id && vehicleData.dates?.length === 2) {
          const params = {
            vehicle_id: vehicleData.vehicle?.vehicle_id,
            start_date: moment(vehicleData.dates[0]).format('YYYY-MM-DD'),
            end_date: vehicleData.dates[1]
              ? moment(vehicleData.dates[1]).format('YYYY-MM-DD')
              : moment(vehicleData.dates[0]).format('YYYY-MM-DD'),
          };

          console.log('params', params);

          getVehicleReportNew(params);

          getVehicleReportBySession(params);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [vehicleData]);

  const newReportData: any = useMemo(() => {
    let newReports;
    if (vehicleReportNewQueryState.isSuccess) {
      newReports = vehicleReportNewQueryState?.currentData || null;
      console.log('new reps', vehicleReportNewQueryState);
    }

    return newReports;
  }, [vehicleReportNewQueryState?.currentData, vehicleReportNewQueryState.isSuccess]);

  const reportBySessionData: any = useMemo(() => {
    let vehicleReportBySession = [];
    if (vehicleReportBySessionQueryState.isSuccess) {
      vehicleReportBySession = vehicleReportBySessionQueryState?.data?.result || [];
    }

    return vehicleReportBySession;
  }, [vehicleReportBySessionQueryState?.data?.result, vehicleReportBySessionQueryState.isSuccess]);
  console.log('%creportBySessionData:', 'background-color:chocolate;color:white', reportBySessionData);

  return (
    <StyledVehicleReports isDirectionRtl={reducerState.isDirectionRtl}>
      <Breadcrumbs items={breadcrumbs} />
      <VehicleReportsInput setData={setVehicleData} loading={vehicleReportNewQueryState.isFetching} />
      <VehicleReportsOutput
        key={reportBySessionData}
        data={vehicleData}
        reportData={newReportData}
        reportBySessionData={reportBySessionData}
        // reportByTripData={reportByTripData}
        reportByTripData={newReportData?.trips || []}
        vehicleImage={vehicleImage}
        driverImage={driverImage}
        vehicleReportBySessionQueryState={vehicleReportBySessionQueryState}
        vehicleReportByTripQueryState={vehicleReportByTripQueryState}
      />
    </StyledVehicleReports>
  );
};

export default VehicleReports;

const StyledVehicleReports = styled.div<{ isDirectionRtl: boolean }>`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;
