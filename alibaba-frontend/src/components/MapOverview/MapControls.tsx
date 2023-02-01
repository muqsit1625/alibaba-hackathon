//@ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AutoComplete } from 'primereact/autocomplete';

import { RemoveIcon } from 'global/icons';
import { mapOverviewPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useLazyGetAllDriversNameQuery } from 'redux/endpoints/drivers';
import { useGetAllVehiclesPlateNosMutation, useGetVehiclesLocationsQuery } from 'redux/endpoints/vehicles';
import {
  mapOverviewSelector,
  setFetchSingleDriverId,
  setFetchSingleVehicleId,
  setMultiple,
  setSelectedDriverByName,
  setSelectedVehicleByPlateNo,
} from 'redux/mapOverview/mapOverviewSlice';
import { useGetActiveTripIdQuery, useLazyGetActiveTripIdQuery } from 'redux/endpoints/reports';

import Spinner from 'components/Shared/Spinner';

const MapControls = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState] = useStateValue();

  const mapOverviewSlice = useSelector(mapOverviewSelector);
  const { selectedDriverByName, selectedVehicleByPlateNo } = mapOverviewSlice;

  const allVehiclesLocationsQueryState = useGetVehiclesLocationsQuery(null);
  const [getAllDriversName, allDriversNameQueryState] = useLazyGetAllDriversNameQuery();
  const [getAllVehiclesPlateNos, allVehiclesPlateNosQueryState] = useGetAllVehiclesPlateNosMutation();
  const getActiveTripIdQueryState = useGetActiveTripIdQuery(
    {
      vehicle_id: mapOverviewSlice.fetchSingleVehicleId,
    },
    {
      skip: !mapOverviewSlice?.fetchSingleVehicleId,
      refetchOnMountOrArgChange: true,
    },
  );
  console.log('%callDriversNameQueryState:', 'background-color:cadetblue;', allDriversNameQueryState);
  console.log('%callVehiclesPlateNoQueryState:', 'background-color:burlywood;', allVehiclesPlateNosQueryState);

  const allVehiclesLocations = useMemo(() => {
    const vehicles = [...(allVehiclesLocationsQueryState.data?.result || [])];

    return vehicles;
  }, [allVehiclesLocationsQueryState.data?.result]);

  const [totalDriversByName, setTotalDriversByName] = useState([]);
  const [totalVehiclesByPlateNo, setTotalVehiclesByPlateNo] = useState([]);
  const [filteredDriversByName, setFilteredDriversByName] = useState([]);
  const [filteredVehiclesByPlateNo, setFilteredVehiclesByPlateNo] = useState([]);
  const [isDriverNameDropdownOpen, setIsDriverNameDropdownOpen] = useState(false);
  const [isVehiclePlateNoDropdownOpen, setIsVehiclePlateNoDropdownOpen] = useState(false);

  useEffect(() => {
    if (allDriversNameQueryState.isSuccess) {
      let drivers = allDriversNameQueryState.data?.result || [];

      drivers = drivers.map((driver) => {
        return {
          label: `${driver.driver_first_name} ${driver.driver_last_name}`,
          value: driver,
        };
      });

      setTotalDriversByName(drivers);
    }
  }, [allDriversNameQueryState.data?.result, allDriversNameQueryState.isSuccess]);

  useEffect(() => {
    if (allVehiclesPlateNosQueryState.isSuccess) {
      let vehicles = allVehiclesPlateNosQueryState.data?.result || [];

      vehicles = vehicles.map((vehicle) => {
        return {
          label: `${vehicle.vehicle_plate_no}`,
          value: vehicle,
        };
      });

      setTotalVehiclesByPlateNo(vehicles);
    }
  }, [allVehiclesPlateNosQueryState.data?.result, allVehiclesPlateNosQueryState.isSuccess]);

  const totalVehicles = useMemo(() => {
    console.log('memos', allVehiclesLocationsQueryState.data?.result?.length);
    let total = 0;

    total = allVehiclesLocationsQueryState.data?.result?.length || 0;

    return total;
  }, [allVehiclesLocationsQueryState.data?.result?.length, allVehiclesLocationsQueryState.isSuccess]);

  const searchDriversByName = (event) => {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let query = event.query;
    let _filteredDrivers = [];

    for (let i = 0; i < totalDriversByName.length; i++) {
      let item = totalDriversByName[i];
      if (item.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        _filteredDrivers.push(item);
      }
    }

    setFilteredDriversByName(_filteredDrivers);
  };
  const searchVehiclesByPlateNo = (event) => {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let query = event.query;
    let _filteredVehicles = [];

    for (let i = 0; i < totalVehiclesByPlateNo.length; i++) {
      let item = totalVehiclesByPlateNo[i];
      if (item.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        _filteredVehicles.push(item);
      }
    }

    setFilteredVehiclesByPlateNo(_filteredVehicles);
  };

  const onSearchDriverByDriverNameFocus = () => {
    if (filteredDriversByName.length === 0) {
      getAllDriversName();
    }
  };

  const onSearchVehicleByPlateNoNumberFocus = () => {
    if (filteredVehiclesByPlateNo.length === 0) {
      getAllVehiclesPlateNos();
    }
  };

  const onDriverNameSelected = (event) => {
    const driver_id = event.value.value.driver_id;

    const filteredVehicleByDriverId = allVehiclesLocations.find((location) => {
      return location?.driver_id === driver_id;
    });
    const filteredVehiclePlateNo = filteredVehicleByDriverId?.payload?.plateNo || null;

    console.log('the third', filteredVehicleByDriverId);

    dispatch(
      setMultiple({
        selectedVehicleOnMap: filteredVehicleByDriverId,
        vehiclePlateNo: filteredVehicleByDriverId.vehicle_plate_no,
        vehiclePlateNoForFilteredVehicle: filteredVehicleByDriverId.vehicle_plate_no,
        // selectedVehicleByPlateNo: filteredVehicleByDriverId.vehicle_plate_no,
        fetchSingleVehicleId: filteredVehicleByDriverId?.vehicle_id || null,
        fetchSingleDriverId: filteredVehicleByDriverId.driver_id,
        clickCount: 2,
      }),
    );
  };

  const onVehiclePlateNoSelected = (event) => {
    console.log('plate select value', event.value);
    const vehicle_id = event.value.value.vehicle_id;
    const vehiclePlateNo = event.value.value.vehicle_plate_no;

    const filteredVehicleByVehicleId = allVehiclesLocations.find((location) => {
      return location?.vehicle_id === vehicle_id;
    });

    console.log('plate select value 2', filteredVehicleByVehicleId);

    dispatch(
      setMultiple({
        selectedVehicleOnMap: filteredVehicleByVehicleId,
        vehiclePlateNo,
        vehiclePlateNoForFilteredVehicle: vehiclePlateNo,
        selectedVehicleByPlateNo: event.value,
        fetchSingleVehicleId: vehicle_id,
        fetchSingleDriverId: filteredVehicleByVehicleId.driver_id,
        clickCount: 2,
      }),
    );
  };

  const clearDriverName = () => {
    dispatch(
      setMultiple({
        fetchSingleDriverId: null,
        fetchSingleVehicleId: null,
        driverIdForFilteredVehicle: null,
        vehiclePlateNo: null,
        selectedVehicleOnMap: null,
      }),
    );
  };

  const clearVehiclePlateNo = () => {
    dispatch(
      setMultiple({
        fetchSingleVehicleId: null,
        fetchSingleDriverId: null,
        vehiclePlateNoForFilteredVehicle: null,
        vehiclePlateNo: null,
        selectedVehicleOnMap: null,
      }),
    );
  };

  const onDriverNameRemoveSelectionClick = () => {
    dispatch(setSelectedDriverByName(null));
    clearDriverName();
  };

  const onVehiclePlateNoRemoveSelectionClick = () => {
    dispatch(setSelectedVehicleByPlateNo(null));
    clearVehiclePlateNo();
  };

  return (
    <MapControlsStyled
      isDirectionRtl={reducerState.isDirectionRtl}
      isDriverNameDropdownOpen={isDriverNameDropdownOpen}
      isVehiclePlateNoDropdownOpen={isVehiclePlateNoDropdownOpen}
    >
      <div className="map-controls__search-by-name-container">
        {allDriversNameQueryState.isLoading && (
          <div className="map-controls__search-by-name-overlay">
            <Spinner height={20} width={20} className="map-controls__search-by-name-spinner" />
          </div>
        )}

        <AutoComplete
          className="map-controls__search-by-name"
          placeholder={t(`${mapOverviewPageTranslationsPath}.mapControls.searchByDriverName`)}
          value={selectedDriverByName}
          suggestions={filteredDriversByName}
          completeMethod={searchDriversByName}
          virtualScrollerOptions={{ itemSize: 50 }}
          field="label"
          dropdown
          onChange={(e) => dispatch(setSelectedDriverByName(e.value))}
          aria-label="Items"
          onFocus={onSearchDriverByDriverNameFocus}
          onSelect={onDriverNameSelected}
          onClear={clearDriverName}
          onShow={() => setIsDriverNameDropdownOpen(true)}
          onHide={() => setIsDriverNameDropdownOpen(false)}
          disabled={selectedVehicleByPlateNo}
        />
        {selectedDriverByName && (
          <RemoveIcon className="map-controls__remove-selection-icon" onClick={onDriverNameRemoveSelectionClick} />
        )}
      </div>

      <div className="map-controls__search-by-plateno-container">
        {allVehiclesPlateNosQueryState.isLoading && (
          <div className="map-controls__search-by-plateno-overlay">
            <Spinner height={24} width={24} className="map-controls__search-by-plateno-spinner" />
          </div>
        )}
        <AutoComplete
          className="map-controls__search-by-plateno"
          placeholder={t(`${mapOverviewPageTranslationsPath}.mapControls.searchByVehiclePlateNo`)}
          value={selectedVehicleByPlateNo}
          suggestions={filteredVehiclesByPlateNo}
          completeMethod={searchVehiclesByPlateNo}
          virtualScrollerOptions={{ itemSize: 50 }}
          field="label"
          dropdown
          onChange={(e) => dispatch(setSelectedVehicleByPlateNo(e.value))}
          aria-label="Items"
          onFocus={onSearchVehicleByPlateNoNumberFocus}
          onSelect={onVehiclePlateNoSelected}
          onClear={clearVehiclePlateNo}
          onShow={() => setIsVehiclePlateNoDropdownOpen(true)}
          onHide={() => setIsVehiclePlateNoDropdownOpen(false)}
          disabled={selectedDriverByName}
        />
        {selectedVehicleByPlateNo && (
          <RemoveIcon className="map-controls__remove-selection-icon" onClick={onVehiclePlateNoRemoveSelectionClick} />
        )}
      </div>

      <p className="map-controls__total">
        {t(`${mapOverviewPageTranslationsPath}.mapControls.total`)}{' '}
        <span className="map-controls__total-value">{totalVehicles}</span>
      </p>
    </MapControlsStyled>
  );
};

