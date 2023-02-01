import { createContext, useReducer } from 'react';

import { ActionTypes, RightSidebarState, UseReducer } from './types';

export const initState: RightSidebarState = {
  showNotifications: false,
  showDriverAndVehicleDetails: true,
  showSidebar: true,
};

export const RightSidebarContext = createContext<UseReducer>([initState, () => {}]);

const reducer = (state: RightSidebarState, action: ActionTypes) => {
  switch (action.type) {
    case 'SET_SHOW_NOTIFICATIONS':
      return { ...state, showNotifications: action.payload };
    case 'SET_SHOW_DRIVER_AND_VEHICLE_DETAILS':
      return { ...state, showDriverAndVehicleDetails: action.payload };
    case 'SET_SHOW_SIDEBAR':
      return { ...state, showSidebar: action.payload };
    default:
      throw new Error('Invalid action type!');
  }
};

export default function RightSidebarProvider(props: any) {
  return (
    <RightSidebarContext.Provider value={useReducer(reducer, initState)}>{props.children}</RightSidebarContext.Provider>
  );
}
