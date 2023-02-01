import styled from 'styled-components';
import { colors } from '../../global/colors';

export const PageTitle = ({ text }: { text: string }) => {
  return <StyledTitle>{text}</StyledTitle>;
};

const StyledTitle = styled.h2`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.01em;
  color: ${colors.dgray};
  margin: 0px 16px 12px 16px;
`;
