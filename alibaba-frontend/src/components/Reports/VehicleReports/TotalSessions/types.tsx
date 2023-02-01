export type TotalSessionsProps = {
  reportBySessionData?: any;
  tripsData: any;
  tripGeoJSONData: any;
  geoJSONData: any;
  mapRouteImages: any;
  setMapRouteImages: React.Dispatch<React.SetStateAction<{}>>;
};

export type AccordionHeaderProps = {
  startedAt?: string;
  endedAt?: string;
  startLocation?: string;
  endLocation?: string;
};

export type TripType = {
  tripID: string;
  geoJSONData: any;
  startedAt: string;
  endedAt: string;
  totalTime: string | number;
  travelTime: string | number;
  idleTime: string | number;
  startLocation?: string | any;
  endLocation?: string | any;
  distanceDriven: string | number;
  averageSpeed: string | number;
  maxSpeed: string | number;
  drivers: any;
  totalEvents: number;
  distractedEvents: number;
  drowsyEvents: number;
  overSpeeding: number;
  hardAcceleration: number;
  harshBrakes: number;
  sharpTurns: number;
  sessions: SessionType[];
};

export type SessionType = {
  sessionID: string;
  geoJSONData: any;
  startedAt: string;
  endedAt: string;
  totalTime: string | number;
  travelTime: string | number;
  idleTime: string | number;
  startLocation: string | any;
  endLocation: string | any;
  distanceDriven: string | number;
  averageSpeed: string | number;
  maxSpeed: string | number;
  drivers: any;
  totalEvents: number;
  distractedEvents: number;
  drowsyEvents: number;
  overSpeeding: number;
  hardAcceleration: number;
  harshBrakes: number;
  sharpTurns: number;
};

export type SessionBodyProps = {
  sessionBodyData: {
    sessionID: string;
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
