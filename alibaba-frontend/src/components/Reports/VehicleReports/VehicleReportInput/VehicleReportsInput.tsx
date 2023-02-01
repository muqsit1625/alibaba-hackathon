//@ts-nocheck
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import { useGetAllVehiclesPlateNoQuery } from 'redux/endpoints/vehicles';
// import { useGetAllDriversQuery } from 'redux/endpoints/vehicles';

import { colors } from 'global/colors';
import { vehicleReportTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import PrimaryBtn from 'components/CButtons/PrimaryBtn';
import Spinner from 'components/Shared/Spinner';

import { VehicleReportInputProps } from './types';

const VehicleReportsInput = ({ setData, loading }: VehicleReportInputProps) => {
  const { t } = useTranslation();
  const [reducerState] = useStateValue();

  const [dateRange, setDateRange] = useState<Date | Date[] | undefined>(undefined);
  const [vehicle, setVehicle] = useState<any>(null);
  const [allVehicles, setAllVehicles] = useState<any>(null);

  const allVehiclesQueryState = useGetAllVehiclesPlateNoQuery();
  console.log('%callVehiclesQueryState:', 'background-color:greenyellow;', allVehiclesQueryState);
  console.log('checks');
  useEffect(() => {
    if (allVehiclesQueryState.isSuccess) {
      let vehicles = allVehiclesQueryState.data?.result || [];
      vehicles = vehicles.map((vehicle: any) => ({ name: vehicle.vehicle_plate_no, vehicle_id: vehicle.vehicle_id }));
      console.log(vehicles);
      setAllVehicles(vehicles);
    }
  }, [allVehiclesQueryState.data?.result, allVehiclesQueryState.isSuccess]);

  // const vehicleQuery = useGetAllDriversQuery();

  return (
    <Container>
      <StyledCalendar
        isDirectionRtl={reducerState.isDirectionRtl}
        placeholder={t(`${vehicleReportTranslationsPath}.reportRangeText`)}
        selectionMode="range"
        readOnlyInput
        onChange={(e) => {
          setDateRange(e.value);
        }}
        value={dateRange}
        dateFormat={'M dd'}
        maxDate={new Date()}
        disabled={loading}
        showIcon
      />
      <div className="vehicle-reports-input__select-vehicle-container">
        <div
          className={`vehicle-reports-input__select-vehicle-overlay vehicle-reports-input__select-vehicle-overlay--${
            allVehiclesQueryState.isLoading ? 'visible' : 'hidden'
          }`}
        >
          <Spinner height={24} width={24} />
        </div>
        <StyledDropdown
          placeholder={t(`${vehicleReportTranslationsPath}.vehicleSelectText`)}
          width="10rem"
          options={allVehicles}
          disabled={loading}
          value={vehicle}
          onChange={(e) => setVehicle(e.value)}
          optionLabel="name"
        />
      </div>
      <PrimaryBtn
        children={t(`${vehicleReportTranslationsPath}.generateReportText`)}
        bColor={!(dateRange && vehicle) ? colors.gray : colors.successGreen}
        bColorHover={colors.successGreen}
        padding="0.5rem 1.25rem"
        onClick={() => setData({ vehicle: vehicle, dates: dateRange })}
        disabled={!(dateRange && vehicle)}
        loading={loading}
      />
    </Container>
  );
};

export default VehicleReportsInput;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .vehicle-reports-input__select-vehicle-container {
    position: relative;
  }

  .vehicle-reports-input__select-vehicle-overlay {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
  }
  .vehicle-reports-input__select-vehicle-overlay--hidden {
    display: none;
  }
  .vehicle-reports-input__select-vehicle-overlay--visible {
    display: flex;
  }

  @media screen and (max-width: 500px) {
    .primary-button {
      font-size: 12px;
      padding: 6px 16px;
    }
  }
`;

const StyledCalendar = styled(Calendar)<{ isDirectionRtl: boolean }>`
  .p-inputtext {
    background: #f8f8f8;
    border-radius: ${(props) => (props.isDirectionRtl ? '0 10px 10px 0' : '10px 0 0 10px')};
    border: none;
    font-size: 12px;
    padding: 8px 16px;
  }

  .p-datepicker-trigger {
    padding: 8px 8px;
    border-radius: ${(props) => (props.isDirectionRtl ? '10px 0 0 10px' : '0 10px 10px 0')};
  }

  .p-datepicker-trigger,
  .p-datepicker-trigger:hover {
    border-color: #f8f8f8;
    background: #f8f8f8;
    color: #646464;
  }

  @media screen and (max-width: 500px) {
    .p-inputtext {
      padding: 12px;
      font-size: 12px;
      width: 120px;
    }

    .p-datepicker-trigger {
      padding: 0;
      width: max-content;
      padding-right: 8px;
    }
  }
`;

const StyledDropdown = styled(Dropdown)`
  // .p-inputtext {
  background: #f8f8f8;
  border-radius: 10px;
  border: none;
  width: ${(props) => props.width ?? '20rem'};
  // }

  .p-inputtext {
    font-size: 12px;
    padding: 12px 16px;
  }

  @media screen and (max-width: 500px) {
    width: auto;

    .p-dropdown-label {
      padding: 12px;
      font-size: 12px;
      width: 120px;
    }

    .p-dropdown-trigger {
      width: unset;
      padding-right: 12px;
    }
  }
`;
