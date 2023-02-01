import styled from 'styled-components';

import { Card } from 'primereact/card';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

interface ReportsCardProps {
  title: string;
  subTitle?: string;
  children?: any;
}

const ReportsCard = ({ title, subTitle, children }: ReportsCardProps) => {
  const [reducerState]: any = useStateValue();

  return (
    <StyledReportsCard title={title} subTitle={subTitle} isDirectionRtl={reducerState.isDirectionRtl}>
      {children}
    </StyledReportsCard>
  );
};

export default ReportsCard;

const StyledReportsCard = styled(Card)<{ isDirectionRtl: boolean }>`
  width: 18.25rem;
  font-family: 'Inter';

  .p-card-title {
    margin: 0;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: -0.01em;
    color: #447abb;
  }

  .p-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .p-card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    font-style: normal;
    font-weight: 400;
    font-size: 0.9rem;
    line-height: 1.25rem;
    letter-spacing: -0.01em;
    padding-top: 0.5rem;
    height: 100%;
    color: #999999;
    padding-bottom: 0;
  }

  @media screen and (max-width: 700px) {
    width: 100%;
  }
`;
