import { MouseEventHandler } from 'react';
import styled from 'styled-components';

import { Button } from 'primereact/button';

type BtnProps = {
  children: React.ReactNode;
  bColor: string;
  bColorHover?: string;
  onClick?: MouseEventHandler;
  padding?: string;
  type?: any;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
};

const PrimaryBtn: React.FC<BtnProps> = (props) => {
  const { children, bColor, padding, onClick, bColorHover, type, loading, style, disabled } = props;

  return (
    <PrimaryBtnStyled bColor={bColor} bColorHover={bColorHover} padding={padding || '8px 44px'}>
      <Button
        className={`primary-button ${loading ? 'primary-button--disabled' : ''}`}
        loading={loading}
        type={type ?? 'button'}
        onClick={onClick}
        style={style}
        disabled={disabled || loading}
      >
        {children}
      </Button>
    </PrimaryBtnStyled>
  );
};

const PrimaryBtnStyled = styled('div')<{ bColor: string; padding: string; bColorHover?: string }>`
  .primary-button {
    background: none;
    border: 1px solid ${(props) => props.bColor || 'black'};
    outline: inherit;
    padding: ${(props) => props.padding || '8px 44px'};
    background-color: ${(props) => props.bColor || 'black'};
    border-radius: 10px;
    color: #ffffff;
    font-family: 'Poppins';
    font-style: normal;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
    justify-content: center;
    width: auto;
    column-gap: 8px;
    box-shadow: none;

    &:hover {
      background-color: ${(props) => props.bColorHover || '#3b82f6'};
      border: 1px solid ${(props) => props.bColorHover || '#3b82f6'};
    }

    &:disabled {
      cursor: not-allowed;
      pointer-events: none;
      justify-content: space-between;
    }
  }
`;

export default PrimaryBtn;
