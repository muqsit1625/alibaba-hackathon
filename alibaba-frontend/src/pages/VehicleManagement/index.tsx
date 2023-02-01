import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { vehicleManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { VehicleDatatable } from 'components/Datatable/Vehicle/VehicleDatatable';
import { PageTitle } from 'components/Shared/PageTitle';

const VehicleManagement = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <VehicleManagementStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <PageTitle text={t(`${vehicleManagementPageTranslationsPath}.pageHeading`)} />
      <VehicleDatatable />
    </VehicleManagementStyled>
  );
};

const VehicleManagementStyled = styled.div<{ isDirectionRtl: boolean }>`
  padding: 0.5rem;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;

export default VehicleManagement;