const MapControlsStyled = styled.div`
  padding: 24px 24px 4px 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 32px;
  row-gap: 12px;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .map-controls__search-by-name-container,
  .map-controls__search-by-plateno-container {
    position: relative;
  }

  .map-controls__search-by-name,
  .map-controls__search-by-plateno {
    height: 34px;
    min-width: 240px;
  }

  .map-controls__remove-selection-icon {
    position: absolute;
    right: ${(props) => (props.isDirectionRtl ? 'unset' : '40px')};
    left: ${(props) => (props.isDirectionRtl ? '40px' : 'unset')};
    height: 100%;
    width: 20px;
  }

  .map-controls__remove-selection-icon > path {
    fill: silver;
  }

  .map-controls__search-by-plateno-overlay,
  .map-controls__search-by-name-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.5);
  }

  .map-controls__search-by-name-spinner,
  .map-controls__search-by-plateno-spinner {
  }

  .map-controls__search-by-name .p-inputtext,
  .map-controls__search-by-plateno .p-inputtext {
    background-color: #f8f8f8;
    border: 1px solid var(--app-primary-color);
    border-left: ${(props) => (props.isDirectionRtl ? 'none' : '1px solid var(--app-primary-color)')};
    border-right: ${(props) => (props.isDirectionRtl ? '1px solid var(--app-primary-color)' : 'none')};
    border-radius: ${(props) => (props.isDirectionRtl ? '0 6px 6px 0' : '6px 0 0 6px')};
    font-size: 12px;
    padding: 4px 12px;
    font-family: 'Poppins', sans-serif;
  }

  .map-controls__search-by-name .p-button,
  .map-controls__search-by-plateno .p-button {
    background-color: #f8f8f8;
    border-top: 1px solid var(--app-primary-color);
    border-right: ${(props) => (props.isDirectionRtl ? 'none' : '1px solid var(--app-primary-color)')};
    border-left: ${(props) => (props.isDirectionRtl ? '1px solid var(--app-primary-color)' : 'none')};
    border-radius: ${(props) => (props.isDirectionRtl ? '6px 0 0 6px' : '0 6px 6px 0')};
    color: #999999;
    padding: 8px 0;
  }

  .map-controls__search-by-name .p-button .pi-chevron-down {
    transform: ${(props) => (props.isDriverNameDropdownOpen ? 'rotate(180deg)' : 'none')};
    font-size: 14px;
  }
  .map-controls__search-by-plateno .p-button .pi-chevron-down {
    transform: ${(props) => (props.isVehiclePlateNoDropdownOpen ? 'rotate(180deg)' : 'none')};
    font-size: 14px;
  }

  .map-controls__search-by-name .p-button:focus,
  .map-controls__search-by-plateno .p-button:focus {
    box-shadow: none;
  }

  .map-controls__search-by-name .p-inputtext:enabled:focus,
  .map-controls__search-by-plateno .p-inputtext:enabled:focus {
    box-shadow: none;
  }

  .map-controls__total {
    font-size: 20px;
    margin: 0;
  }

  .map-controls__total-value {
    color: var(--app-primary-color);
    font-weight: 600;
  }

  @media screen and (max-width: 700px) {
    display: grid;
    place-items: center;
  }
`;

export default MapControls;
