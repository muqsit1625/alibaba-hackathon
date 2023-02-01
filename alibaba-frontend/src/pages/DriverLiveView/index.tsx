import styled from 'styled-components';
import { colors } from '../../global/colors';
import { DriverLiveViewLogic } from 'components/DriverLiveView/DriverLiveViewLogic';
import { Breadcrumbs } from 'components/Shared/Breadcrumbs';

const DriverLiveView = () => {
  const breadcrumbs = [
    {
      link: '/driver-management',
      label: 'Driver Management',
    },
    {
      link: '',
      label: 'Live View',
    },
  ];

  return (
    <DriverLiveViewStyled>
      <Breadcrumbs items={breadcrumbs} />
      <DriverLiveViewLogic />
    </DriverLiveViewStyled>
  );
};

const DriverLiveViewStyled = styled.div`
  padding: 2.5rem 1.125rem 0;
  display: flex;
  flex-direction: column;

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 28px;
    line-height: 24px;
    letter-spacing: -0.01em;
    color: ${colors.dgray};
    margin-bottom: 30px;
  }
`;

export default DriverLiveView;
