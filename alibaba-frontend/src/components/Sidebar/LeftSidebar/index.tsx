import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import OneSignal from 'react-onesignal';

import { LogoMark, LogoutIcon } from 'global/image';
import { leftSidebarTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import navLinks from './navLinks';

import LanguageSelector from 'components/Shared/LanguageSelector/LanguageSelector';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, ready } = useTranslation();
  const [reducerState]: any = useStateValue();

  const renderNavLinks = useMemo(() => {
    return navLinks.map((navLink) => {
      return (
        <div
          key={navLink.id}
          className={`sidebar__nav-link ${pathname.includes(navLink.id) ? 'sidebar__nav-link--active' : ''}`}
          onClick={() => navigate(navLink.path)}
        >
          <div className="sidebar__nav-link-icons">
            <navLink.icon className="sidebar__nav-link-icon" />
            <navLink.hoverIcon className="sidebar__nav-link-hovered-icon" />
          </div>
          <p className="sidebar__nav-link-name">{t(`${navLink.name}`)}</p>
        </div>
      );
    });
  }, [navigate, pathname, t]);

  const onLogoutClick = () => {
    //@ts-ignore
    if (window.confirm(`${t(`${leftSidebarTranslationsPath}.shouldLogoutText`)}`)) {
      localStorage.clear();
      navigate('/');
      toast.success('Logged out successfully!', { autoClose: 2000 });

      OneSignal.removeExternalUserId();
      window.location.reload();
    }
  };

  return (
    <LeftSidebarStyled isDirectionRtl={reducerState.isDirectionRtl} className="sidebar">
      <div className="sidebar__logo-container">
        <LogoMark className="sidebar__logo" onClick={() => navigate('/')} />
      </div>

      <div className="sidebar__content">
        <div className="sidebar__nav-links-container">
          <div className="sidebar__nav-links">{renderNavLinks}</div>
        </div>

        <div className="sidebar__logout-link-container">
          <div className="sidebar__logout-link" onClick={onLogoutClick}>
            <LogoutIcon className="sidebar__logout-icon" />

            <p className="sidebar__logout-link-text">{t(`${leftSidebarTranslationsPath}.logoutText`)}</p>
          </div>
        </div>
      </div>
    </LeftSidebarStyled>
  );
};

const LeftSidebarStyled = styled.aside<{ isDirectionRtl: boolean }>`
  margin: 0;
  z-index: 101;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 260px;
  background-color: #ffffff;
  position: fixed;
  top: 0;
  border-right: 1px solid #f8f8f8;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .sidebar__logo-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }

  .sidebar__logo {
    cursor: pointer;
  }

  .sidebar__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 60px;
    overflow: auto;
    padding: 10px 24px 32px 24px;
  }

  .sidebar__nav-links-container {
    display: grid;
    row-gap: 16px;
  }

  .sidebar__nav-links {
    display: grid;
    row-gap: 8px;
    column-gap: 12px;
  }

  .sidebar__nav-link,
  .sidebar__logout-link {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    column-gap: 8px;
    cursor: pointer;
    color: var(--app-primary-color);
    text-decoration: none;
    border-radius: 10px;
    background: #f8f8f8;
    transition: all var(--button-transition-timing) ease;
  }

  .sidebar__nav-link {
    position: relative;
    grid-template-columns: 20px 1fr;
    padding: 10px 12px 10px 12px;
  }

  .sidebar__nav-link-icons {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .sidebar__logout-link {
    padding: 10px 12px 10px 12px;
    column-gap: 4px;
  }

  .sidebar__logout-icon {
    height: 18px;
    width: 18px;
  }

  .sidebar__logout-link-text {
    margin: 0;
    font-size: 12px;
    line-height: 18px;
  }

  .sidebar__nav-link--active {
    background-color: var(--app-primary-color);
    color: white;
  }

  .sidebar__nav-link svg {
    position: absolute;
    align-self: center;
    transition: all var(--button-transition-timing) ease;
    height: 14px;
    width: 14px;
  }

  .sidebar__nav-link:hover:not(.active) {
    background-color: var(--app-primary-color);
    color: white;
  }

  .sidebar__nav-link:hover svg path {
    transition: all var(--button-transition-timing) ease;
  }

  .sidebar__nav-link-hovered-icon {
    opacity: 0;
  }

  .sidebar__nav-link:hover .sidebar__nav-link-hovered-icon {
    opacity: 1;
  }
  .sidebar__nav-link:hover .sidebar__nav-link-icon {
    opacity: 0;
  }

  .sidebar__nav-link--active .sidebar__nav-link-hovered-icon {
    opacity: 1;
  }
  .sidebar__nav-link--active .sidebar__nav-link-icon {
    opacity: 0;
  }

  .sidebar__nav-link-name {
    margin: 0;
    font-size: 12px;
    line-height: 18px;
  }

  .sidebar__logout-link-container {
    display: flex;
    justify-content: center;
  }

  .sidebar__logout-link {
    cursor: pointer;
    background-color: hsl(0, 85%, 71%) !important;
    color: #ffffff !important;
    fill: #ffffff !important;
    width: 100%;

    :hover {
      background-color: hsl(0, 85%, 61%) !important;
    }
  }

  @media screen and (max-width: 1000px) {
    width: 240px;
  }

  @media screen and (max-width: 850px) {
    width: 100%;
    height: auto;
    position: relative;
    margin-top: 0;
    border-right: 0;

    .sidebar__logo-container {
      display: none;
    }

    .sidebar__content {
      display: none;
    }

    .sidebar__nav-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .sidebar__nav-link {
      justify-items: center;
    }

    .sidebar__logout-link {
      width: auto;
    }
  }
`;

export default LeftSidebar;
