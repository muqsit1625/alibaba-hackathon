import styled from 'styled-components';
import { colors } from '../../global/colors';


type BlackBtnProps = {
  children: React.ReactNode;
};

const BlackBtn: React.FC<BlackBtnProps> = ({ children }) => {
  return <BlackBtnStyled>{children}</BlackBtnStyled>;
};

const BlackBtnStyled = styled.button`
  background: none;
  border: none;
  outline: inherit;
  padding: 16px 32px;
  background: ${colors.dgray};
  border-radius: 6px;
  color: #ffffff;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  cursor: pointer;
`;

export default BlackBtn;
