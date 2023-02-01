export type DriverReportDocProps = {
  isDirectionRtl: boolean;
  reportData: any;
  reportBySessionData: any;
  metaData: any;
  driverImage: string;
  mapRouteImages: any;
};

export type SessionType = {
  sessionID: string;
  startedAt: string;
  endedAt: string;
  totalTime: string;
  travelTime: string;
  idleTime: string;
  distanceDriven: string;
  averageSpeed: string;
  maxSpeed: string;
  totalEvents: number;
  distractedEvents: number;
  drowsyEvents: number;
  overSpeeding: number;
  hardAcceleration: number;
  harshBrakes: number;
  sharpTurns: number;
};
