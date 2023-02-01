/* eslint-disable react/jsx-no-duplicate-props */
//@ts-nocheck

import { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
// import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';

import Map, { FullscreenControl, Marker, NavigationControl, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { byteCorpGeoCordinates, liveVehiclesLocationInterval, mapOverviewPageTranslationsPath } from 'global/variables';
import { InfoIcon } from 'global/icons';

import { RightSidebarContext } from 'components/contexts/RightSidebarProvider/RightSidebarProvider';
import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useGetCurrentDriverInVehicleQuery, useGetVehiclesLocationsQuery } from 'redux/endpoints/vehicles';

import {
  mapOverviewSelector,
  setClickCount,
  setFetchSingleVehicleId,
  setFilterTouched,
  setInfoWindowData,
  setMultiple,
  setSelectedVehicleOnMap,
  setVehiclePlateNo,
  setVehiclesLocationsCoordinates,
} from 'redux/mapOverview/mapOverviewSlice';
import {
  useGetActiveTripIdQuery,
  useLazyGetActiveTripIdQuery,
  useStartStopTripMutation,
} from 'redux/endpoints/reports';

import Spinner from 'components/Shared/Spinner';
import Btn from 'components/CButtons/Btn';
import MyMarkers from './MyGoogleMap';

import CarOnlineAuthorizedIcon from 'assets/icons/car-online-authorized-icon.png';
import CarOnlineUnAuthorizedIcon from 'assets/icons/car-online-unauthorized-icon.png';
import CarOfflineAuthorizedIcon from 'assets/icons/car-offline-authorized-icon.png';
import CarOfflineUnAuthorizedIcon from 'assets/icons/car-offline-unauthorized-icon.png';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputSwitch } from 'primereact/inputswitch';
import { RadioButton } from 'primereact/radiobutton';
import { capitalize } from 'global/utils';
import { Prev } from 'react-bootstrap/esm/PageItem';
import supercluster from 'supercluster';
import index from 'pages/Profile';

