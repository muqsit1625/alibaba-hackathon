import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import styled from 'styled-components';

import { Tooltip } from 'primereact/tooltip';

import i18n from 'i18n';

import {
  anomalyTypeEnum,
  anomalyTypeEnumType,
  currentDriverAnomaliesInterval,
  currentDriverInVehicleInterval,
  driverAuthStatusInterval,
  liveVehiclesLocationInterval,
  rightSidebarTranslationsPath,
  vehicleLastOnlineInterval,
  vehicleOnlineStatusInterval,
} from 'global/variables';
import { getDateByTimeZone, getLastSeenTime } from 'global/utils';

import { mapOverviewSelector, setMultiple } from 'redux/mapOverview/mapOverviewSlice';
import {
  useGetCurrentDriverInVehicleQuery,
  useGetLastOnlineQuery,
  useGetOnlineStatusQuery,
  useGetSingleVehicleQuery,
  useGetVehiclesLocationsQuery,
} from 'redux/endpoints/vehicles';
import { useGetSingleDriverByIdQuery } from 'redux/endpoints/drivers';
import { useCurrentAuthAndDriverQuery, useGetDriverLiveAnomaliesQuery } from 'redux/endpoints/liveview';
import {
  useGetActiveTripIdQuery,
  useLazyGetActiveTripIdQuery,
  useStartStopTripMutation,
} from 'redux/endpoints/reports';
import { useGetAnomaliesByDriverIdQuery } from 'redux/endpoints/anomalies';

import { DriverAuthorized, DriverStatsIcon, DriverUnAuthorizedIcon, SearchIcon } from 'global/icons';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { S3Image } from 'components/Shared/S3Image';
import Btn from 'components/CButtons/Btn';
import Spinner from 'components/Shared/Spinner';
import DetailRow, { TimeElapsed, Title, Value } from 'components/Atoms/DetailRow/DetailRow';

import DriverUnAuthorizedAvatar from 'assets/icons/driver-unauthorized-avatar.png';

