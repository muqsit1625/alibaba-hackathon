//@ts-nocheck
import { createContext, useContext, useReducer } from 'react';

import { rtlLocales, selectedLanguage } from 'global/variables';

const selectedLanguageOnLocal = localStorage.getItem('autilent-fleet-manager-language');
console.log('%cselectedLanguageOnLocal:', 'background-color:green;color:white;', selectedLanguageOnLocal);
const initState = {
  isDirectionRtl: rtlLocales.includes(selectedLanguageOnLocal ? selectedLanguageOnLocal : selectedLanguage)
    ? true
    : false,
};

export const StateContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_IS_DIRECTION_RTL':
      return { ...state, isDirectionRtl: action.payload };
    default:
      throw new Error('Invalid action type!');
  }
};

export default function StateProvider(props: any) {
  return <StateContext.Provider value={useReducer(reducer, initState)}>{props.children}</StateContext.Provider>;
}

export const useStateValue = () => useContext(StateContext);
