import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { colors } from 'global/colors';
import { reportsTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { PageTitle } from 'components/Shared/PageTitle';
import ReportsCard from 'components/CCards/ReportsCard';
import SecondaryBtn from 'components/CButtons/SecondaryBtn';

const Reports = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <ReportsStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <PageTitle text={t(`${reportsTranslationsPath}.availableReportsHeading`)} />
      <CardsContainer>
        <ReportsCard title={t(`${reportsTranslationsPath}.driverBehaviorReportHeading`)}>
          <p className="reports__report-card-text">{t(`${reportsTranslationsPath}.driverBehaviorReportMessage`)}</p>
          <SecondaryBtn
            onClick={() => navigate('/reports/driver-reports')}
            bColor={colors.themeBlue}
            bColorHover={colors.themeSecondaryHover}
            padding="0 2rem"
            style={{
              borderRadius: '0.375rem',
              fontSize: '14px',
              lineHeight: '20px',
              padding: '2px 26px',
              marginTop: '16px',
            }}
          >
            {t(`${reportsTranslationsPath}.viewText`)}
          </SecondaryBtn>
        </ReportsCard>

        <ReportsCard title={t(`${reportsTranslationsPath}.vehicleSummaryReportHeading`)}>
          <p className="reports__report-card-text">{t(`${reportsTranslationsPath}.vehicleSummaryReportMessage`)}</p>
          <SecondaryBtn
            onClick={() => navigate('/reports/vehicle-reports')}
            bColor={colors.themeBlue}
            bColorHover={colors.themeSecondaryHover}
            padding="0 2rem"
            style={{
              borderRadius: '0.375rem',
              fontSize: '14px',
              lineHeight: '20px',
              padding: '2px 26px',
              marginTop: '16px',
            }}
          >
            {t(`${reportsTranslationsPath}.viewText`)}
          </SecondaryBtn>
        </ReportsCard>
      </CardsContainer>
    </ReportsStyled>
  );
};

const ReportsStyled = styled.div<{ isDirectionRtl: boolean }>`
  padding: 0.5rem;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 300px);
  grid-auto-rows: 1fr;
  gap: 1.25rem;
  margin: 1rem;

  .reports__report-card-text {
    font-size: 12px;
    line-height: 16px;
    margin: 0;
  }

  @media screen and (max-width: 700px) {
    display: flex;
    flex-direction: column;
  }
`;

export default Reports;
