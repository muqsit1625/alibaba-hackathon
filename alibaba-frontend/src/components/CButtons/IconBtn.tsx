import styled from 'styled-components';

import { Button, ButtonPositionType } from 'primereact/button';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';
interface IIconBtn {
  btnText: string;
  btnPos: ButtonPositionType | undefined;
  btnIcon: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset' | undefined;
  fontSize?: string;
  lineHeight?: string;
  style?: any;
}

const IconBtn: React.FC<IIconBtn> = ({ btnText, btnPos, btnIcon, onClick, type, fontSize, lineHeight, style }) => {
  const [reducerState]: any = useStateValue();

  return (
    <IconBtnStyled isDirectionRtl={reducerState.isDirectionRtl} fontSize={fontSize} lineHeight={lineHeight}>
      <Button label={btnText} icon={`pi ${btnIcon}`} iconPos={btnPos} onClick={onClick} type={type} style={style} />
    </IconBtnStyled>
  );
};

const IconBtnStyled = styled.div<{ isDirectionRtl: boolean; fontSize?: string; lineHeight?: string }>`
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .p-button {
    background: #447abb;
    border-radius: 10px;
    gap: 8px;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 20px;
  }

  .p-button-label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => props.fontSize || '12px'};
    line-height: ${(props) => props.lineHeight || '18px'};
  }

  .p-button .p-button-icon-left {
    font-size: 12px;
  }

  .p-button .p-button-icon-right {
    font-size: 12px;
    transform: ${(props) => (props.isDirectionRtl ? 'rotate(180deg)' : 'unset')};
  }
`;

export default IconBtn;
