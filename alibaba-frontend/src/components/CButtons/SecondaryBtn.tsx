import { MouseEventHandler } from 'react';
import styled from 'styled-components';

type BtnProps = {
  loading?: boolean;
  children: React.ReactNode;
  bColor?: string;
  bColorHover?: string;
  onClick?: MouseEventHandler;
  padding?: string;
  type?: any;
  style?: any;
};

const SecondaryBtn: React.FC<BtnProps> = (props) => {
  const { loading, children, bColor, padding, onClick, bColorHover, type, style } = props;

  return (
    <SecondaryBtnStyled bColor={bColor} padding={padding || '8px 44px'} bColorHover={bColorHover}>
      <button
        className={`secondary-button ${loading ? 'secondary-button--disabled' : ''}`}
        type={type ?? 'button'}
        onClick={onClick}
        style={style}
        disabled={loading}
      >
        {children}
      </button>
    </SecondaryBtnStyled>
  );
};

const SecondaryBtnStyled = styled('div')<{ bColor?: string; padding?: string; bColorHover?: string }>`
  .secondary-button {
    background: none;
    border: 1px solid ${(props) => props.bColor || 'black'};
    outline: inherit;
    padding: ${(props) => props.padding || '8px 44px'};
    background-color: #ffffff;
    border-radius: 10px;
    color: ${(props) => props.bColor || 'black'};
    font-family: 'Poppins';
    font-style: normal;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .secondary-button:hover {
    background-color: ${(props) => props.bColorHover || 'black'};
  }

  .secondary-button--disabled {
    border: 1px solid #9bc0ed;
    color: #9bc0ed;
    cursor: default;
  }
`;

export default SecondaryBtn;
