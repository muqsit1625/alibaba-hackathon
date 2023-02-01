//@ts-nocheck
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import { colors } from 'global/colors';
import { driverReportTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useLazyGetAllDriversNameQuery } from 'redux/endpoints/drivers';

import PrimaryBtn from 'components/CButtons/PrimaryBtn';
import Spinner from 'components/Shared/Spinner';

import { DriverReportInputProps } from './types';

const DriverReportsInput = ({ setData, loading }: DriverReportInputProps) => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const [dateRange, setDateRange] = useState<Date | Date[] | undefined>(undefined);
  const [driver, setDriver] = useState<any>(null);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);

  const [getAllDrivers, allDriversQueryState] = useLazyGetAllDriversNameQuery();
  console.log('%callDriversQueryState', 'background-color:purple;color:white;', allDriversQueryState);

  useEffect(() => {
    getAllDrivers();
  }, []);

  useEffect(() => {
    if (allDriversQueryState.isSuccess) {
      let drivers = allDriversQueryState?.data.result || [];

      drivers = drivers.map((driver: { driver_first_name: any; driver_last_name: any }) => {
        return {
          label: `${driver.driver_first_name} ${driver.driver_last_name}`,
          value: driver,
        };
      });

      setAllDrivers(drivers);
    }
  }, [allDriversQueryState?.data?.result, allDriversQueryState.isSuccess]);

  return (
    <Container>
      <StyledCalender
        isDirectionRtl={reducerState.isDirectionRtl}
        placeholder={t(`${driverReportTranslationsPath}.reportRangeText`)}
        selectionMode="range"
        readOnlyInput
        onChange={(e) => {
          setDateRange(e.value);
        }}
        value={dateRange}
        dateFormat={'M dd'}
        maxDate={new Date()}
        showIcon
      />

      <div className="driver-reports-input__select-driver-container">
        <div
          className={`driver-reports-input__select-driver-overlay driver-reports-input__select-driver-overlay--${
            allDriversQueryState.isLoading ? 'visible' : 'hidden'
          }`}
        >
          <Spinner height={24} width={24} />
        </div>
        <StyledDropdown
          placeholder={t(`${driverReportTranslationsPath}.driverSelectText`)}
          options={allDrivers}
          value={driver}
          onChange={(e) => setDriver(e.value)}
        />
      </div>
      <PrimaryBtn
        children={t(`${driverReportTranslationsPath}.generateReportText`)}
        bColor={!(dateRange && driver) ? colors.gray : colors.successGreen}
        bColorHover={colors.successGreen}
        padding="0.5rem 1.25rem"
        onClick={() => setData({ driver: driver, dates: dateRange })}
        disabled={!(dateRange && driver)}
        loading={loading}
      />
    </Container>
  );
};

export default DriverReportsInput;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
  align-items: center;

  .driver-reports-input__select-driver-container {
    position: relative;
  }

  .driver-reports-input__select-driver-overlay {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
  }
  .driver-reports-input__select-driver-overlay--hidden {
    display: none;
  }
  .driver-reports-input__select-driver-overlay--visible {
    display: flex;
  }
`;

const StyledCalender = styled(Calendar)<{ isDirectionRtl: boolean }>`
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
  background: #f8f8f8;
  border-radius: 10px;
  border: none;
  width: ${(props) => props.width ?? '14rem'};

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
