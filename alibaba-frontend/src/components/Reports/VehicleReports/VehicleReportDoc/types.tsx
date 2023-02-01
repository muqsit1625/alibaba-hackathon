export type VehicleReportDocProps = {
  isDirectionRtl: boolean;
  detailTypeToLanguageTextMap: any;
  tripsData: any;
  reportData: any;
  metaData: any;
  reportBySessionData: any;
  lastUpdated: any;
  vehicleImage: string;
  driverImage: string;
  mapRouteImages: any;
};

export type TripType = {
  tripID: string;
  startedAt: string;
  endedAt: string;
  totalTime: string | number;
  travelTime: string | number;
  idleTime: string | number;
  startLocation: string;
  endLocation: string;
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
  startedAt: string;
  endedAt: string;
  totalTime: string;
  travelTime: string;
  idleTime: string;
  startLocation: string;
  endLocation: string;
  distanceDriven: string;
  averageSpeed: string;
  maxSpeed: string;
  drivers: any;
  totalEvents: number;
  distractedEvents: number;
  drowsyEvents: number;
  overSpeeding: number;
  hardAcceleration: number;
  harshBrakes: number;
  sharpTurns: number;
};
