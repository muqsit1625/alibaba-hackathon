import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import moment from 'moment';
import axios from 'axios';

import { apiRoute, fetchToken } from 'global/apiRoute';
import { reportsTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useLazyGetDriverReportBySessionQuery, useLazyGetDriverReportQuery } from 'redux/endpoints/reports';

import { Breadcrumbs } from 'components/Shared/Breadcrumbs';
import DriverReportsInput from 'components/Reports/DriverReports/DriverReportsInput/DriverReportsInput';
import DriverReportsOutput from 'components/Reports/DriverReports/DriverReportsOutput/DriverReportsOutput';

const config = fetchToken();

const DriverReports = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const [getDriverReport, driverReportQueryState] = useLazyGetDriverReportQuery();
  const [getDriverReportBySession, driverReportBySessionQueryState] = useLazyGetDriverReportBySessionQuery();

  const [driverData, setDriverData] = useState<{ driver: any; dates: Date | Date[] | undefined }>({
    driver: null,
    dates: [],
  });
  const [driverImage, setDriverImage] = useState<string>('');

  const breadcrumbs = [
    {
      link: '/reports',
      label: t(`${reportsTranslationsPath}.availableReportsHeading`),
    },
    {
      link: '',
      label: t(`${reportsTranslationsPath}.driverBehaviorReportHeading`),
    },
  ];

  useEffect(() => {
    if (driverReportQueryState.isSuccess) {
      const driverImageUrl = driverReportQueryState?.data?.result?.driver_detail?.driver_media_url;

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
  }, [driverReportQueryState?.data?.result, driverReportQueryState.isSuccess]);

  useEffect(() => {
    try {
      if (Array.isArray(driverData.dates)) {
        if (driverData?.driver && driverData?.dates?.length) {
          const requestParams = {
            driver_id: driverData.driver.driver_id,
            start_date: moment(driverData.dates[0]).format('YYYY-MM-DD'),
            end_date: driverData.dates[1]
              ? moment(driverData.dates[1]).format('YYYY-MM-DD')
              : moment(driverData.dates[0]).format('YYYY-MM-DD'),
          };

          getDriverReport(requestParams);
          getDriverReportBySession(requestParams);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [driverData]);

  const reportData: any = useMemo(() => {
    let driverReport;
    if (driverReportQueryState.isSuccess) {
      driverReport = driverReportQueryState?.currentData?.result || null;
    }

    return driverReport;
  }, [driverReportQueryState?.currentData?.result, driverReportQueryState.isSuccess]);

  const reportBySessionData: any = useMemo(() => {
    let driverReportBySession = [];
    if (driverReportBySessionQueryState.isSuccess) {
      driverReportBySession = driverReportBySessionQueryState?.data?.result || [];
    }

    return driverReportBySession;
  }, [driverReportBySessionQueryState?.data?.result, driverReportBySessionQueryState.isSuccess]);
  console.log('%creportBySessionData:', 'background-color:purple;color:white;', reportBySessionData);
  console.log('%cdriverReportData:', 'background-color:purple;color:white;', reportData);

  return (
    <StyledDriverReports isDirectionRtl={reducerState.isDirectionRtl}>
      <Breadcrumbs items={breadcrumbs} />
      <DriverReportsInput setData={setDriverData} loading={driverReportQueryState.isFetching} />
      <DriverReportsOutput
        key={reportBySessionData}
        data={driverData}
        driverImage={driverImage}
        reportData={reportData}
        reportBySessionData={reportBySessionData}
        driverReportBySessionQueryState={driverReportBySessionQueryState}
      />
    </StyledDriverReports>
  );
};

export default DriverReports;

const StyledDriverReports = styled.div<{ isDirectionRtl: boolean }>`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;
