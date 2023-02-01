export const byteCorpGeoCordinates: {
  latitude: number;
  longitude: number;
} = {
  latitude: 24.9181115,
  longitude: 67.12395766666667,
};
export const liveVehiclesLocationInterval: number = 10000;
export const driverAuthStatusInterval: number = 10000;
export const currentDriverInVehicleInterval: number = 10000;
export const currentDriverAnomaliesInterval: number = 10000;
export const vehicleLastOnlineInterval: number = 10000;
export const vehicleOnlineStatusInterval: number = 5000;

export type anomalyTypeEnumType = {
  drowsy_anomaly: string;
  distracted_anomaly: string;
  unauthorized_anomaly: string;
  idle_anomaly: string;
};
export const anomalyTypeEnum: anomalyTypeEnumType = {
  drowsy_anomaly: 'Drowsy',
  distracted_anomaly: 'Distracted',
  unauthorized_anomaly: 'Unauthorized',
  idle_anomaly: 'Idle',
};

type Configs = {
  oneSignalAppId: string | undefined;
  apiRoute: string | undefined;
};

export const configVars: Configs = {
  oneSignalAppId: process.env.REACT_APP_ONESIGNAL_APP_ID,
  apiRoute: process.env.REACT_APP_API_ROUTE_DEMO,
};

export const rtlLocales = ['ar'];
export const selectedLanguage = 'en';

// i18n translation files JSON paths
export const anomaliesPageTranslationsPath = 'anomaliesPage';
export const dashboardPageTranslationsPath = 'dashboardPage';
export const driverManagementPageTranslationsPath = 'driverManagementPage';
export const driverReportTranslationsPath = 'driverReportPage';
export const leftSidebarTranslationsPath = 'leftSidebar';
export const mapOverviewPageTranslationsPath = 'mapOverviewPage';
export const profilePageTranslationsPath = 'profilePage';
export const reportsTranslationsPath = 'reportsPage';
export const rightSidebarTranslationsPath = 'rightSidebar';
export const signInPageTranslationsPath = 'signInPage';
export const vehicleManagementPageTranslationsPath = 'vehicleManagementPage';
export const vehicleReportTranslationsPath = 'vehicleReportPage';
