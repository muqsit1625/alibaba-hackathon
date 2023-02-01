//@ts-nocheck

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
  anomaliesPageTranslationsPath,
  dashboardPageTranslationsPath,
  liveVehiclesLocationInterval,
} from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useGetAllAnomaliesGroupByDriversQuery } from 'redux/endpoints/anomalies';

import { PageTitle } from 'components/Shared/PageTitle';
import AnomaliesDataTable from 'components/Datatable/Anomalies/AnomaliesDataTable';
import { useSelector } from 'react-redux';
import { mapOverviewSelector } from 'redux/mapOverview/mapOverviewSlice';
import { useEffect, useState } from 'react';
import { useGetVehiclesLocationsQuery } from 'redux/endpoints/vehicles';
import DoughnutChart from 'components/DoughnutChart';

const Dashboard = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();
  const mapOverviewSlice = useSelector(mapOverviewSelector);

  const queryState = useGetVehiclesLocationsQuery(null, {
    pollingInterval: liveVehiclesLocationInterval,
  });

  const [onOffNumbers, setOnOffNumbers] = useState([]);
  const [authNumbers, setAuthNumbers] = useState([]);
  const [onlineOfflineData, setOnlineOfflineData] = useState({});
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    let localArr = Object.values(mapOverviewSlice.vehicleDriverStats);

    console.log('locals', localArr);

    setOnOffNumbers(localArr.slice(1, 3));

    setOnlineOfflineData({
      labels: ['Online', 'Offline'],
      datasets: [
        {
          label: 'Vehicles',
          data: localArr.slice(1, 3),
          backgroundColor: ['#39d481', '#c3c3c3'],
          borderColor: ['#39d481', '#c3c3c3'],
          borderWidth: 1,
        },
      ],
    });
  }, [mapOverviewSlice.vehicleDriverStats]);

  useEffect(() => {
    let localArr = Object.values(mapOverviewSlice.vehicleDriverStats);

    let totalVehicles = localArr.slice(1, 3).reduce((a, b) => {
      return a + b;
    }, 0);

    setAuthData({
      labels: ['Authorized', 'Unauthorized'],
      datasets: [
        {
          label: 'Vehicles',
          data: [totalVehicles - localArr[0], localArr[0]],
          backgroundColor: ['hsl(213, 47%, 50%)', '#fc3232'],
          borderColor: ['hsl(213, 47%, 50%)', '#fc3232'],
          borderWidth: 1,
        },
      ],
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
    });
  }, [mapOverviewSlice.vehicleDriverStats]);

  const options = {
    legend: {
      display: false,
      position: 'right',
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  console.log('%conoff', 'background:red', onlineOfflineData);

  return (
    <DashboardStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <PageTitle text={t(`${dashboardPageTranslationsPath}.dashboardPageHeading`)} />

      <div className="dashboard-chartset-main">
        <p>{t(`${dashboardPageTranslationsPath}.dashboardVehicleStatsHeading`)}</p>
        <div className="dashboard-chartset-1">
          {Object.keys(onlineOfflineData).length > 0 && <DoughnutChart data={onlineOfflineData} options={options} />}
          {Object.keys(authData).length > 0 && <DoughnutChart data={authData} />}
        </div>
      </div>
    </DashboardStyled>
  );
};

const DashboardStyled = styled.div<{ isDirectionRtl: boolean }>`
  padding: 8px;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .dashboard-chartset-main {
    margin: 30px 16px;
  }

  .dashboard-chartset-1 {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    min-height: 60vh;
  }
`;

export default Dashboard;
