//@ts-nocheck
import { useMemo, useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import moment from 'moment';

import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';

import { anomaliesMock } from './anomaliesMock';

import { SettingsIcon, VideoIcon, MapIcon, PlaceholderAnomalyImg } from 'global/image';
import { anomaliesPageTranslationsPath, liveVehiclesLocationInterval, rtlLocales } from 'global/variables';
import { anomalyTypeEnum } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { anomaliesSelector, setPageNo } from 'redux/anomalies/anomaliesSlice';
import { authSelector } from 'redux/auth/authSlice';
import { setMultiple } from 'redux/mapOverview/mapOverviewSlice';
import { useGetAllAnomaliesByManagerQuery, useGetAllAnomaliesGroupByDriversQuery } from 'redux/endpoints/anomalies';
import { useGetVehiclesLocationsQuery } from 'redux/endpoints/vehicles';

import Spinner from 'components/Shared/Spinner';
import Btn from 'components/CButtons/Btn';
import { S3Image } from 'components/Shared/S3Image';
import SeeImagePopup from '../SeeImagePopup';

const SettingsBodyTemplate = (rowData) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onMapIconClick = () => {
    // const vehicle = allVehicles.find((vehicle) => vehicle.vehicle_plate_no === rowData.plateNo);
    // const vehiclePlateNo = vehicle.vehicle_plate_no;

    dispatch(setMultiple({ selectedVehicleOnMap: vehicle, vehiclePlateNo: rowData.plateNo }));
    navigate('/overview');
  };

  return (
    <SettingsBodyTemplateStyled>
      <Tooltip
        target=".settings-body__video-icon"
        content={`${
          rowData?.isVehicleOnline
            ? t(`${anomaliesPageTranslationsPath}.tooltips.liveView`)
            : t(`${anomaliesPageTranslationsPath}.tooltips.vehicleOffline`)
        }`}
        position="left"
      />
      <button
        className={`settings-body__icon-button settings-body__video-icon-button ${
          !rowData?.isVehicleOnline ? 'settings-body__video-icon-button--disabled' : ''
        }`}
      >
        <VideoIcon
          className="settings-body__video-icon"
          onClick={() =>
            rowData?.isVehicleOnline &&
            navigate(`/driver-management/live-view?plate_no=${rowData?.plateNo}&id=${rowData?.vehicleId}`)
          }
        />
      </button>

      <Tooltip
        target=".settings-body__map-icon"
        content={t(`${anomaliesPageTranslationsPath}.tooltips.mapView`)}
        position="left"
      />
      <button className="settings-body__icon-button settings-body__map-icon-button" onClick={onMapIconClick}>
        <MapIcon className="settings-body__map-icon" />
      </button>
    </SettingsBodyTemplateStyled>
  );
};

const SettingsBodyTemplateStyled = styled.div`
  display: flex;
  column-gap: 8px;

  .settings-body__icon-button {
    background: none;
    border: none;
    transform: scale(1.4);
  }

  .settings-body__video-icon-button--disabled {
    cursor: not-allowed;
  }

  .settings-body__video-icon-button--disabled path {
    fill: silver;
  }
`;

