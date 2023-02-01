import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Dropdown } from 'primereact/dropdown';

import { leftSidebarTranslationsPath, rtlLocales } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { Languages, LanguageSelectorProps } from './types';
// import { Detector, Offline, Online } from 'react-detect-offline';
import { OfflineWifiImg, OnlineWifiImg } from 'global/image';

const lngs: Languages = {
  en: {
    label: 'English',
    value: 'en',
  },
  ar: {
    label: 'Arabic',
    value: 'ar',
  },
};

export default function LanguageSelector(props: LanguageSelectorProps) {
  const [reducerState, reducerDispatch]: any = useStateValue();
  const { t, i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(lngs[i18n.language as keyof Languages].value);
  console.log('%ci18n.language:', 'background-color:red;color:white;', i18n);

  const onLanguageChange = (event: any) => {
    console.log('onLanguageChange:', event);

    setSelectedLanguage(lngs[event.value as keyof Languages].value);
    i18n.changeLanguage(event.value);
    reducerDispatch({ type: 'SET_IS_DIRECTION_RTL', payload: rtlLocales.includes(event.value) });

    localStorage.setItem('autilent-fleet-manager-language', event.value);
  };

  return (
    <LanguageSelectorStyled isDirectionRtl={reducerState.isDirectionRtl}>
      {/* <Offline>
        <i
          title="No Internet connection"
          className="pi pi-wifi detector__image"
          style={{ fontSize: '2em', color: '#f31919' }}
        ></i>
      </Offline>
      <Online>
        <i
          title="You are Connected"
          className="pi pi-wifi detector__image"
          style={{ fontSize: '2em', color: '#14ae5c' }}
        ></i>
      </Online> */}
      <Dropdown
        dropdownIcon={''}
        valueTemplate={<i className="pi pi-globe"></i>}
        options={Object.values(lngs)}
        value={selectedLanguage}
        onChange={onLanguageChange}
      />
    </LanguageSelectorStyled>
  );
}

const LanguageSelectorStyled = styled.div<{ isDirectionRtl: boolean }>`
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  padding: 12px;
  background-color: white;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .language-selector__select-language {
    font-size: 12px;
    margin: 0;
    font-weight: bold;
  }

  .p-dropdown {
  }

  .p-dropdown .p-dropdown-trigger {
    width: 0;
  }

  .p-dropdown .p-dropdown-trigger .p-dropdown-trigger-icon {
    font-size: 12px;
  }

  .p-inputtext {
    padding: 4px 8px;
    font-size: 12px;
  }

  .detector__image {
    display: none;

    @media (max-width: 850px) {
      display: flex;
    }
  }

  @media screen and (max-width: 850px) {
    top: unset;
    right: unset;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    border-top: 1px solid #ced4da;
    border-right: 1px solid #ced4da;
    border-top-right-radius: 10px;
  }
`;
