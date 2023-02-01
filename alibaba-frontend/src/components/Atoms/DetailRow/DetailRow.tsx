import styled from 'styled-components';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

export function Title(props: { children: any }) {
  return <p className="detail-row__title">{props.children}</p>;
}

export function Value(props: { children: any; valueColor?: string }) {
  return (
    <p className="detail-row__value" style={{ color: props.valueColor }}>
      {props.children}
    </p>
  );
}

export function TimeElapsed(props: { children: any }) {
  return <p className="detail-row__time-elapsed">{props.children}</p>;
}

export default function DetailRow(props: { children: any }) {
  const [reducerState]: any = useStateValue();

  return <DetailRowStyled isDirectionRtl={reducerState.isDirectionRtl}>{props.children}</DetailRowStyled>;
}

const DetailRowStyled = styled.div<{ isDirectionRtl: boolean }>`
  display: flex;
  font-size: 10px;
  line-height: 14px;

  .detail-row__title {
    min-width: 88px;
  }

  .detail-row__title::after {
    content: ':';
    margin-right: 4px;
  }

  .detail-row__value {
    font-weight: 600;
    color: black;
    direction: ltr;
  }

  .detail-row__time-elapsed {
    margin-left: ${(props) => (props.isDirectionRtl ? '0' : '5px')};
    margin-right: ${(props) => (props.isDirectionRtl ? '5px' : '0')};
    color: #999999;
    min-width: 40px;
  }

  @media screen and (min-width: 1400px) {
    font-size: 14px;
    line-height: 18px;
  }

  @media screen and (max-width: 1199px) {
    display: grid;
    place-items: center;

    .detail-row__title {
      min-width: unset;
    }
    .detail-row__title::after {
      content: '';
    }

    .detail-row__time-elapsed {
      text-align: center;
    }
  }

  @media screen and (max-width: 850px) {
    line-height: calc(16px + (24 - 16) * ((100vw - 300px) / (1200 - 300)));
    font-size: calc(10px + (18 - 10) * ((100vw - 300px) / (1200 - 300)));
  }
`;
