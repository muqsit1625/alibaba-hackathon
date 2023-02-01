import { colors } from '../../global/colors';
import styled from 'styled-components';

type IconUnfilledBtnProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
};

const IconUnfilledBtn: React.FC<IconUnfilledBtnProps> = ({ onClick, children }) => {
  return <IconBtnStyled onClick={onClick}>{children}</IconBtnStyled>;
};

const IconBtnStyled = styled.button`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid ${colors.themeBlue};
  border-radius: 5.49796px;
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  letter-spacing: -0.01em;
  color: ${colors.themeBlue};
  padding: 11.5px 20px;
  cursor: pointer;
  :hover {
    background: #f0ebeb;
  }
  svg {
    margin-right: 10px;
  }
`;

export default IconUnfilledBtn;
