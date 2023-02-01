//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react';

export default function MyMap(props: any) {
  const { children, style, center, zoom } = props;

  const [map, setMap] = useState();

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { center, zoom }));
    }
  }, [ref, map, center, zoom]);

  return (
    <>
      <div ref={ref} id="map" style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
}
