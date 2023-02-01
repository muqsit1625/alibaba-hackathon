import { Dispatch } from 'react';

export type RightSidebarState = {
  showNotifications: boolean;
  showDriverAndVehicleDetails: boolean;
  showSidebar: boolean;
};

export type ActionTypes =
  | {
      type: 'SET_SHOW_NOTIFICATIONS';
      payload: boolean;
    }
  | {
      type: 'SET_SHOW_DRIVER_AND_VEHICLE_DETAILS';
      payload: boolean;
    }
  | {
      type: 'SET_SHOW_SIDEBAR';
      payload: boolean;
    };

export type UseReducer = [RightSidebarState, Dispatch<ActionTypes>];
