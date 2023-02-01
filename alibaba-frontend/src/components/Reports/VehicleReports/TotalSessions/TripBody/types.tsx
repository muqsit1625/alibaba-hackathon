export type TripBodyProps = {
  tripBodyData: {
    tripID: string;
    geoJSONData: any;
    startedAt?: string;
    endedAt?: string;
    distanceDriven?: number | string;
    startLocation?: string;
    endLocation?: string;
    idleTime?: number | string;
    travelTime?: number | string;
    totalTime?: number | string;
    averageSpeed?: number | string;
    maxSpeed?: number | string;
    drivers?: any[];
    totalEvents?: number;
    distractedEvents?: number;
    drowsyEvents?: number;
    overSpeeding?: number | string;
    hardAcceleration?: number | string;
    harshBrakes?: number | string;
    sharpTurns?: number | string;
  };
  setMapRouteImages: React.Dispatch<React.SetStateAction<{}>>;
  mapRouteImages: any;
};
