import Dashboard from 'pages/Dashboard';
import DriverReports from 'pages/DriverReports';
import VehicleReports from 'pages/VehicleReports';
import { Anomalies, MapOverview, DriverLiveView, DriverManagement, Reports, VehicleManagement, Profile } from './pages';

const defaultRoutes = [
  {
    path: '/anomalies',
    name: 'Anomalies',
    element: Anomalies,
    layout: '',
    info: 'private',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: Dashboard,
    layout: '',
    info: 'private',
  },
  {
    path: '/driver-management',
    name: 'Driver Management Page',
    element: DriverManagement,
    layout: '',
    info: 'private',
  },
  {
    path: '/driver-management/live-view',
    name: 'Driver Live View Page',
    element: DriverLiveView,
    layout: '',
    info: 'private',
  },
  {
    path: '/overview',
    name: 'Overview Page',
    element: MapOverview,
    layout: '',
    info: 'private',
  },
  {
    path: '/profile',
    name: 'Profile Page',
    element: Profile,
    layout: '',
    info: 'private',
  },
  {
    path: '/reports',
    name: 'Reports',
    element: Reports,
    layout: '',
    info: 'private',
  },
  {
    path: '/reports/driver-reports',
    name: 'Driver Reports',
    element: DriverReports,
    layout: '',
    info: 'private',
  },
  {
    path: '/reports/vehicle-reports',
    name: 'Vehicle Reports',
    element: VehicleReports,
    layout: '',
    info: 'private',
  },
  {
    path: '/vehicle-management',
    name: 'Vehicle Management Page',
    element: VehicleManagement,
    layout: '',
    info: 'private',
  },
];

export { defaultRoutes };
