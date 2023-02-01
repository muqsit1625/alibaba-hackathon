export type VehicleReportsOutputProps = {
  reportData: any;
  reportDataNew?: any;
  data: any;
  reportBySessionData: any;
  reportByTripData: any;
  vehicleImage: string;
  driverImage: string;
  vehicleReportBySessionQueryState: any;
  vehicleReportByTripQueryState: any;
};

export type VehicleDetailsType = {
  [key: string]: string;
  // 'Vehicle Name': string;
  // 'Vehicle Plate No': string;
  // 'Vin Number': string;
  // 'Distance Covered': string;
  // 'Distance Covered/Day': string;
  // 'Last Location': string;
  // 'Last Online': string;
  // 'Start Location': string;
  // 'End Location': string;
  // 'Max Speed': string;
  // 'Average Speed': string;
  // 'Travel Time': string;
  // 'Travel Time/Day': string;
  // 'Total Idle Time': string;
};

export type EventsDetailsType = {
  [key: string]: string;
  // 'Distracted Count': string | number;
  // 'Drowsy Count': string | number;
};

export type DriverDetailsType = {
  [key: string]: string;
  // 'Current Driver': string;
  // 'Authorization Status': string;
  // 'Last Updated': string;
};