export default function AnomaliesDataTable() {
  const storeDispatch = useDispatch();
  const [reducerState]: any = useStateValue();
  const { t, i18n } = useTranslation();

  const anomaliesSlice = useSelector(anomaliesSelector);
  const authSlice = useSelector(authSelector);
  const managerId = authSlice.user.user.manager_id;
  console.log('%canomaliesSlice:', 'background-color:darkmagenta;color:white;', anomaliesSlice);

  const allVehiclesLocationsQueryState = useGetVehiclesLocationsQuery(null, {
    pollingInterval: liveVehiclesLocationInterval,
  });

  const getAllAnomaliesByManagerQueryState = useGetAllAnomaliesByManagerQuery({
    managerId,
    pageNo: anomaliesSlice.pageNo,
    noOfItems: anomaliesSlice.noOfItems,
  });
  console.log(
    '%cgetAllAnomaliesByManagerQueryState:',
    'background-color:darkkhaki;',
    getAllAnomaliesByManagerQueryState,
  );

  const allVehicles = useMemo(() => {
    return allVehiclesLocationsQueryState?.data?.result || [];
  }, [allVehiclesLocationsQueryState?.data?.result]);

  console.log(
    '%callVehiclesLocationsQueryState in anomalies:',
    'background-color:crimson;color:white;',
    anomaliesSlice.anomalies,
  );

  const anomaliesDataForTable = useMemo(() => {
    if (anomaliesSlice.anomalies) {
      let _anomalies = anomaliesSlice.anomalies;

      _anomalies = _anomalies.map((anomaly) => {
        return {
          ...anomaly,
          isVehicleOnline: allVehicles.find((vehicle) => vehicle.vehicle_id === anomaly?.vehicleId)?.is_online,
        };
      });

      return _anomalies;
    }

    return [];
  }, [allVehicles, anomaliesSlice.anomalies]);
  console.log('%canomaliesDataForTable', 'background-color:chartreuse;', anomaliesDataForTable);

  const [filters, setFilters] = useState({
    type: { value: null, matchMode: FilterMatchMode.CONTAINS },
    driver: { value: null, matchMode: FilterMatchMode.CONTAINS },
    plateNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    time: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [first, setFirst] = useState(0);
  const [seeImagePopup, setSeeImagePopup] = useState(false);
  const [anomalyImage, setAnomalyImage] = useState(null);

  const onPageHandler = (event) => {
    setFirst(event.first);

    storeDispatch(setPageNo(event.page));
  };

  console.log('anomal data', anomaliesDataForTable);

  return (
    <AnomaliesDataTableStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <Dialog
        header="View Image"
        visible={seeImagePopup}
        style={{ width: '80vw', maxWidth: '540px' }}
        onHide={() => {
          setSeeImagePopup(false);
        }}
        dismissableMask={true}
      >
        <img
          src={anomalyImage}
          onError={({ currentTarget }) => (currentTarget.src = PlaceholderAnomalyImg)}
          alt="Anomaly"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Dialog>

      {
        // getAllAnomaliesByManagerQueryState.isError ? (
        //   <div className="anomalies-data-table__error-container">
        //     <p className="anomalies-data-table__error-title">{t(`someErrorOccurredText`)}!</p>
        //     <p className="anomalies-data-table__error">
        //       {getAllAnomaliesByManagerQueryState.error?.data?.message ??
        //         getAllAnomaliesByManagerQueryState.error?.data ??
        //         getAllAnomaliesByManagerQueryState.error}
        //     </p>
        //     <Btn variant="theme" onClick={() => getAllAnomaliesByManagerQueryState.refetch()}>
        //       {t(`tryFetchingAgainText`)}
        //     </Btn>
        //   </div>
        // ) :
        // getAllAnomaliesByManagerQueryState.isFetching ? (
        //   <div className="anomalies-data-table__spinner-container">
        //     <Spinner />
        //   </div>
        // ) :
        <DataTable
          totalRecords={anomaliesSlice?.metaData?.total}
          loading={getAllAnomaliesByManagerQueryState.isFetching}
          value={anomaliesDataForTable}
          first={first}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate={`${t(`${anomaliesPageTranslationsPath}.paginationInfos.showing`)} {first} ${t(
            `${anomaliesPageTranslationsPath}.paginationInfos.to`,
          )} {last} ${t(`${anomaliesPageTranslationsPath}.paginationInfos.of`)} {totalRecords} ${t(
            `${anomaliesPageTranslationsPath}.paginationInfos.entries`,
          )}`}
          paginator
          responsiveLayout="scroll"
          scrollable={'horizontal'}
          rows={10}
          pageLinkSize={3}
          filterDisplay="row"
          emptyMessage="No data found."
          filters={filters}
          globalFilterFields={['type', 'driver', 'plateNo', 'date', 'time']}
          size="small"
          onPage={onPageHandler}
        >
          <Column
            field="plateNo"
            header={t(`${anomaliesPageTranslationsPath}.plateNoHeading`)}
            filter
            filterField="plateNo"
            filterPlaceholder={t(`${anomaliesPageTranslationsPath}.searchText`)}
            sortable
            className="anomalies-data-table__column anomalies-data-table__column-plateno"
            body={(rowData) => {
              return (
                <>
                  {[undefined, null].includes(rowData?.isVehicleOnline) ? (
                    <></>
                  ) : (
                    <div
                      className={`anomalies-data-table__vehicle-status-indicator anomalies-data-table__vehicle-status-indicator--${
                        rowData?.isVehicleOnline === false ? 'offline' : 'online'
                      }`}
                    ></div>
                  )}
                  <p className="anomalies-data-table__column-plateno-value">{rowData?.plateNo}</p>
                </>
              );
            }}
          ></Column>
          <Column
            field="driver"
            header={t(`${anomaliesPageTranslationsPath}.driverHeading`)}
            filter
            filterField="driver"
            filterPlaceholder={t(`${anomaliesPageTranslationsPath}.searchText`)}
            sortable
            className="anomalies-data-table__column anomalies-data-table__column-driver"
          ></Column>
          <Column
            field="type"
            header={t(`${anomaliesPageTranslationsPath}.typeHeading`)}
            filter
            filterField="type"
            filterPlaceholder={t(`${anomaliesPageTranslationsPath}.searchText`)}
            sortable
            className="anomalies-data-table__column anomalies-data-table__column-type"
            body={(rowData) => {
              return (
                <div style={{ display: 'flex', columnGap: '12px', alignItems: 'center' }}>
                  {!!rowData.anomalyCount && rowData.anomalyImage && (
                    <button
                      className="no-btn-style"
                      onClick={async () => {
                        setSeeImagePopup(true);
                        setAnomalyImage(rowData.anomalyImage);
                      }}
                    >
                      <img
                        src={rowData.anomalyImage}
                        onError={({ currentTarget }) => (currentTarget.src = PlaceholderAnomalyImg)}
                        alt="Anomaly"
                        style={{
                          width: '24px',
                          height: '24px',
                        }}
                      />
                    </button>
                  )}
                  {rowData.type}
                </div>
              );
            }}
          ></Column>

          <Column
            field="date"
            header={t(`${anomaliesPageTranslationsPath}.dateHeading`)}
            filter
            filterField="date"
            filterPlaceholder={t(`${anomaliesPageTranslationsPath}.searchText`)}
            sortable
            className="anomalies-data-table__column anomalies-data-table__column-date"
          ></Column>

          <Column
            field="time"
            header={t(`${anomaliesPageTranslationsPath}.timeHeading`)}
            filter
            filterField="time"
            filterPlaceholder={t(`${anomaliesPageTranslationsPath}.searchText`)}
            sortable
            className="anomalies-data-table__column anomalies-data-table__column-time"
          ></Column>
          <Column
            className="sticky anomalies-data-table__column-settings"
            field="settings"
            filter
            filterElement={<SettingsIcon />}
            body={(rowData) => SettingsBodyTemplate(rowData)}
            frozen
            alignFrozen="right"
          />
        </DataTable>
      }
    </AnomaliesDataTableStyled>
  );
}

const AnomaliesDataTableStyled = styled.div`
  padding-left: 1rem;
  margin-top: 4px;

  .anomalies-data-table__spinner-container {
    display: flex;
    justify-content: center;
  }

  .anomalies-data-table__error-container {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .anomalies-data-table__error-title {
    color: red;
    font-weight: 600;
    font-size: 24px;
    margin: 0;
  }

  .anomalies-data-table__error {
    color: red;
    font-size: 14px;
  }

  .anomalies-data-table__loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .anomalies-data-table__header {
    padding: 8px;
  }

  .anomalies-data-table__header {
    display: grid;
    row-gap: 16px;
  }

  .anomalies-data-table__header .anomalies-data-table__sort-by-heading,
  .anomalies-data-table__header .anomalies-data-table__order-by-heading,
  .anomalies-data-table__header .anomalies-data-table__filter-heading {
    font-size: 20px;
    color: #646464;
    margin: 0;
    font-family: 'Raleway', sans-serif;
  }

  .anomalies-data-table__sort-order-by-container {
    display: flex;
    column-gap: 12px;
  }

  .anomalies-data-table__filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .anomalies-data-table__header .p-dropdown {
    width: 250px;
  }

  .anomalies-data-table__header .p-inputtext {
    max-height: unset;
    background-color: white;
  }

  .p-datatable-header {
    background-color: white;
  }

  .p-datatable {
    margin: 0 auto;
  }

  .p-column-title {
    color: var(--app-primary-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 14px;
  }

  .p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
    font-family: 'Poppins', sans-serif;
    color: #999999;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ecf5ff;
    font-size: 12px;
  }

  .anomalies-data-table__column-settings {
    justify-content: center;
    min-width: 6rem;
    max-width: 6rem;
  }

  .p-column-filter-row .p-column-filter-menu-button,
  .p-column-filter-row .p-column-filter-clear-button {
    display: none;
  }

  .anomalies-data-table__column-settings .p-column-filter-row .p-column-filter-element {
    display: flex;
    justify-content: center;
  }

  .p-inputtext {
    background-color: #f8f8f8;
    font-family: 'Poppins', sans-serif;
    border: none;
    max-height: 40px;
    font-size: 12px;
    padding: 6px 12px;
  }

  .p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
    background-color: white;
    padding: 8px 16px;
    border-color: #ecf5ff;
  }

  .anomalies-data-table__column {
    overflow-wrap: anywhere;
  }

  .anomalies-data-table__column-plateno {
    display: flex;
    column-gap: 8px;
    min-width: 8rem;
  }
  .anomalies-data-table__column-plateno-value {
    margin: 0;
    line-height: 16px;
  }
  .anomalies-data-table__column-driver {
    min-width: 10rem;
  }
  .anomalies-data-table__column-type {
    min-width: 12rem;
  }
  .anomalies-data-table__column-date {
    min-width: 10rem;
  }
  .anomalies-data-table__column-time {
    min-width: 8rem;
  }

  .anomalies-data-table__vehicle-status-indicator {
    height: 8px;
    width: 8px;
    border-radius: 50%;
  }
  .anomalies-data-table__vehicle-status-indicator--online {
    background-color: var(--green-color);
  }
  .anomalies-data-table__vehicle-status-indicator--offline {
    background-color: var(--vehicle-offline-status-color);
  }

  .sticky {
    border-left: 1px solid #ecf5ff !important;
  }

  .p-paginator button {
    height: 28px !important;
    min-width: 28px !important;
    font-size: 12px;
  }

  .p-paginator button .p-paginator-icon {
    font-size: 12px;
    transform: ${(props) => (props.isDirectionRtl === true ? 'rotate(180deg)' : 'unset')};
  }

  .p-paginator .p-paginator-current {
    font-size: 12px;
  }

  @media screen and (701px <= width <= 999px) {
    max-width: none;
    padding-right: 12px;
  }

  @media screen and (max-width: 700px) {
    max-width: none;
  }
`;
