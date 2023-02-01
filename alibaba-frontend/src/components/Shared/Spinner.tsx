import { Oval } from 'react-loader-spinner';

interface SpinnerProps {
  height?: number;
  width?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
  strokeWidth?: number;
  secondaryStrokeWidth?: number;
}

export default function Spinner(props: SpinnerProps) {
  const {
    height = 80,
    width = 80,
    color = 'var(--app-primary-color)',
    secondaryColor = 'var(--app-primary-color)',
    className,
    strokeWidth = 2,
    secondaryStrokeWidth = 2
  } = props;

  return (
    <Oval
      height={height}
      width={width}
      color={color}
      wrapperClass={className}
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor={secondaryColor}
      strokeWidth={strokeWidth}
      strokeWidthSecondary={secondaryStrokeWidth}
    />
  );
}
