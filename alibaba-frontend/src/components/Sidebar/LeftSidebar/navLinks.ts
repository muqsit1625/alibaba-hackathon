import React, { SVGProps } from 'react';

import {
  AnomaliesIcon,
  MapOverviewIcon,
  MapOverviewHoveredIcon,
  DriverManagementIcon,
  DriverManagementHoveredIcon,
  AnomaliesHoveredIcon,
  VehicleManagementIcon,
  VehicleManagementHoveredIcon,
  ReportsIcon,
  ReportsHoveredIcon,
} from 'global/icons';
import { leftSidebarTranslationsPath } from 'global/variables';
import { GraphBlueIcon, GraphWhiteIcon } from 'global/image';

const navLinks: {
  id: string;
  name: string;
  path: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  hoverIcon: React.FC<SVGProps<SVGSVGElement>>;
}[] = [
  {
    id: 'overview',
    name: `${leftSidebarTranslationsPath}.mapOverviewText`,
    path: '/overview',
    icon: MapOverviewIcon,
    hoverIcon: MapOverviewHoveredIcon,
  },
  {
    id: 'dashboard',
    name: `${leftSidebarTranslationsPath}.dashboardOverviewText`,
    path: '/dashboard',
    icon: GraphBlueIcon,
    hoverIcon: GraphWhiteIcon,
  },
  {
    id: 'driver-management',
    name: `${leftSidebarTranslationsPath}.driverManagementText`,
    path: '/driver-management',
    icon: DriverManagementIcon,
    hoverIcon: DriverManagementHoveredIcon,
  },
  {
    id: 'vehicle-management',
    name: `${leftSidebarTranslationsPath}.vehicleManagementText`,
    path: '/vehicle-management',
    icon: VehicleManagementIcon,
    hoverIcon: VehicleManagementHoveredIcon,
  },
  {
    id: 'anomalies',
    name: `${leftSidebarTranslationsPath}.anomaliesText`,
    path: '/anomalies',
    icon: AnomaliesIcon,
    hoverIcon: AnomaliesHoveredIcon,
  },
  {
    id: 'reports',
    name: `${leftSidebarTranslationsPath}.reportsText`,
    path: '/reports',
    icon: ReportsIcon,
    hoverIcon: ReportsHoveredIcon,
  },
];

export default navLinks;