const DriverAndVehicleDetails = (props: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const mapOverviewSlice: any = useSelector(mapOverviewSelector);
  console.log('%cmapOverviewSlice:', 'background-color:golden', mapOverviewSlice);

  const allVehiclesLocationsQueryState = useGetVehiclesLocationsQuery(null, {
    skip: !mapOverviewSlice.vehiclePlateNo,
    pollingInterval: liveVehiclesLocationInterval,
  });
  const vehicleLastOnlineQueryState = useGetLastOnlineQuery(mapOverviewSlice.fetchSingleVehicleId, {
    skip: !mapOverviewSlice.fetchSingleVehicleId,
    pollingInterval: vehicleLastOnlineInterval,
  });
  const vehicleOnlineStatusQueryState = useGetOnlineStatusQuery(mapOverviewSlice.fetchSingleVehicleId, {
    skip: !mapOverviewSlice.fetchSingleVehicleId,
    pollingInterval: vehicleOnlineStatusInterval,
  });
  const singleDriverQueryState: any = useGetSingleDriverByIdQuery(mapOverviewSlice.fetchSingleDriverId, {
    skip: !mapOverviewSlice.fetchSingleDriverId,
  });

  console.log('single driver', mapOverviewSlice.fetchSingleDriverId);

  const currentDriverInVehicleQueryState = useGetCurrentDriverInVehicleQuery(
    mapOverviewSlice.selectedVehicleOnMap?.vehicle_id || mapOverviewSlice?.vehicleId,
    {
      skip: !mapOverviewSlice.selectedVehicleOnMap?.vehicle_id && !mapOverviewSlice?.vehicleId,
      pollingInterval: currentDriverInVehicleInterval,
    },
  );
  const currentDriverLiveAnomalies: any = useGetDriverLiveAnomaliesQuery(
    mapOverviewSlice.selectedVehicleOnMap?.driver_id,
    {
      skip:
        !mapOverviewSlice.selectedVehicleOnMap?.driver_id || mapOverviewSlice.selectedVehicleOnMap?.driver_id === '-',
      pollingInterval: currentDriverAnomaliesInterval,
    },
  );
  const getActiveTripIdQueryState = useGetActiveTripIdQuery(
    {
      vehicle_id: mapOverviewSlice.fetchSingleVehicleId,
    },
    {
      skip: !mapOverviewSlice?.fetchSingleVehicleId,
      refetchOnMountOrArgChange: true,
    },
  );
  const [startStopTrip, startStopTripQueryState] = useStartStopTripMutation({
    fixedCacheKey: 'trip-for-sidebar',
  });

  console.log('vec ide', mapOverviewSlice.fetchSingleVehicleId);

  console.log('%callVehiclesLocationQueryState:', 'background-color:yellow;', allVehiclesLocationsQueryState);
  console.log('%cvehicleOnlineStatusQueryState:', 'background-color:brown;color:white;', vehicleOnlineStatusQueryState);
  console.log('%cvehicleLastOnlineQueryState:', 'background-color:lime;', vehicleLastOnlineQueryState);
  console.log('%csingleDriverQueryState:', 'background-color:blue;', singleDriverQueryState);
  console.log(
    '%ccurrentDriverInVehicleQueryState: in DriverAndVehicleDetails',
    'background-color:deeppink;color:white;',
    currentDriverInVehicleQueryState,
  );
  console.log('%ccurrentDriverLiveAnomalies:', 'background-color:burlywood;', currentDriverLiveAnomalies);
  console.log('%cstartStopTripQueryState', 'background-color:darkorange;color:white;', startStopTripQueryState);
  console.log('%cgetActiveTripIdQueryState', 'background-color:darkorange;color:white;', getActiveTripIdQueryState);

  const singleDriverData = useMemo(() => {
    return singleDriverQueryState?.currentData?.result;
  }, [singleDriverQueryState?.currentData?.result]);

  console.log('main single', singleDriverQueryState);

  const filteredVehicleByPlateNo = useMemo(() => {
    let filteredVehicle;

    if (allVehiclesLocationsQueryState?.data?.result) {
      filteredVehicle = allVehiclesLocationsQueryState.data.result.find(
        (vehicle: any) => vehicle?.vehicle_plate_no === mapOverviewSlice.vehiclePlateNo,
      );
    }

    return filteredVehicle;
  }, [allVehiclesLocationsQueryState?.data?.result, mapOverviewSlice.vehiclePlateNo]);

  const currentDriverLastAnomaly: any = useMemo(() => {
    return currentDriverLiveAnomalies?.currentData?.result?.last_anomaly?.[0] || null;
  }, [currentDriverLiveAnomalies?.currentData?.result?.last_anomaly]);

  console.log('anomalized', currentDriverLiveAnomalies);

  console.log('%cfilteredVehicleByPlateNo:', 'background-color:aqua;', filteredVehicleByPlateNo);

  const getVehicleDetail = (detailType: string) => {
    const detailsTypes: { [key: string]: any } = {
      vehicleId: filteredVehicleByPlateNo?.vehicleId || filteredVehicleByPlateNo?.vehicle_id || '',
      vehiclePlateNo: filteredVehicleByPlateNo?.vehicle_plate_no || '-',
      vehicleStatus: vehicleOnlineStatusQueryState?.currentData?.result?.is_online,
      vehicleStatusSentTime: vehicleLastOnlineQueryState?.currentData?.result?.sentTime
        ? getLastSeenTime(vehicleLastOnlineQueryState?.currentData?.result?.sentTime)
        : '',

      lastOnline: vehicleLastOnlineQueryState?.currentData?.result?.sentTime
        ? getDateByTimeZone(vehicleLastOnlineQueryState?.currentData?.result?.sentTime)
        : '-',
      vehicleSpeed: vehicleOnlineStatusQueryState?.currentData?.result?.is_online
        ? Math.round(filteredVehicleByPlateNo?.current_speed).toString().concat(' km/h') || '0 km/h'
        : '0 km/h',
      name:
        singleDriverData?.driver_first_name && singleDriverData?.driver_last_name
          ? `${singleDriverData.driver_first_name} ${singleDriverData.driver_last_name}`
          : '-',
      location: filteredVehicleByPlateNo?.location || '-',
      locationSentTime: filteredVehicleByPlateNo?.location_time
        ? `${getLastSeenTime(filteredVehicleByPlateNo?.location_time)}`
        : '',

      driverStatus:
        filteredVehicleByPlateNo?.auth_status === 'Unauthorized'
          ? 'unauthorized'
          : filteredVehicleByPlateNo?.auth_status === 'Authorized'
          ? 'authorized'
          : '-',
      driverStatusSentTime: filteredVehicleByPlateNo?.auth_status_time
        ? getLastSeenTime(filteredVehicleByPlateNo?.auth_status_time)
        : '',
      driverStatusLastSeen: filteredVehicleByPlateNo?.auth_status_time
        ? getDateByTimeZone(filteredVehicleByPlateNo?.auth_status_time)
        : '-',
      lastAnomaly: currentDriverLiveAnomalies.isUninitialized
        ? '-'
        : currentDriverLastAnomaly?.anomaly_type
        ? anomalyTypeEnum[currentDriverLastAnomaly.anomaly_type as keyof anomalyTypeEnumType]
        : '-',
      lastAnomalySentTime: currentDriverLiveAnomalies.isUninitialized
        ? ''
        : currentDriverLastAnomaly?.sentTime
        ? getLastSeenTime(currentDriverLastAnomaly?.sentTime)
        : '',
      distractedCount: currentDriverLiveAnomalies.isUninitialized
        ? '-'
        : currentDriverLiveAnomalies?.data?.result?.distracted[0]?.payload?.distractedCount || '-',
      drowsyCount: currentDriverLiveAnomalies.isUninitialized
        ? '-'
        : currentDriverLiveAnomalies?.data?.result?.drowsy[0]?.payload?.drowsyCount || '-',
      liveviewImage: currentDriverInVehicleQueryState?.currentData?.result?.response?.result || '',
      driverStoredImageUrl: singleDriverData?.driver_media_url || '',
      liveviewURL: filteredVehicleByPlateNo?.vehicle_plate_no || '',
    };

    return detailsTypes[detailType];
  };

  const onCrossIconClick = () => {
    dispatch(
      setMultiple({
        vehiclePlateNo: null,
        selectedVehicleOnMap: null,
        vehicleId: null,
        selectedDriverByName: '',
        selectedVehicleByPlateNo: '',
        fetchSingleVehicleId: null,
        vehiclePlateNoForFilteredVehicle: null,
        fetchSingleDriverId: null,
        driverIdForFilteredVehicle: null,
      }),
    );
  };

  console.log('the check is', getVehicleDetail('vehicleStatus'), vehicleOnlineStatusQueryState?.currentData?.result);

  const onTripButtonClick = () => {
    const vehiclePlateNo = mapOverviewSlice.selectedVehicleOnMap.vehicle_plate_no;
    const vehicleId = mapOverviewSlice.selectedVehicleOnMap.vehicle_id;

    startStopTrip({
      data: {
        vehicle_id: vehicleId,
        // status: !mapOverviewSlice.tripStarted,
        status: 'start',
        start_time: new Date(),
      },
    });

    getActiveTripIdQueryState.refetch();
  };

  return (
    <DriverAndVehicleDetailsStyled isDirectionRtl={reducerState.isDirectionRtl}>
      {!mapOverviewSlice.fetchSingleVehicleId &&
      !mapOverviewSlice.fetchSingleDriverId &&
      !mapOverviewSlice.vehiclePlateNo ? (
        mapOverviewSlice?.driverIdForFilteredVehicle && !mapOverviewSlice?.vehiclePlateNo ? (
          <p className="driver-vehicle-details__details-fetch-error">{'No vehicle exists for this driver.'}</p>
        ) : (
          <div className="driver-vehicle-details__no-vehicle-container">
            <div></div>

            <div className="driver-vehicle-details__no-vehicle-message-container">
              <SearchIcon className="driver-vehicle-details__no-vehicle-search-icon" />
              <p className="driver-vehicle-details__no-vehicle-message">
                {t(`${rightSidebarTranslationsPath}.selectVehicle`)}
              </p>
            </div>

            {location.pathname === '/overview' && <div></div>}

            {location.pathname !== '/overview' && (
              <Btn
                variant="theme"
                className="driver-vehicle-details__map-view-button"
                onClick={() => navigate('/overview')}
              >
                {t(`${rightSidebarTranslationsPath}.mapViewText`)}
              </Btn>
            )}
          </div>
        )
      ) : (
        <>
          {
            <>
              <i className="pi pi-times-circle" onClick={() => onCrossIconClick()}></i>
              <section className="driver-vehicle-details__driver-details">
                <main className="driver-vehicle-details__driver-details-body">
                  <div className="driver-vehicle-details__driver-picture-container">
                    <div className="driver-vehicle-details__driver-picture">
                      <img src={getVehicleDetail('liveviewImage')} alt="Driver" />
                    </div>

                    {getVehicleDetail('driverStatus').toLowerCase() === 'unauthorized' ? (
                      <DriverUnAuthorizedIcon style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <DriverAuthorized style={{ width: '20px', height: '20px' }} />
                    )}
                    <div className="driver-vehicle-details__driver-picture">
                      {getVehicleDetail('driverStatus').toLowerCase() !== 'authorized' && (
                        <img src={DriverUnAuthorizedAvatar} alt="Unauthorized Driver" />
                      )}
                      {getVehicleDetail('driverStatus').toLowerCase() === 'authorized' && (
                        <S3Image url={getVehicleDetail('driverStoredImageUrl')} />
                      )}
                    </div>
                  </div>

                  <div className="driver-vehicle-details__details-section">
                    <DetailRow>
                      <Title>
                        {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.vehiclePlateNoText`)}
                      </Title>
                      <Value>{getVehicleDetail('vehiclePlateNo')}</Value>
                    </DetailRow>

                    <DetailRow>
                      <Title>
                        {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.vehicleStatusText`)}
                      </Title>
                      {vehicleLastOnlineQueryState.isLoading ||
                      (!vehicleLastOnlineQueryState.isUninitialized && !vehicleLastOnlineQueryState.currentData) ? (
                        <Spinner width={14} height={14} />
                      ) : (
                        <>
                          <Value
                            valueColor={`${
                              getVehicleDetail('vehicleStatus') === false
                                ? 'var(--vehicle-offline-status-color)'
                                : 'var(--green-color)'
                            } `}
                          >
                            {getVehicleDetail('vehicleStatus') === false
                              ? t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.offlineText`)
                              : t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.onlineText`)}
                          </Value>
                          <TimeElapsed>
                            {getVehicleDetail('vehicleStatus') === false
                              ? getVehicleDetail('vehicleStatusSentTime')
                              : 'now'}
                          </TimeElapsed>
                        </>
                      )}
                    </DetailRow>

                    {getVehicleDetail('vehicleStatus') === false && (
                      <DetailRow>
                        <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.lastOnlineText`)}</Title>
                        {vehicleLastOnlineQueryState.isLoading ||
                        (!vehicleLastOnlineQueryState.isUninitialized && !vehicleLastOnlineQueryState.currentData) ? (
                          <Spinner width={14} height={14} />
                        ) : (
                          <Value>{getVehicleDetail('lastOnline')}</Value>
                        )}
                      </DetailRow>
                    )}

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.lastLocationText`)}</Title>
                      <Value>{getVehicleDetail('location')}</Value>
                      <TimeElapsed>{getVehicleDetail('locationSentTime')}</TimeElapsed>
                    </DetailRow>

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.vehicleSpeedText`)}</Title>
                      <Value>{getVehicleDetail('vehicleSpeed')}</Value>
                    </DetailRow>

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.driverNameText`)}</Title>
                      {singleDriverQueryState.isLoading ||
                      (!singleDriverQueryState.isUninitialized && !singleDriverQueryState.currentData) ? (
                        <Spinner width={14} height={14} />
                      ) : (
                        <Value>{getVehicleDetail('name')}</Value>
                      )}
                    </DetailRow>

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.driverStatusText`)}</Title>
                      {singleDriverQueryState.isLoading ||
                      (!singleDriverQueryState.isUninitialized && !singleDriverQueryState.currentData) ? (
                        <Spinner width={14} height={14} />
                      ) : (
                        <>
                          <Value
                            valueColor={
                              getVehicleDetail('driverStatus').toLowerCase() === 'unauthorized'
                                ? 'var(--error-color)'
                                : getVehicleDetail('driverStatus').toLowerCase() === 'authorized'
                                ? 'var(--green-color)'
                                : ''
                            }
                          >
                            {getVehicleDetail('driverStatus').toLowerCase() === 'unauthorized'
                              ? t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.unauthorizedText`)
                              : getVehicleDetail('driverStatus').toLowerCase() === 'authorized'
                              ? t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.authorizedText`)
                              : '-'}
                          </Value>
                          <TimeElapsed>{getVehicleDetail('driverStatusSentTime')}</TimeElapsed>
                        </>
                      )}
                    </DetailRow>

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.lastUpdateText`)}</Title>
                      {singleDriverQueryState.isLoading ||
                      (!singleDriverQueryState.isUninitialized && !singleDriverQueryState.currentData) ? (
                        <Spinner width={14} height={14} />
                      ) : (
                        <Value>{getVehicleDetail('driverStatusLastSeen')}</Value>
                      )}
                    </DetailRow>

                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.lastAnomalyText`)}</Title>
                      {currentDriverLiveAnomalies.isLoading ||
                      (!currentDriverLiveAnomalies.isUninitialized && !currentDriverLiveAnomalies.currentData) ? (
                        <Spinner width={14} height={14} />
                      ) : (
                        <>
                          <Value valueColor="var(--error-color)">{getVehicleDetail('lastAnomaly')}</Value>
                          <TimeElapsed>{getVehicleDetail('lastAnomalySentTime')}</TimeElapsed>
                        </>
                      )}
                    </DetailRow>

                    <div className="driver-vehicle-details__distracted-drowsy-count-table">
                      <p className="driver-vehicle-details__distracted-count-title">
                        {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.distractedCountText`)}
                      </p>
                      <p className="driver-vehicle-details__drowsy-count-title">
                        {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.drowsyCountText`)}
                      </p>

                      <p className="driver-vehicle-details__distracted-count-value">
                        {getVehicleDetail('distractedCount')}
                      </p>
                      <p className="driver-vehicle-details__drowsy-count-value">{getVehicleDetail('drowsyCount')}</p>
                    </div>
                  </div>
                </main>

                <footer className="driver-vehicle-details__footer">
                  {location.pathname === '/driver-management/live-view' && (
                    <Btn
                      variant="theme"
                      className="driver-vehicle-details__map-view-button"
                      onClick={() => navigate('/overview')}
                    >
                      Map View
                    </Btn>
                  )}
                  {location.pathname !== '/driver-management/live-view' && (
                    <Btn
                      variant="theme"
                      className="driver-vehicle-details__live-view-button"
                      onClick={() =>
                        getVehicleDetail('vehiclePlateNo') && getVehicleDetail('vehicleId')
                          ? navigate(
                              `/driver-management/live-view?plate_no=${getVehicleDetail(
                                'vehiclePlateNo',
                              )}&id=${getVehicleDetail('vehicleId')}`,
                            )
                          : null
                      }
                    >
                      {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.liveViewText`)}
                    </Btn>
                  )}
                  {!location.pathname.includes('reports') && (
                    <>
                      <Tooltip
                        target=".driver-vehicle-details__driver-reports-icon"
                        //@ts-ignore
                        content={t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.seeReportsText`)}
                        position="left"
                      />
                      <DriverStatsIcon
                        className="driver-vehicle-details__driver-reports-icon"
                        onClick={() => navigate('/reports')}
                      />
                    </>
                  )}
                </footer>
              </section>

              <section className="driver-vehicle-details__trip-container">
                <p className="driver-vehicle-details__trip-status-heading">
                  {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.tripStatusHeading`)}
                </p>

                {startStopTripQueryState.isLoading || getActiveTripIdQueryState.isFetching ? (
                  <Spinner width={14} height={14} />
                ) : (
                  <p
                    className={`driver-vehicle-details__trip-status driver-vehicle-details__trip-status--${
                      mapOverviewSlice.tripStarted === false ? 'not-started' : 'started'
                    }`}
                  >
                    {mapOverviewSlice.tripStarted === false
                      ? t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.tripNotStartedText`)
                      : t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.tripStartedText`)}
                  </p>
                )}

                {getActiveTripIdQueryState?.currentData?.trip_start && (
                  <div className="driver-vehicle-details__trip-started-at-container">
                    <DetailRow>
                      <Title>{t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.startedAtText`)}</Title>
                      <Value>{getDateByTimeZone(getActiveTripIdQueryState?.currentData?.trip_start)}</Value>
                    </DetailRow>
                  </div>
                )}

                <div className="driver-vehicle-details__trip-button-container">
                  {startStopTripQueryState.isLoading || getActiveTripIdQueryState.isFetching ? (
                    <Spinner width={28} height={28} />
                  ) : (
                    <Btn variant={mapOverviewSlice.tripStarted === false ? 'green' : 'red'} onClick={onTripButtonClick}>
                      {mapOverviewSlice.tripStarted === false
                        ? t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.startTripText`)
                        : t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsCard.endTripText`)}
                    </Btn>
                  )}
                </div>
              </section>
            </>
          }
        </>
      )}
    </DriverAndVehicleDetailsStyled>
  );
};

const DriverAndVehicleDetailsStyled = styled.div<{ isDirectionRtl: boolean }>`
  position: relative;
  padding: 22px;
  background-color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .pi-times-circle {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 20px;
    cursor: pointer;
  }

  .driver-vehicle-details__no-vehicle-container {
    display: grid;
    place-items: center;
    row-gap: 60px;
  }

  .driver-vehicle-details__no-vehicle-message-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 8px;
  }

  .driver-vehicle-details__no-vehicle-search-icon {
    height: 28px;
    width: 28px;
  }

  .driver-vehicle-details__no-vehicle-message {
    font-size: 10px;
    line-height: 12px;
    color: var(--text-color);
    text-align: center;
  }

  .driver-vehicle-details__details-fetch-error {
    color: red;
    font-size: 12px;
  }

  .driver-vehicle-details__delete-icon {
    position: absolute;
    top: 0;
    right: 0;
    height: 24px;
    width: 24px;
    cursor: pointer;
  }

  .driver-vehicle-details__driver-details {
    width: 100%;
  }

  .driver-vehicle-details__driver-details-heading,
  .driver-vehicle-details__vehicle-details-heading {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--app-primary-color);
    border-bottom: 1px solid var(--app-primary-color);
  }

  .driver-vehicle-details__driver-details-body {
  }

  .driver-vehicle-details__driver-picture-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .driver-vehicle-details__driver-picture {
    height: 40px;
    width: 40px;
    background-color: silver;
    border-radius: 6px;
  }

  .driver-vehicle-details__driver-picture img {
    height: 100%;
    width: 100%;
    font-size: 12px;
  }

  .driver-vehicle-details__details-section {
    display: grid;
    row-gap: 8px;
    margin-top: 22px;
    width: 100%;
  }

  .driver-vehicle-details__detail-container {
    font-size: 16px;
    line-height: 20px;
    display: flex;
  }

  .driver-vehicle-details__count-container {
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }

  .driver-vehicle-details__distracted-drowsy-count-table {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
  }

  .driver-vehicle-details__distracted-count-title,
  .driver-vehicle-details__drowsy-count-title {
    flex: 0.5;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    text-align: center;
    padding: 8px;
    color: #f47878;
    border: 1px solid #f47878;
    background-color: #f6e6e6;
    border-radius: 8px 8px 0 0;
  }

  .driver-vehicle-details__distracted-count-value,
  .driver-vehicle-details__drowsy-count-value {
    flex: 0.5;
    color: black;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    padding: 20px 12px;
    border-bottom: 1px solid #f47878;
    border-left: 1px solid #f47878;
    border-right: 1px solid #f47878;
    border-radius: 0 0 8px 8px;
  }

  .driver-vehicle-details__footer {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 22px;
  }

  .driver-vehicle-details__driver-reports-icon {
    cursor: pointer;
  }

  .driver-vehicle-details__trip-container {
    display: grid;
    place-items: center;
    border-top: 1px solid black;
    width: 100%;
    padding-top: 8px;
  }

  .driver-vehicle-details__trip-status-heading {
    font-size: 20px;
    line-height: 24px;
    font-weight: 700;
  }

  .driver-vehicle-details__trip-status {
    font-size: 12px;
    font-weight: 600;
  }
  .driver-vehicle-details__trip-status--not-started {
    color: var(--error-color);
  }
  .driver-vehicle-details__trip-status--started {
    color: var(--green-color);
  }

  .driver-vehicle-details__trip-started-at-container {
    padding: 12px 0;
  }

  .driver-vehicle-details__trip-button-container {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media screen and (min-width: 1400px) {
    .driver-vehicle-details__driver-picture {
      width: 60px;
      height: 60px;
    }

    .driver-vehicle-details__details-section {
      row-gap: 12px;
    }

    .driver-vehicle-details__distracted-count-title,
    .driver-vehicle-details__drowsy-count-title {
      font-size: 14px;
      line-height: 18px;
    }

    .driver-vehicle-details__distracted-count-value,
    .driver-vehicle-details__drowsy-count-value {
      font-size: 20px;
      line-height: 24px;
    }
  }

  @media screen and (max-width: 1199px) {
    .driver-vehicle-details__detail-container {
      display: grid;
      place-items: center;
      text-align: center;
    }

    .driver-vehicle-details__footer {
      display: grid;
      place-items: center;
      row-gap: 12px;
      margin-top: 28px;
    }
  }

  @media screen and (max-width: 850px) {
    .driver-vehicle-details__distracted-count-title,
    .driver-vehicle-details__drowsy-count-title {
      line-height: calc(16px + (24 - 16) * ((100vw - 300px) / (1200 - 300)));
      font-size: calc(10px + (18 - 10) * ((100vw - 300px) / (1200 - 300)));
    }
  }
`;

export default DriverAndVehicleDetails;
