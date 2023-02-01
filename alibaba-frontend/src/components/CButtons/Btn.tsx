import styled from 'styled-components';

type colorVariants = 'default' | 'theme' | 'green' | 'red';
type BtnProps = {
  children: React.ReactNode;
  variant?: colorVariants;
  className?: string;
  onClick?: () => any;
};

const BtnVariantToCSSColorMap: { [key: string]: string } = {
  default: 'black',
  theme: 'var(--app-primary-color)',
  green: 'var(--green-color)',
  red: 'var(--error-color)',
};
const variantHoverColor: {
  [key in colorVariants]: string;
} = {
  default: 'black',
  theme: 'var(--app-primary-hover-color)',
  green: 'var(--green-hover-color)',
  red: 'var(--error-hover-color)',
};

const Btn: React.FC<BtnProps> = (props) => {
  const { children, className, variant = 'default', onClick } = props;

  return (
    <BtnStyled variant={variant} className={` ${className || ''}`} onClick={onClick}>
      {children}
    </BtnStyled>
  );
};

const BtnStyled = styled('button')<{ variant: colorVariants }>`
  background: none;
  border: none;
  outline: inherit;
  padding: 8px 44px;
  background-color: ${(props) => BtnVariantToCSSColorMap[props.variant]};
  border-radius: 6px;
  color: #ffffff;
  font-family: 'Inter';
  font-style: normal;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
  transition: all var(--button-transition-timing) ease;

  &:hover {
    background-color: ${(props) => variantHoverColor[props.variant]};
  }
`;

export default Btn;
