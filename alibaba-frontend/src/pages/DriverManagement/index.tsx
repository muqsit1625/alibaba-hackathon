import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { driverManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { DriverDatatable } from 'components/Datatable/Driver/DriverDatatable';
import { PageTitle } from 'components/Shared/PageTitle';

const DriverManagement = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <DriverManagementStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <PageTitle text={t(`${driverManagementPageTranslationsPath}.pageHeading`)} />
      <DriverDatatable />
    </DriverManagementStyled>
  );
};

const DriverManagementStyled = styled.div<{ isDirectionRtl: boolean }>`
  padding: 0.5rem;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;

export default DriverManagement;
