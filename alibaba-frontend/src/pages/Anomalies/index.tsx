import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { anomaliesPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useGetAllAnomaliesGroupByDriversQuery } from 'redux/endpoints/anomalies';

import { PageTitle } from 'components/Shared/PageTitle';
import AnomaliesDataTable from 'components/Datatable/Anomalies/AnomaliesDataTable';

const Anomalies = () => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <AnomaliesStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <PageTitle text={t(`${anomaliesPageTranslationsPath}.anomaliesPageHeading`)} />

      <AnomaliesDataTable />
    </AnomaliesStyled>
  );
};

const AnomaliesStyled = styled.div<{ isDirectionRtl: boolean }>`
  padding: 8px;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;

export default Anomalies;