const DriverAndVehicleStats = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const mapOverviewSlice = useSelector(mapOverviewSelector);

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const filterRef = useRef();

  const onStatClick = (stat) => {
    // if (stat.toLowerCase() === 'online') {
    //   const newOnlineValue = !mapOverviewSlice.filterTouched['online'];
    //   const newOfflineValue =
    //     newOnlineValue === true
    //       ? mapOverviewSlice.filterTouched['offline'] === true
    //         ? false
    //         : mapOverviewSlice.filterTouched['offline']
    //       : false;

    //   return dispatch(
    //     setFilterTouched({
    //       ...mapOverviewSlice.filterTouched,
    //       offline: newOfflineValue,
    //       online: newOnlineValue
    //     })
    //   );
    // }

    // if (stat.toLowerCase() === 'offline') {
    //   const newOfflineValue = !mapOverviewSlice.filterTouched['offline'];
    //   const newOnlineValue =
    //     newOfflineValue === true
    //       ? mapOverviewSlice.filterTouched['online'] === true
    //         ? false
    //         : mapOverviewSlice.filterTouched['online']
    //       : false;

    //   return dispatch(
    //     setFilterTouched({
    //       ...mapOverviewSlice.filterTouched,
    //       offline: newOfflineValue,
    //       online: newOnlineValue
    //     })
    //   );
    // }
    dispatch(
      setFilterTouched({
        ...mapOverviewSlice.filterTouched,
        [stat.toLowerCase()]: !mapOverviewSlice.filterTouched[stat.toLowerCase()],
      }),
    );
  };

  const statToLanguageTextMap = {
    Online: t(`${mapOverviewPageTranslationsPath}.driverAndVehicleStats.onlineText`),
    Offline: t(`${mapOverviewPageTranslationsPath}.driverAndVehicleStats.offlineText`),
    Unauthorized: t(`${mapOverviewPageTranslationsPath}.driverAndVehicleStats.unauthorizedText`),
  };

  console.log('current is', mapOverviewSlice.filterTouched);

  useEffect(() => {
    isFiltersActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOverviewSlice.filterTouched]);

  const isFiltersActive = () => {
    return !Object.keys(mapOverviewSlice.filterTouched).every((key) =>
      key === 'unauthorized'
        ? mapOverviewSlice.filterTouched[key] === false
        : mapOverviewSlice.filterTouched[key] === true,
    );
  };

  console.log('now filter', mapOverviewSlice.filterTouched);

  return (
    <DriverAndVehicleStatsStyled isDirectionRtl={reducerState.isDirectionRtl}>
      {/* <div className="driver-vehicle-stats">
        {Object.keys(mapOverviewSlice.vehicleDriverStats).map((stat) => {
          const isFilterClicked = mapOverviewSlice.filterTouched[stat.toLowerCase()];

          return (
            <div
              key={stat}
              className={`driver-vehicle-stats__stat driver-vehicle-stats__stat--${stat.toLowerCase()}${
                isFilterClicked ? `-touched` : ''
              }`}
              onClick={() => onStatClick(stat)}
            >
              <i
                className={`pi ${
                  isFilterClicked ? 'pi-eye' : 'pi-eye-slash'
                }  driver-vehicle-stats__eye-icon driver-vehicle-stats__eye-icon-${stat.toLowerCase()}${
                  isFilterClicked ? '--active' : '--inactive'
                }`}
              ></i>
              <p
                className={`driver-vehicle-stats__stat-name driver-vehicle-stats__stat-name--${stat.toLowerCase()}${
                  isFilterClicked ? `-touched` : ''
                }`}
              >
                {statToLanguageTextMap[stat]}:
              </p>
              <p
                className={`driver-vehicle-stats__stat-value driver-vehicle-stats__stat-value--${stat.toLowerCase()}${
                  isFilterClicked ? `-touched` : ''
                }`}
              >
                {mapOverviewSlice.vehicleDriverStats[stat]}
              </p>
            </div>
          );
        })}
      </div> */}
      <div className="driver-vehicle-stats-old">
        {Object.keys(mapOverviewSlice.filterTouched).map((key, index) => {
          return (
            <div
              className={`driver-vehicle-stats__stat driver-vehicle-stats__stat--${key.toLowerCase()}-touched
              }`}
            >
              <p
                className={`driver-vehicle-stats__stat-name driver-vehicle-stats__stat-name--${key.toLowerCase()}-touched`}
              >
                {statToLanguageTextMap[capitalize(key)]} :
              </p>
              <p
                className={`driver-vehicle-stats__stat-value driver-vehicle-stats__stat-value--${key.toLowerCase()}-touched`}
              >
                {mapOverviewSlice.vehicleDriverStats[capitalize(key)]}
              </p>
            </div>
          );
        })}
        <div
          className={`${isFiltersActive() ? 'driver-vehicle-stats-active' : 'driver-vehicle-stats'} identifier`}
          onClick={(e) => filterRef.current.toggle(e)}
          title={isFiltersActive() ? 'Filters are active' : 'No filters applied'}
        >
          <i className="pi pi-filter" style={{ color: isFiltersActive() ? 'white' : '#888' }}></i>
          <p>Filters</p>
        </div>
      </div>

      <OverlayPanel
        breakpoints={{ '960px': '75vw', '640px': '80vw' }}
        style={{ width: '300px', marginTop: '-10px', boxShadow: '10px 10px 30px rgba(0,0,0,0.5)' }}
        ref={filterRef}
        showCloseIcon
        dismissable
        className="mobile-overlay-class"
      >
        <OverlayStyled>
          <div className="filter-header">
            <p style={{ textAlign: 'center' }}>Vehicle Display Filters</p>
          </div>
          <div>
            {Object.keys(mapOverviewSlice.filterTouched).map((key, index) => {
              return (
                <div className="filter-each-section">
                  <p
                    style={{
                      color: 'black',
                    }}
                  >
                    {key === 'unauthorized'
                      ? capitalize('Unauthorized').concat(' Vehicles')
                      : capitalize(key).concat(' Vehicles')}
                  </p>

                  <InputSwitch
                    checked={mapOverviewSlice.filterTouched[key]}
                    value={mapOverviewSlice.filterTouched[key]}
                    onChange={(e) => {
                      let localObj = { ...mapOverviewSlice.filterTouched };

                      localObj[key] = e.target.value;

                      /*Checks for authorized switch */
                      // if (key === 'unauthorized' && e.target.value === true) {
                      //   Object.keys(localObj).map((key, index) => {
                      //     return key !== 'unauthorized' && { ...localObj, [key]: true };
                      //   });
                      // }

                      dispatch(setFilterTouched(localObj));
                    }}
                  />

                  {/* <Checkbox
                    inputId={index}
                    value={mapOverviewSlice.filterTouched[key]}
                    name="filters"
                    onChange={(e) => {
                      let localObj = { ...mapOverviewSlice.filterTouched };

                      localObj[key] = e.target.checked;

                      dispatch(setFilterTouched(localObj));
                    }}
                    checked={mapOverviewSlice.filterTouched[key]}
                  /> */}
                </div>
              );
            })}
          </div>
        </OverlayStyled>
      </OverlayPanel>

      {/* <Dialog
        style={{ width: '25vw', minWidth: '300px' }}
        header="Filters"
        visible={openFilterDialog}
        onHide={() => setOpenFilterDialog(false)}
      >
        <FilterPopUpStyled>
           <div className="filter-each-section">
            <p style={{ fontWeight: 600, textDecoration: 'underline' }}>Status</p>
            <p style={{ fontWeight: 600, textDecoration: 'underline' }}>Display</p>
          </div>

          {Object.keys(mapOverviewSlice.filterTouched).map((key, index) => {
            return (
              <div className="filter-each-section">
                <p
                  style={{
                    color: 'var(--app-primary-color)',
                  }}
                >
                  {key === 'unauthorized'
                    ? capitalize('Unauthorized').concat(' Only')
                    : capitalize(key).concat(' Vehicles')}
                </p>

                <Checkbox
                  inputId={index}
                  value={mapOverviewSlice.filterTouched[key]}
                  name="filters"
                  onChange={(e) => {
                    let localObj = { ...mapOverviewSlice.filterTouched };

                    localObj[key] = e.target.checked;

                    dispatch(setFilterTouched(localObj));
                  }}
                  checked={mapOverviewSlice.filterTouched[key]}
                />
              </div>
            );
          })}

          <div
            className="reset__btn"
            onClick={() => dispatch(setFilterTouched({ online: true, offline: true, unauthorized: false }))}
          >
            <p>Reset Filters</p>
          </div>
        </FilterPopUpStyled>
      </Dialog> */}
    </DriverAndVehicleStatsStyled>
  );
};

const OverlayStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .filter-header {
    border-bottom: 1px solid var(--app-primary-color);

    p {
      color: var(--app-primary-color);
    }
  }

  .p-overlaypanel-close {
    background: green;
    color: blue;
  }

  .filter-each-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .reset__btn {
    padding: 10px 18px;
    border-radius: 10px;
    background: var(--app-primary-color);
    color: white;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 50%;
    min-width: 250px;
    align-self: center;
    cursor: pointer;
    margin-top: 20px;

    p {
      margin: 0px;
    }
  }
`;

const FilterPopUpStyled = styled.div`
  display: flex;
  flex-direction: column;

  .filter-each-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .reset__btn {
    padding: 10px 18px;
    border-radius: 10px;
    background: var(--app-primary-color);
    color: white;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 50%;
    min-width: 250px;
    align-self: center;
    cursor: pointer;
    margin-top: 20px;

    p {
      margin: 0px;
    }
  }
`;

const DriverAndVehicleStatsStyled = styled.div<{ isDirectionRtl: boolean }>`
  --stat-name-color: #303030;
  --unauthorized-color: #f31919;
  --online-color: #14ae5c;
  --offline-color: #999999;

  .mobile-overlay-class {
    @media (max-width: 800px) {
      margin-left: 20px;
    }
  }

  p {
    margin: 0px;
  }

  .driver-vehicle-stats-old {
    z-index: 1;
    position: absolute;
    bottom: 65px;
    left: 35px;
    display: flex;
    flex-direction: row;
    gap: 16px;
    font-size: 12px;
    direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

    @media (max-width: 800px) {
      flex-direction: column !important;
      align-items: flex-start;
    }
  }

  .driver-vehicle-stats-active {
    background-color: var(--app-primary-color);

    padding: 4px 12px;
    border-radius: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    cursor: pointer;
    box-shadow: 0 0 0 2px rgb(0 0 0 / 10%);
    direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
    color: white;
  }

  .driver-vehicle-stats {
    background-color: white;

    padding: 4px 12px;
    border-radius: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    cursor: pointer;
    box-shadow: 0 0 0 2px rgb(0 0 0 / 10%);
    direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
    color: var(--offline-color);
  }

  .driver-vehicle-stats__stat {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 4px 12px;
    border-radius: 10px;
    column-gap: 6px;
  }

  .driver-vehicle-stats__eye-icon {
  }
  .driver-vehicle-stats__eye-icon-unauthorized--inactive {
    color: var(--unauthorized-color);
  }
  .driver-vehicle-stats__eye-icon-online--inactive {
    color: var(--online-color);
  }
  .driver-vehicle-stats__eye-icon-offline--inactive {
    color: 3var (--offline-color);
  }
  .driver-vehicle-stats__eye-icon-unauthorized--active {
    color: white;
  }
  .driver-vehicle-stats__eye-icon-online--active {
    color: white;
  }
  .driver-vehicle-stats__eye-icon-offline--active {
    color: white;
  }

  .driver-vehicle-stats__stat p {
    margin: 0;
    user-select: none;
    font-size: 12px;
  }

  .driver-vehicle-stats__stat--unauthorized {
    border: 1px solid var(--unauthorized-color);
  }
  .driver-vehicle-stats__stat--online {
    border: 1px solid var(--online-color);
  }
  .driver-vehicle-stats__stat--offline {
    border: 1px solid var(--offline-color);
  }

  .driver-vehicle-stats__stat--unauthorized-touched {
    border: 1px solid var(--unauthorized-color);
    background-color: var(--unauthorized-color);
  }
  .driver-vehicle-stats__stat--online-touched {
    border: 1px solid var(--online-color);
    background-color: var(--online-color);
  }
  .driver-vehicle-stats__stat--offline-touched {
    border: 1px solid var(--offline-color);
    background-color: var(--offline-color);
  }

  .driver-vehicle-stats__stat-name {
    color: var(--stat-name-color);
  }
  .driver-vehicle-stats__stat-name--unauthorized-touched {
    color: white;
  }
  .driver-vehicle-stats__stat-name--online-touched {
    color: white;
  }
  .driver-vehicle-stats__stat-name--offline-touched {
    color: white;
  }

  .driver-vehicle-stats__stat-value {
    font-weight: 700;
  }
  .driver-vehicle-stats__stat-value--unauthorized {
    color: var(--unauthorized-color);
  }
  .driver-vehicle-stats__stat-value--online {
    color: var(--online-color);
  }
  .driver-vehicle-stats__stat-value--offline {
    color: var(--offline-color);
  }

  .driver-vehicle-stats__stat-value--unauthorized-touched {
    color: white;
  }
  .driver-vehicle-stats__stat-value--online-touched {
    color: white;
  }
  .driver-vehicle-stats__stat-value--offline-touched {
    color: white;
  }
