//@ts-nocheck
import { useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

import Marker from './Marker';
import MyMap from './MyMap';

import CarOnlineAuthorizedIcon from 'assets/icons/car-online-authorized-icon.png';
// import CarOnlineUnAuthorizedIcon from 'assets/icons/car-online-unauthorized-icon.png';
import CarOfflineAuthorizedIcon from 'assets/icons/car-offline-authorized-icon.png';
// import CarOfflineUnAuthorizedIcon from 'assets/icons/car-offline-unauthorized-icon.png';

export default function CustomMap(props) {
  const { vehicles } = props;

  const [clicks, setClicks] = useState([]);
  console.log('clicks:', clicks);
  //   const [zoom, setZoom] = useState(12); // initial zoom
  //   const [center, setCenter] = useState({
  //     lat: 24.9181115,
  //     lng: 67.12395766666667
  //   });

  useEffect(() => {
    if (vehicles.length > 0) {
      const markers = [];

      vehicles.forEach((vehicle, index) => {
        const latitude = vehicle?.payload?.latitude;
        const longitude = vehicle?.payload?.longitude;

        markers[index] = {};

        if (latitude && longitude) {
          const googleMapLatLng = new google.maps.LatLng(latitude, longitude);

          markers[index].googleMapLatLng = googleMapLatLng;
        }

        markers[index].icon = null;

        if (vehicle?.is_online === true) {
          markers[index].icon = CarOnlineAuthorizedIcon;
        }
        if (vehicle?.is_online === false) {
          markers[index].icon = CarOfflineAuthorizedIcon;
        }
      });

      setClicks(markers);
    }
  }, [vehicles]);

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
    <Wrapper apiKey={`${process.env.REACT_APP_MAP_API}`} render={render}>
      <MyMap center={center} zoom={zoom} style={{ flexGrow: '1', height: '100%' }}>
        {clicks.map((click, i) => (
          <Marker
            key={i}
            position={click.googleMapLatLng}
            icon={{
              url: click.icon,
              scaledSize: new google.maps.Size(50, 50)
            }}
          />
        ))}
      </MyMap>
    </Wrapper>
  );
}
