//@ts-nocheck
import styled from 'styled-components';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

import GoogleMap from 'components/MapOverview/GoogleMap';
import MapControls from 'components/MapOverview/MapControls';
import MyMap from 'components/MapOverview/MyMap';

const MapOverview = () => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return 'LOADING...';
      case Status.FAILURE:
        return 'Error';
      case Status.SUCCESS:
        return <MyMap />;
    }
  };

  return (
    <MapOverviewStyled>
      <MapControls />

      {/* <Wrapper apiKey={`${process.env.REACT_APP_MAP_API}`} render={render}>
      </Wrapper> */}
      <GoogleMap />
    </MapOverviewStyled>
  );
};
const MapOverviewStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  > div:nth-of-type(2) {
    flex: 1;
  }
`;

export default MapOverview;