`;

const MapDetailsInfo = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

  const infoOverlayRef = useRef(null);
  const initialOverlayShow = useRef(null);

  useEffect(() => {
    if (showInfoOverlay) {
      function onWindowClick(event) {
        if (initialOverlayShow.current) {
          initialOverlayShow.current = false;
          return;
        }

        if (!initialOverlayShow.current) {
          if (!infoOverlayRef.current.contains(event.target)) {
            setShowInfoOverlay(false);
          }
        }
      }

      initialOverlayShow.current = true;
      window.addEventListener('click', onWindowClick);

      return () => {
        initialOverlayShow.current = null;
        window.removeEventListener('click', onWindowClick);
        return;
      };
    }
  }, [showInfoOverlay]);

  return (
    <MapDetailsInfoStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <InfoIcon
        className={`map-details-info__info-icon ${showInfoOverlay ? 'map-details-info__info-icon--active' : ''}`}
        onClick={() => setShowInfoOverlay((prev) => !prev)}
      />

      <CSSTransition
        in={showInfoOverlay}
        timeout={150}
        classNames="map-details-info__info-container-transition"
        unmountOnExit
      >
        <div className="map-details-info__icons-info" ref={infoOverlayRef}>
          <div className="map-details-info__icon-info">
            <img src={CarOfflineAuthorizedIcon} alt="icon" className="map-details-info__icon-image" />
            {'->'}
            <p className="map-details-info__icon-text">
              {t(`${mapOverviewPageTranslationsPath}.mapDetailsInfo.vehicleOfflineDriverAuthorizedText`)}
            </p>
          </div>

          <div className="map-details-info__icon-info">
            <img src={CarOfflineUnAuthorizedIcon} alt="icon" className="map-details-info__icon-image" />
            {'->'}
            <p className="map-details-info__icon-text">
              {' '}
              {t(`${mapOverviewPageTranslationsPath}.mapDetailsInfo.vehicleOfflineDriverUnauthorizedText`)}
            </p>
          </div>

          <div className="map-details-info__icon-info">
            <img src={CarOnlineAuthorizedIcon} alt="icon" className="map-details-info__icon-image" />
            {'->'}
            <p className="map-details-info__icon-text">
              {' '}
              {t(`${mapOverviewPageTranslationsPath}.mapDetailsInfo.vehicleOnlineDriverAuthorizedText`)}
            </p>
          </div>

          <div className="map-details-info__icon-info">
            <img src={CarOnlineUnAuthorizedIcon} alt="icon" className="map-details-info__icon-image" />
            {'->'}
            <p className="map-details-info__icon-text">
              {' '}
              {t(`${mapOverviewPageTranslationsPath}.mapDetailsInfo.vehicleOnlineDriverUnauthorizedText`)}
            </p>
          </div>
        </div>
      </CSSTransition>
    </MapDetailsInfoStyled>
  );
};

const MapDetailsInfoStyled = styled.div<{ isDirectionRtl: boolean }>`
  position: absolute;
  top: 10px;
  right: 24px;
  z-index: 1;
  padding: 12px;
  display: grid;

  .map-details-info__info-icon {
    height: 20px;
    width: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    justify-self: flex-end;
    fill: #9d9d9d;
  }

  .map-details-info__info-icon--active {
    fill: #48a0dc;
  }

  .map-details-info__info-container-transition-enter {
    opacity: 0;
  }
  .map-details-info__info-container-transition-enter-active {
    opacity: 1;
    transition: all 0.15s ease;
  }

  .map-details-info__info-container-transition-exit {
    opacity: 1;
  }
  .map-details-info__info-container-transition-exit-active {
    opacity: 0;
    transition: all 0.15s ease;
  }

  .map-details-info__icons-info {
    margin-top: 10px;
    background-color: white;
    border: 4px solid black;
    border-radius: 8px;
    display: grid;
    row-gap: 12px;
    padding: 12px;
    min-width: 305px;
    direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
  }

  .map-details-info__icon-info {
    display: flex;
    align-items: center;
    column-gap: 8px;
    font-size: 12px;
  }

  .map-details-info__icon-image {
    height: 32px;
    width: 32px;
  }

  .map-details-info__icon-text {
    margin: 0;
  }
