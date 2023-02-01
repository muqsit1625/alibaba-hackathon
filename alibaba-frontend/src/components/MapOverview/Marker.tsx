//@ts-nocheck
import { useEffect, useState } from 'react';

export default function Marker(options) {
  const [marker, setMarker] = useState();
  console.log('marker:', marker);

  useEffect(() => {
    if (!marker) {
      setMarker(
        new google.maps.Marker({
          position: new google.maps.LatLng(24.9181115, 67.12395766666667)
        })
      );
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  return null;
}
