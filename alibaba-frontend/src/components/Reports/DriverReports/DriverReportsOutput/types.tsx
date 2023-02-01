export type DriverReportsOutputProps = {
  data: any;
  driverImage: string;
  reportData: any;
  reportBySessionData: any;
  driverReportBySessionQueryState: any;
};

export type DriverDetailsType = {
  [key: string]: string;
  // Name: string;
  // 'Driver License Number': string;
  // 'Onboarding Date': string;
  // Address: string;
  // CNIC: string;
  // 'Phone Number': string;
};

export type DriverStatsType = {
  [key: string]: string;
  // 'Total Distance': string;
  // 'Average Distance/Day': string;
  // 'Total Time': string;
  // 'Average Time/Day': string;
  // 'Total Idle Time': string;
  // 'Average Idle Time/Day': string;
};

export type EventsDetailsType = {
  [key: string]: string | number;
  // 'Total Events': string | number;
  // 'Average Events/Day': string | number;
  // 'Distracted Count': string | number;
  // 'Drowsy Count': string | number;
};
