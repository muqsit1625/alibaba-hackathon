//@ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import axios from 'axios';

import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';

import { colors } from 'global/colors';
import { apiRoute, fetchToken } from 'global/apiRoute';
import { SettingsIcon, MapIcon, VideoIcon } from 'global/image';
import { vehicleManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useGetAllVehiclesPaginatedQuery, useGetAllVehiclesQuery } from 'redux/endpoints/vehicles';

import { DatatableStyled } from '../DatatableStyled';
import SeeImagePopup from '../SeeImagePopup';
import AddNewVehicle from './AddNewVehicle';
import Spinner from 'components/Shared/Spinner';
import Btn from 'components/CButtons/Btn';
import { setVehiclePageNo, vehicleSelector } from 'redux/vehicle/vehicleSlice';
import anomaliesSlice, { anomaliesSelector } from 'redux/anomalies/anomaliesSlice';
import { setMultiple } from 'redux/mapOverview/mapOverviewSlice';

export const VehicleDatatable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reducerState] = useStateValue();
  const { t } = useTranslation();
  const [first, setFirst] = useState(0);
  const storeDispatch = useDispatch();

  const vehicleSlice = useSelector(vehicleSelector);
  const anomaliesSlice = useSelector(anomaliesSelector);

  const getAllVehiclesQueryState = useGetAllVehiclesQuery();
  const getAllVehiclesPaginatedQueryState = useGetAllVehiclesPaginatedQuery({
    pageNo: vehicleSlice.pageNo,
  });

  const onPageHandler = (event) => {
    setFirst(event.first);
    storeDispatch(setVehiclePageNo(event.page));
  };

  // const vehicleData = useMemo(() => {
  //   let data = [];
  //   if (getAllVehiclesPaginatedQueryState.isSuccess) {
  //     data = getAllVehiclesPaginatedQueryState?.data?.result || [];
  //   }
  //   return data;
  // }, [getAllVehiclesPaginatedQueryState?.data?.result, getAllVehiclesPaginatedQueryState.isSuccess]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vehicle_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vehicle_plate_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    chassis_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    color: { value: null, matchMode: FilterMatchMode.CONTAINS },
    weight: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number_of_tires: { value: null, matchMode: FilterMatchMode.CONTAINS },
    engine_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    make_model: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [seeImagePopup, setSeeImagePopup] = useState(false);
  const [details, setDetails] = useState('');
  const [vehiclePlateImageUrl, setVehiclePlateImageUrl] = useState('');

  const renderHeader = () => {
    return (
      <div className="header-table">
        <AddNewVehicle />
      </div>
    );
  };

  const settingsBodyTemplate = (rowData) => {
    console.log('this row data is', rowData);
    return (
      <div className="settings">
        <Tooltip
          target=".live-view"
          content={
            rowData?.is_online
              ? t(`${vehicleManagementPageTranslationsPath}.tooltips.liveView`)
              : t(`${vehicleManagementPageTranslationsPath}.tooltips.vehicleOffline`)
          }
          position="left"
        />
        <button className="no-btn-style btn-icon" disabled={rowData?.is_online}>
          <VideoIcon
            onClick={
              rowData?.vehicle_plate_no && rowData?.is_online
                ? () =>
                    navigate(
                      `/driver-management/live-view?plate_no=${rowData.vehicle_plate_no}&id=${rowData.vehicle_id}`,
                    )
                : null
            }
            className={`live-view ${(!rowData.vehicle_plate_no || !rowData?.is_online) && 'disabled'}`}
          />
        </button>
        <button className="no-btn-style btn-icon" disabled={!rowData.last_online}>
          <Tooltip
            target=".map-view"
            content={t(`${vehicleManagementPageTranslationsPath}.tooltips.mapView`)}
            position="left"
          />
          <MapIcon
            className="map-view"
            onClick={() => {
              console.log('glitched rowdata', rowData);
              if (rowData?.last_online) {
                dispatch(
                  setMultiple({
                    selectedVehicleOnMap: rowData,
                    vehiclePlateNo: rowData.vehicle_plate_no,
                    fetchSingleVehicleId: rowData.vehicle_id,
                    fetchSingleDriverId: rowData.driver_id,
                    clickCount: 2,
                  }),
                );
                setTimeout(() => {
                  navigate(`/overview`);
                }, 500);
              } else {
                navigate('/overview');
              }
            }}
          />
        </button>
      </div>
    );
  };

  const header = renderHeader();

  console.log('vec', vehicleSlice.vehicle);
  console.log('vecpage', vehicleSlice.pageNo);

  const vehiclesDataForTable = useMemo(() => {
    if (vehicleSlice?.vehicle) {
      let _vehicles = vehicleSlice.vehicle;
      return _vehicles;
    }
    return [];
  }, [vehicleSlice.vehicle]);

  const allVehicles = useMemo(
    () =>
      vehiclesDataForTable?.map((vehicle) => ({
        ...vehicle,
        vehicle_image: (
          <p
            className="see-image"
            onClick={async () => {
              setSeeImagePopup(true);
              setVehiclePlateImageUrl(vehicle.vehicle_image);
            }}
          >
            See image
          </p>
        ),
      })),
    [vehiclesDataForTable],
  );

  console.log('%cgetAllVehiclesQueryState:', 'background-color:deeppink;', allVehicles);

  return (
    <VehicleDatatableStyled isDirectionRtl={reducerState.isDirectionRtl} className="datatable-filter-demo">
      <SeeImagePopup
        seeImagePopup={seeImagePopup}
        setSeeImagePopup={setSeeImagePopup}
        imageUrl={vehiclePlateImageUrl}
        style={{
          width: '80vw',
        }}
        imageStyle={{
          width: '75%',
        }}
      />

      {
        // getAllVehiclesQueryState.isError ? (
        //   <div className="vehicle-datatable__error-container">
        //     <p className="vehicle-datatable__error-title">{t(`someErrorOccurredText`)}!</p>
        //     <p className="vehicle-datatable__error">
        //       {getAllVehiclesQueryState.error?.data?.message || getAllVehiclesQueryState.error?.data}
        //     </p>
        //     <Btn variant="theme" onClick={() => getAllVehiclesQueryState.refetch()}>
        //       {t(`tryFetchingAgainText`)}
        //     </Btn>
        //   </div>
        // ) :
        getAllVehiclesQueryState.isLoading ? (
          <div className="vehicle-datatable__spinner-container">
            <Spinner />
          </div>
        ) : (
          <div className="card">
            <DataTable
              //need to dynamically change this totalRecords prop once i get metadata from endpoint
              totalRecords={30}
              value={allVehicles}
              first={first}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
              responsiveLayout="scroll"
              scrollable={'horizontal'}
              removableSort
              paginator
              className="p-datatable-customers"
              rows={10}
              pageLinkSize={3}
              dataKey="id"
              filters={filters}
              filterDisplay="row"
              globalFilterFields={[
                'vehicle_id',
                'vehicle_plate_no',
                'chassis_no',
                'color',
                'weight',
                'number_of_tires',
                'engine_no',
                'make_model',
              ]}
              header={header}
              emptyMessage="No data found."
              onPage={onPageHandler}
            >
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.vehiclePlateNo`)}
                field="vehicle_plate_no"
                filter
                filterField="vehicle_plate_no"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '12rem' }}
                body={(rowData) => (
                  <FlexBox>
                    <AllocatedIndicator allocated={rowData?.is_online} />
                    {rowData.vehicle_plate_no}
                  </FlexBox>
                )}
              />
              <Column
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.plateImage`)}
                field="vehicle_image"
                style={{ minWidth: '8rem' }}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.chassisNo`)}
                field="chassis_no"
                filter
                filterField="chassis_no"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '12rem' }}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.color`)}
                field="color"
                filter
                filterField="color"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '8rem' }}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.make`)}
                field="make_model"
                filter
                filterField="make_model"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '10rem' }}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.weight`)}
                field="weight"
                filter
                filterField="weight"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '8rem' }}
                body={(rowData) => rowData.weight + ' kg'}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.noOfTyres`)}
                field="number_of_tires"
                filter
                filterField="number_of_tires"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '9rem' }}
              />
              <Column
                sortable
                header={t(`${vehicleManagementPageTranslationsPath}.vehicleTableInfo.engineNo`)}
                field="engine_no"
                filter
                filterField="engine_no"
                filterPlaceholder={t(`${vehicleManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '9rem' }}
              />
              <Column
                frozen={true}
                alignFrozen="right"
                filter
                filterElement={<SettingsIcon />}
                className="sticky vehicle-data-table__column-settings"
                style={{ minWidth: '4rem' }}
                body={settingsBodyTemplate}
              />
            </DataTable>

            <ConfirmDialog />
          </div>
        )
      }
    </VehicleDatatableStyled>
  );
};

const AllocatedIndicator = styled.div`
  width: 0.625rem;
  height: 0.625rem;
  background-color: ${(props) => (props.allocated ? 'var(--green-color)' : 'var(--vehicle-offline-status-color)')};
  border-radius: 50%;
  flex-shrink: 0;
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
  column-gap: 8px;
`;

const VehicleDatatableStyled = styled(DatatableStyled)`
  .vehicle-datatable__spinner-container {
    display: flex;
    justify-content: center;
    padding-top: 20px;
  }

  .vehicle-datatable__error-container {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .vehicle-datatable__error-title {
    color: red;
    font-weight: 600;
    font-size: 24px;
    margin: 0;
  }

  .vehicle-datatable__error {
    color: red;
    font-size: 14px;
  }

  .card {
    margin: 4px 16px 16px 16px;
  }

  .p-datatable-wrapper {
    height: auto;
  }

  .live-view {
    cursor: pointer;
  }

  .live-view.disabled {
    cursor: not-allowed;
  }

  .live-view.disabled path {
    fill: silver;
  }

  .vehicle-data-table__column-settings .p-column-filter-row .p-column-filter-element {
    display: flex;
    justify-content: center;
  }
`;
