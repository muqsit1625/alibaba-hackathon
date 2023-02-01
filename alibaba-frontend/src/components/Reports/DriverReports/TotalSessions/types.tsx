export type TotalSessionsProps = {
  reportBySessionData: any;
  geoJSONData: any;
  mapRouteImages: any;
  setMapRouteImages: React.Dispatch<React.SetStateAction<{}>>;
};

export type SessionHeaderProps = {
  startedAt?: string;
  endedAt?: string;
};

export type SessionType = {
  sessionID: string;
  geoJSONData: any;
  startedAt: string;
  endedAt: string;
  totalTime: string | number;
  travelTime: string | number;
  idleTime: string | number;
  distanceDriven: string;
  averageSpeed: string;
  maxSpeed: string;
  driverName: string;
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
    geoJSONData?: any;
    startedAt?: string;
    endedAt?: string;
    distanceDriven?: number | string;
    idleTime?: number | string;
    travelTime?: number | string;
    totalTime?: number | string;
    averageSpeed?: number | string;
    maxSpeed?: number | string;
    driverName?: string;
    distractedEvents?: number;
    drowsyEvents?: number | string;
    overSpeeding?: number | string;
    hardAcceleration?: number | string;
    harshBrakes?: number | string;
    sharpTurns?: number | string;
  };
  setMapRouteImages: React.Dispatch<React.SetStateAction<{}>>;
  mapRouteImages: any;
};
