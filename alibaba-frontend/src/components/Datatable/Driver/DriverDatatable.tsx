import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';

import '../CDialogBox.css';

import { fetchToken, apiRoute } from 'global/apiRoute';
import { SettingsIcon } from 'global/image';

// import { driverData } from './mockData';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useLazyGetAllDriversQuery } from 'redux/endpoints/drivers';
import { driverSelector, setAllDrivers } from 'redux/driver/driverSlice';

import { DatatableStyled } from 'components/Datatable/DatatableStyled';
import { S3Image } from 'components/Shared/S3Image';
import IconBtn from 'components/CButtons/IconBtn';
import SeeImagePopup from 'components/Datatable/SeeImagePopup';
import AddEditNewDriver from './AddEditNewDriver';
import DeleteModal from './DeleteModal';
import SettingsBodyTemplate from './DriverSettingsBodyTemplate';
import Spinner from 'components/Shared/Spinner';
import Btn from 'components/CButtons/Btn';
import { driverManagementPageTranslationsPath } from 'global/variables';

export const DriverDatatable = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const driverSlice: any = useSelector(driverSelector);
  const allDrivers = driverSlice.allDrivers;

  console.log('here the drivers are', allDrivers);

  const [getAllDrivers, getAllDriversQueryState]: any = useLazyGetAllDriversQuery();
  console.log('%cgetAllDriversQueryState:', 'background-color:darkorange;', getAllDriversQueryState);

  useEffect(() => {
    if (driverSlice.allDrivers.length === 0) {
      getAllDrivers();
    }
  }, [getAllDrivers]);

  useEffect(() => {
    if (getAllDriversQueryState.isSuccess) {
      const allDrivers = getAllDriversQueryState?.data?.result || [];

      dispatch(setAllDrivers(allDrivers));
    }
  }, [dispatch, getAllDriversQueryState?.data?.result, getAllDriversQueryState.isSuccess]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    driver_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    driver_first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    driver_last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cnic: { value: null, matchMode: FilterMatchMode.CONTAINS },
    license_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vehicle_plate_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [seeImagePopup, setSeeImagePopup] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverImageUrl, setDriverImageUrl] = useState('');

  const renderHeader = () => {
    return (
      <div className="header-table">
        <IconBtn
          btnText={t(`${driverManagementPageTranslationsPath}.addNewDriverText`)}
          btnPos="left"
          btnIcon="pi pi-plus"
          onClick={() => setShowAddEditModal(true)}
        />

        {showDeleteModal && (
          <DeleteModal
            showModal={showDeleteModal}
            closeModal={() => setShowDeleteModal(false)}
            driverDetails={driverDetails}
            getAllDrivers={getAllDrivers}
          />
        )}
        {showAddEditModal && (
          <AddEditNewDriver
            initValues={driverDetails}
            showModal={showAddEditModal}
            setShowModal={setShowAddEditModal}
            setInitValues={(value: any) => setDriverDetails(value)}
            getAllDrivers={getAllDrivers}
          />
        )}
      </div>
    );
  };

  const header = renderHeader();

  return (
    <DriverDatatableStyled isDirectionRtl={reducerState.isDirectionRtl} className="datatable-filter-demo">
      <SeeImagePopup
        seeImagePopup={seeImagePopup}
        setSeeImagePopup={setSeeImagePopup}
        imageUrl={driverImageUrl}
        style={{
          width: '80vw',
        }}
        imageStyle={{
          width: '75%',
        }}
      />
      {
        /* {getAllDriversQueryState.isError ? (
        <div className="driver-datatable__error-container">
          <p className="driver-datatable__error-title">{t(`someErrorOccurredText`)}!</p>
          <p className="driver-datatable__error">
            {getAllDriversQueryState.error?.data?.message || getAllDriversQueryState.error?.data}
          </p>
          <Btn variant="theme" onClick={() => getAllDriversQueryState.refetch()}>
            {t(`tryFetchingAgainText`)}
          </Btn>
        </div>
      ) : */
        getAllDriversQueryState.isFetching ? (
          <div className="driver-datatable__spinner-container">
            <Spinner />
          </div>
        ) : (
          <div className="card">
            <DataTable
              removableSort
              paginator
              scrollable={true}
              scrollDirection="horizontal"
              className="p-datatable-customers"
              rows={10}
              dataKey="id"
              filterDisplay="row"
              responsiveLayout="scroll"
              filters={filters}
              header={header}
              value={allDrivers}
              globalFilterFields={['driver_id', 'driver_first_name', 'phone_number', 'cnic', 'license_number']}
              emptyMessage="No data found."
            >
              <Column
                sortable
                header={t(`${driverManagementPageTranslationsPath}.driverTableInfo.name`)}
                field="driver_first_name"
                filterField="driver_first_name"
                filter
                //@ts-ignore
                filterPlaceholder={t(`${driverManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '14rem' }}
                body={(rowData) => {
                  return (
                    <div>
                      <button
                        className="no-btn-style"
                        onClick={async () => {
                          setSeeImagePopup(true);
                          setDriverImageUrl(rowData.driver_media_url);
                        }}
                      >
                        <S3Image
                          className="driver-datatable__driver-image"
                          url={rowData.driver_media_url}
                          style={{
                            height: '24px',
                            width: '24px',
                            marginRight: '0.25rem',
                          }}
                        />
                      </button>
                      {rowData.driver_first_name + ' ' + rowData.driver_last_name}
                    </div>
                  );
                }}
              />
              <Column
                sortable
                header={t(`${driverManagementPageTranslationsPath}.driverTableInfo.cnicNo`)}
                field="cnic"
                filterField="cnic"
                filter
                //@ts-ignore
                filterPlaceholder={t(`${driverManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '10rem' }}
              />
              <Column
                sortable
                header={t(`${driverManagementPageTranslationsPath}.driverTableInfo.licenseNo`)}
                field="license_number"
                filterField="license_number"
                filter
                //@ts-ignore
                filterPlaceholder={t(`${driverManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '12rem' }}
              />
              <Column
                sortable
                header={t(`${driverManagementPageTranslationsPath}.driverTableInfo.assignedVehicle`)}
                field="vehicle_plate_no"
                filterField="vehicle_plate_no"
                style={{ minWidth: '12rem' }}
                //@ts-ignore
                filterPlaceholder={t(`${driverManagementPageTranslationsPath}.searchText`)}
                filter
                bodyStyle={(rowData: any) => rowData.vehicle_plate_no ?? '-'}
              />
              <Column
                sortable
                header={t(`${driverManagementPageTranslationsPath}.driverTableInfo.phoneNo`)}
                field="phone_number"
                filterField="phone_number"
                filter
                //@ts-ignore
                filterPlaceholder={t(`${driverManagementPageTranslationsPath}.searchText`)}
                style={{ minWidth: '10rem' }}
              />
              <Column
                frozen={true}
                alignFrozen="right"
                className="sticky driver-data-table__column-settings"
                filter
                filterElement={<SettingsIcon />}
                body={(rowData) => (
                  <SettingsBodyTemplate
                    rowData={rowData}
                    setShowAddEditModal={setShowAddEditModal}
                    setShowDeleteModal={setShowDeleteModal}
                    setDriverDetails={setDriverDetails}
                  />
                )}
              />
            </DataTable>

            <ConfirmDialog />
          </div>
        )
      }
    </DriverDatatableStyled>
  );
};

const DriverDatatableStyled = styled(DatatableStyled)`
  .driver-datatable__spinner-container {
    display: flex;
    justify-content: center;
    padding-top: 20px;
  }

  .driver-datatable__error-container {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .driver-datatable__error-title {
    color: red;
    font-weight: 600;
    font-size: 24px;
    margin: 0;
  }

  .driver-datatable__error {
    color: red;
    font-size: 14px;
  }

  .card {
    margin: 4px 16px 16px 16px;
  }

  .p-datatable-wrapper {
    height: auto;
  }

  .live-view.disabled {
    cursor: not-allowed;
  }

  .live-view.disabled path {
    fill: silver;
  }

  .driver-data-table__column-settings {
    min-width: 7rem;
    max-width: 7rem;
    justify-content: center;
    right: 0px;
  }

  .driver-data-table__column-settings .p-column-filter-row .p-column-filter-element {
    display: flex;
    justify-content: center;
  }

  @media screen and (max-width: 850px) {
    .driver-data-table__column-settings {
      min-width: 8rem;
      max-width: 8rem;
    }

    .driver-datatable__driver-image {
      height: 24px;
      width: 24px;
    }
  }

  @media screen and (max-width: 500px) {
    .driver-data-table__column-settings {
      min-width: 6rem;
      max-width: 6rem;
    }

    .driver-datatable__driver-image {
      height: 20px;
      width: 20px;
    }
  }
`;