`;

function GoogleMap(props: any) {
  const [rightSidebarState, rightSidebarDispatch] = useContext(RightSidebarContext);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const mapOverviewSlice = useSelector(mapOverviewSelector);
  console.log('mapOverviewSlice from store:', mapOverviewSlice);

  const queryState = useGetVehiclesLocationsQuery(null, {
    pollingInterval: liveVehiclesLocationInterval,
  });
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
  console.log('%cvehicleLocations queryState:', 'background-color:green;color:white;', queryState);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  console.log('%cmapRef:', 'background-color:purple;', mapRef);

  const [vehiclePositions, setVehiclePositions] = useState({});
  const [viewport, setViewport] = useState({ latitude: 24.9181115, longitude: 67.12395766666667, zoom: 4 });
  console.log('%cviewport:', 'background-color:red;', viewport);
  console.log('%cvehiclePositions:', 'background-color:black;color:white;', vehiclePositions);

  let token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').token : null;

  console.log('my token ', token);

  let mapResizer;
  const onMapLoaded = (e) => {
    mapResizer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    mapResizer.observe(mapContainerRef.current);
  };
  const onMapRemoved = (e) => {
    mapResizer?.disconnect();
  };

  const vehicles = useMemo(() => {
    let vehicles = [...(queryState.data?.result || [])];

    if (mapOverviewSlice.driverIdForFilteredVehicle) {
      vehicles = vehicles.filter((vehicle) => vehicle?.driver_id === mapOverviewSlice.driverIdForFilteredVehicle);
    }
    if (mapOverviewSlice.vehiclePlateNoForFilteredVehicle) {
      vehicles = vehicles.filter(
        (vehicle) => vehicle?.vehicle_plate_no === mapOverviewSlice.vehiclePlateNoForFilteredVehicle,
      );
    }

    const mapFilters = mapOverviewSlice.filterTouched;

    /*Case 1: Unauthorized Switch is turned on (regardless of other switches) */

    if (mapFilters['unauthorized']) {
      vehicles = vehicles.filter((el, index) => el.auth_status === 'Unauthorized');
    }

    /*Now onwards unauthorized switch would be turned off */

    if (!mapFilters['unauthorized']) {
      /*Case 2: Vehicle online and offline switches are active*/
      if (mapFilters['online'] && mapFilters['offline']) {
        return vehicles;
      }

      /*Case 3: Vehicle offline and online siwtches are not active */
      if (!mapFilters['online'] && !mapFilters['offline']) {
        return (vehicles = []);
      }

      /*Case 4: Vehicle online active and offline not active */
      if (mapFilters['online'] && !mapFilters['offline']) {
        vehicles = vehicles.filter((el, index) => el.is_online === true);
      }

      /*Case 5: Vehicle online not active but offline active */
      if (!mapFilters['online'] && mapFilters['offline']) {
        vehicles = vehicles.filter((el, index) => el.is_online === false);
      }

      /*Case 6: Vehicle online not active and offline not active */
      if (!mapFilters['online'] && !mapFilters['offline']) {
        return (vehicles = []);
      }
    }

    const isSelectedVehicleOnMapPresentInVehicles = vehicles.find(
      (vehicle) => vehicle.vehicle_id === mapOverviewSlice?.selectedVehicleOnMap?.vehicle_id,
    );
    if (!isSelectedVehicleOnMapPresentInVehicles) {
      dispatch(
        setMultiple({
          selectedVehicleOnMap: null,
          vehiclePlateNo: null,
          fetchSingleVehicleId: null,
          fetchSingleDriverId: null,
        }),
      );
    }

    return vehicles;
  }, [
    dispatch,
    mapOverviewSlice.driverIdForFilteredVehicle,
    mapOverviewSlice.filterTouched,
    mapOverviewSlice.selectedVehicleOnMap,
    mapOverviewSlice.vehiclePlateNoForFilteredVehicle,
    queryState.data?.result,
  ]);
  console.log('%cvehicles to render on map:', 'background-color:green;color:white;', vehicles);

  useEffect(() => {
    if (!mapOverviewSlice.selectedVehicleOnMap) {
      setViewport((prev) => ({
        ...prev,
        latitude: 24.9181115,
        longitude: 67.12395766666667,
        zoom: 4,
      }));
    } else {
      setViewport((prev) => ({
        ...prev,
        latitude: Number(mapOverviewSlice.selectedVehicleOnMap?.latitude),
        longitude: Number(mapOverviewSlice.selectedVehicleOnMap?.longitude),
        zoom: 8,
      }));
    }
  }, [mapOverviewSlice.selectedVehicleOnMap]);

  useEffect(() => {
    const vehiclePositionsObj = {};
    for (let i = 0; i < vehicles.length; i++) {
      vehiclePositionsObj[`${vehicles[i]?.vehicle_plate_no}`] = {
        lat: vehicles[i]?.latitude,
        lng: vehicles[i]?.longitude,
      };
    }

    console.log('vehiclePositionsObj:', vehiclePositionsObj);

    setVehiclePositions(vehiclePositionsObj);
  }, [vehicles]);

  // useEffect(() => {
  //   if (mapOverviewSlice.selectedVehicleOnMap) {
  //     const newVehicle = vehicles?.filter(
  //       (vehicle) => vehicle.vehicle_id === mapOverviewSlice.selectedVehicleOnMap.vehicle_id
  //     );
  //     dispatch(setSelectedVehicleOnMap(newVehicle[0]));
  //     return;
  //   }

  //   const selected = vehicles?.[0];
  //   dispatch(setSelectedVehicleOnMap(selected));
  // }, [dispatch, mapOverviewSlice.selectedVehicleOnMap, vehicles]);
  // console.log('%cselectedVehicleOnMap:', 'background-color:green;color:white;', mapOverviewSlice.selectedVehicleOnMap);

  useEffect(() => {
    if (mapOverviewSlice.clickCount === 3) {
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
    }
  }, [dispatch, mapOverviewSlice.clickCount]);

  // const clusterIndex = new supercluster({
  //   radius: 60,
  //   maxZoom: 16,
  // });

  // clusterIndex.load(vehicles);

  // const clusters = clusterIndex.getClusters([-180, -85, 180, 85], map.getZoom());

  // console.log('the clusters', clusters);

  const onMapClicked = (e) => {
    console.log('%conMapClicked:', 'background-color:yellow;', e);
    dispatch(setClickCount(mapOverviewSlice.clickCount + 1));
  };

  const onMarkerClick = (vehicle) => {
    console.log('onMarkerClick:', vehicle);
    const vehiclePlateNo = vehicle.vehicle_plate_no;
    const vehicleId = vehicle.vehicle_id;
    const driverId = vehicle?.driver_id;

    setViewport((prev) => ({
      ...prev,
      latitude: vehicle?.latitude || prev.latitude,
      longitude: vehicle?.longitude || prev.longitude,
    }));

    console.log('selected driver is', driverId);

    dispatch(
      setMultiple({
        vehiclePlateNo,
        selectedVehicleOnMap: vehicle,
        fetchSingleVehicleId: vehicleId,
        fetchSingleDriverId: driverId,
      }),
    );
    rightSidebarDispatch({
      type: 'SET_SHOW_DRIVER_AND_VEHICLE_DETAILS',
      payload: true,
    });

    dispatch(setClickCount(1));
  };

  useEffect(() => {
    if (mapOverviewSlice.selectedVehicleOnMap !== null) {
      const selectedVehicleOnMap = mapOverviewSlice.selectedVehicleOnMap;

      const filteredVehicleFromAllVehicles = vehicles.find((vehicle) => {
        return vehicle?.vehicle_plate_no === selectedVehicleOnMap?.vehicle_plate_no;
      });

      if (filteredVehicleFromAllVehicles?.longitude && filteredVehicleFromAllVehicles?.latitude) {
        mapRef.current?.setCenter([
          filteredVehicleFromAllVehicles?.longitude,
          filteredVehicleFromAllVehicles?.latitude,
        ]);
      }

      console.log('thay', filteredVehicleFromAllVehicles);

      dispatch(setSelectedVehicleOnMap(filteredVehicleFromAllVehicles));
    }
  }, [dispatch, mapOverviewSlice.selectedVehicleOnMap, vehicles]);

  // useEffect(() => {
  //   if (vehicles?.length > 0) {
  //     if (queryState.isFetching === false) {
  //       const vehiclesLocationsCoordinates = {};

  //       for (let i = 0; i < vehicles.length; i++) {
  //         const currentLatitude =
  //           mapOverviewSlice.vehiclesLocationsCoordinates?.[`${vehicles[i].vehicle_plate_no}`]?.current?.latitude ||
  //           vehicles[i]?.latitude;

  //         const currentLongitude =
  //           mapOverviewSlice.vehiclesLocationsCoordinates?.[`${vehicles[i].vehicle_plate_no}`]?.current?.longitude ||
  //           vehicles[i]?.longitude;

  //         console.log('currentLatitude:', currentLatitude, Number(currentLatitude) + 0.1);
  //         console.log('currentLongitude:', currentLongitude, Number(currentLongitude) + 0.1);

  //         vehiclesLocationsCoordinates[`${vehicles[i].vehicle_plate_no}`] = {
  //           previous: {
  //             latitude:
  //               mapOverviewSlice.vehiclesLocationsCoordinates?.[`${vehicles[i].vehicle_plate_no}`]?.current?.latitude ||
  //               null,
  //             longitude:
  //               mapOverviewSlice.vehiclesLocationsCoordinates?.[`${vehicles[i].vehicle_plate_no}`]?.current
  //                 ?.longitude || null,
  //           },
  //           current: {
  //             latitude: `${Number(currentLatitude) + 0.0001}`,
  //             longitude: `${Number(currentLongitude) + 0.0001}`,
  //           },
  //         };
  //       }

  //       console.log(
  //         '%cvehiclesLocationsCoordinates:',
  //         'background-color:deeppink;color:white;',
  //         vehiclesLocationsCoordinates,
  //       );
  //       dispatch(setVehiclesLocationsCoordinates(vehiclesLocationsCoordinates));
  //     }
  //   }
  // }, [queryState.isFetching]);

  // useEffect(() => {
  //   function animateVehicle() {
  //     const totalVehicleLocationCoordinates = mapOverviewSlice.vehiclesLocationsCoordinates;

  //     for (let vehiclePlateNo in totalVehicleLocationCoordinates) {
  //       const vehicleLocationCoordinates = totalVehicleLocationCoordinates[vehiclePlateNo];

  //       if (!vehicleLocationCoordinates?.previous?.latitude) {
  //         return {
  //           lat: vehicleLocationCoordinates?.current?.latitude,
  //           lng: vehicleLocationCoordinates?.current?.longitude
  //         };
  //       } else {
  //         let prevLat = Number(vehicleLocationCoordinates.previous.latitude);
  //         let curLat = Number(vehicleLocationCoordinates.current.latitude);
  //         let prevLng = Number(vehicleLocationCoordinates.previous.longitude);
  //         let curLng = Number(vehicleLocationCoordinates.current.longitude);

  //         let numDeltas = 100;
  //         let i = 0;

  //         let deltaLat = (curLat - prevLat) / numDeltas;
  //         let deltaLng = (curLng - prevLng) / numDeltas;

  //         animateMarker({ vehiclePlateNo, deltaLat, deltaLng, prevLat, prevLng, i, numDeltas });
  //       }
  //     }
  //   }

  //   animateVehicle();
  // }, [mapOverviewSlice.vehiclesLocationsCoordinates]);

  // const animateMarker = (params) => {
  //   console.log('%canimateMarker params:', 'background-color:burlywood', params);

  //   let { vehiclePlateNo, deltaLat, deltaLng, prevLat, prevLng, i, numDeltas } = params;

  //   prevLat += deltaLat;
  //   prevLng += deltaLng;

  //   setVehiclePositions((prev) => ({
  //     ...prev,
  //     [vehiclePlateNo]: {
  //       lat: `${prevLat}`,
  //       lng: `${prevLng}`
  //     }
  //   }));

  //   if (i !== numDeltas) {
  //     i++;

  //     setTimeout(() => {
  //       animateMarker({ vehiclePlateNo, deltaLat, deltaLng, prevLat, prevLng, i, numDeltas });
  //     }, 10);
  //   }
  // };

  const getIconAccordingToVehicleStats = (vehicle) => {
    const driverIsOnline = vehicle?.is_online === true;
    const driverIsUnAuthorized = vehicle?.auth_status === false || vehicle?.auth_status === 'Unauthorized';

    console.log('vehicle incoming', vehicle, driverIsOnline);

    if (driverIsOnline && !driverIsUnAuthorized) {
      return CarOnlineAuthorizedIcon;
    }
    if (driverIsOnline && driverIsUnAuthorized) {
      return CarOnlineUnAuthorizedIcon;
    }
    if (!driverIsOnline && driverIsUnAuthorized) {
      return CarOfflineUnAuthorizedIcon;
    }

    return CarOfflineAuthorizedIcon;
  };

  return (
    <GoogleMapStyled>
      {
        // queryState.isError ? (
        //   <div className="google-map__vehicle-locations-fetch-error-container">
        //     <p className="google-map__vehicle-locations-fetch-error-title">{t(`someErrorOccurredText`)}!</p>
        //     <p className="google-map__vehicle-locations-fetch-error">
        //       {queryState.error?.data?.message || queryState.error?.data}
        //     </p>
        //     <Btn variant="theme" onClick={() => queryState.refetch()}>
        //       {t(`tryFetchingAgainText`)}
        //     </Btn>
        //   </div>
        // ) :
        queryState.isLoading ? (
          <Spinner className="google-map__vehicle-locations-loader" />
        ) : (
          <>
            <DriverAndVehicleStats />

            <MapDetailsInfo />

            <div ref={mapContainerRef} className="google-map__map-container">
              <Map
                initialViewState={viewport}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                onClick={(e) => onMapClicked(e)}
                onLoad={onMapLoaded}
                onRemove={onMapRemoved}
                ref={mapRef}
                attributionControl={false}
              >
                <FullscreenControl position="top-left" />
                <NavigationControl position="bottom-right" visualizePitch={true} />
                <ScaleControl position="bottom-right" />
                {vehicles.map((vehicle, index) => {
                  if (!vehicle) {
                    return <></>;
                  }

                  if (
                    !(
                      vehiclePositions[vehicle.vehicle_plate_no]?.lng && vehiclePositions[vehicle.vehicle_plate_no]?.lat
                    )
                  ) {
                    return <></>;
                  }

                  return (
                    <Marker
                      key={vehicle.vehicle_id}
                      longitude={vehiclePositions[vehicle.vehicle_plate_no]?.lng}
                      latitude={vehiclePositions[vehicle.vehicle_plate_no]?.lat}
                      onClick={() => onMarkerClick(vehicle)}
                      style={{
                        cursor: 'pointer',
                        width:
                          vehicle?.vehicle_id === mapOverviewSlice.selectedVehicleOnMap?.vehicle_id ? '75px' : '50px',
                        height:
                          vehicle?.vehicle_id === mapOverviewSlice.selectedVehicleOnMap?.vehicle_id ? '75px' : '50px',
                      }}
                    >
                      <img
                        src={getIconAccordingToVehicleStats(vehicle)}
                        alt="Vehicle icon"
                        className="google-map__marker-icon"
                      />
                    </Marker>
                  );
                })}
              </Map>
            </div>

            {/* <Map
            google={props.google}
            onClick={onMapClicked}
            containerStyle={{
              position: 'relative'
            }}
            className="google-map__map"
            initialCenter={{
              lat: byteCorpGeoCordinates.latitude,
              lng: byteCorpGeoCordinates.longitude
            }}
            center={{
              lat: mapOverviewSlice?.selectedVehicleOnMap?.payload?.latitude,
              lng: mapOverviewSlice?.selectedVehicleOnMap?.payload?.longitude
            }}
            streetViewControl={false}
            mapTypeControl={false}
            zoom={12}
          >
            {vehicles.map((vehicle, index) => {
              if (!vehicle) {
                return <></>;
              }

              return (
                <Marker
                  key={index}
                  onClick={onMarkerClick}
                  position={vehiclePositions[vehicle.vehicle_plate_no]}
                  vehicleInfo={vehicle}
                  icon={{
                    url: getIconAccordingToVehicleStats(vehicle),
                    anchor: new google.maps.Point(32, 32),
                    scaledSize:
                      vehicle?.vehicle_id === mapOverviewSlice.selectedVehicleOnMap?.vehicle_id
                        ? new google.maps.Size(65, 65)
                        : new google.maps.Size(40, 40)
                  }}
                ></Marker>
              );
            })}
            <MyMarkers
              vehicles={vehicles}
              onMarkerClick={onMarkerClick}
              getIconAccordingToVehicleStats={getIconAccordingToVehicleStats}
              selectedVehicle={selectedVehicle}
            />
          </Map> */}
          </>
        )
      }
    </GoogleMapStyled>
  );
}

const GoogleMapStyled = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 24px 24px 24px;
  position: relative;

  .google-map__vehicle-locations-fetch-error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .google-map__vehicle-locations-fetch-error-title {
    color: red;
    font-weight: 600;
    font-size: 24px;
    margin: 0;
  }

  .google-map__vehicle-locations-fetch-error {
    color: red;
    font-size: 14px;
  }

  .google-map__map-container {
    height: 100%;
    width: 100%;
  }

  .mapboxgl-map {
    // min-height: 500px;
  }

  .google-map__map {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 400px;
    min-width: 300px;
    justify-content: center;
  }

  .google-map__marker-icon {
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 850px) {
    .mapboxgl-map {
      min-height: 500px;
    }
  }

  @media screen and (max-width: 700px) {
    .google-map__map {
      min-height: 600px;
    }
  }
`;

export default GoogleMap;
// export default GoogleApiWrapper({
//   apiKey: process.env.REACT_APP_MAP_API
// })(GoogleMap);
