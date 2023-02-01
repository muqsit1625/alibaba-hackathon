import styled from 'styled-components';

import ProfileContainer from 'components/Profile/ProfileContainer/ProfileContainer';

type Props = {};

export default function index(props: Props) {
  return (
    <ProfileStyled>
      <ProfileContainer />
    </ProfileStyled>
  );
}

const ProfileStyled = styled.div`
  flex: 1;
  display: flex;

  @media screen and (max-width: 500px) {
    padding-top: 100px;
  }
`;
