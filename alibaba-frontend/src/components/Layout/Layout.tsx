import { useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
// import { Offline, Online } from 'react-detect-offline';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Sidebar } from 'primereact/sidebar';

import { LogoutIcon } from 'global/image';
import { leftSidebarTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';
import RightSidebarProvider, {
  RightSidebarContext,
} from 'components/contexts/RightSidebarProvider/RightSidebarProvider';

import Header from './Header';
import LeftSidebar from 'components/Sidebar/LeftSidebar';
import RightSidebar from 'components/Sidebar/RightSidebar';
import navLinks from 'components/Sidebar/LeftSidebar/navLinks';

interface MobileSidebarProps {
  closeMobileSidebar: () => void;
}
const MobileSidebar = (props: MobileSidebarProps) => {
  const { closeMobileSidebar } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const onLogoutClick = () => {
    // window.location.reload();

    if (window.confirm('Log out?')) {
      localStorage.clear();
      navigate('/');
      toast.success('Logged out successfully!', { autoClose: 2000 });
    }
  };

  return (
    <MobileSidebarStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <div className="sidebar__nav-links">
        {navLinks.map((navLink) => {
          return (
            <div
              key={navLink.id}
              className={`sidebar__nav-link ${
                location.pathname.includes(navLink.id) ? 'sidebar__nav-link--active' : ''
              }`}
              onClick={() => {
                navigate(navLink.path);
                closeMobileSidebar();
              }}
            >
              <div className="sidebar__nav-link-icons">
                <navLink.icon
                  style={{ width: '20px !important', height: '20px !important' }}
                  className="sidebar__nav-link-icon"
                />
                <navLink.hoverIcon className="sidebar__nav-link-hovered-icon" />
              </div>
              <p className="sidebar__nav-link-name">{t(`${navLink.name}`)}</p>

              {/* <navLink.icon className="sidebar__nav-link-icon" />
              <navLink.hoverIcon className="sidebar__nav-link-hovered-icon" />
              {t(navLink.name)} */}
            </div>
          );
        })}
      </div>

      <div className="sidebar__logout-link-container">
        <div className="sidebar__logout-link" onClick={onLogoutClick}>
          <LogoutIcon />
          {t(`${leftSidebarTranslationsPath}.logoutText`)}
        </div>
      </div>
    </MobileSidebarStyled>
  );
};

const MobileSidebarStyled = styled.div<{ isDirectionRtl: boolean }>`
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .sidebar__nav-links {
    display: grid;
    row-gap: 8px;
    column-gap: 12px;
  }

  .sidebar__nav-link,
  .sidebar__logout-link {
    display: grid;
    grid-template-columns: 24px 1fr;
    column-gap: 8px;
    cursor: pointer;
    color: var(--app-primary-color);
    padding: 12px 16px;
    text-decoration: none;
    border-radius: 10px;
    font-size: 13.5px;
    line-height: 19px;
    background: #f8f8f8;
    transition: all var(--button-transition-timing) ease;
  }

  .sidebar__nav-link {
    position: relative;
    grid-template-columns: 20px 1fr;
    padding: 12px 16px 12px 16px;
  }

  .sidebar__nav-link--active {
    background-color: var(--app-primary-color);
    color: white;
  }

  .sidebar__nav-link svg {
    position: absolute;
    align-self: center;
    transition: all var(--button-transition-timing) ease;
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

  .sidebar__nav-link-icons {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .sidebar__logout-link-container {
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
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
`;

interface LayoutProps {
  children?: React.ReactNode;
}
const Layout = (props: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { children } = props;

  const [rightSidebarState, rightSidebarDispatch] = useContext(RightSidebarContext);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  const openMobileSidebar = () => {
    setMobileSidebarVisible(true);
  };
  const closeMobileSidebar = () => {
    setMobileSidebarVisible(false);
  };

  return (
    <LayoutStyled>
      <Header openMobileSidebar={openMobileSidebar} />

      <Sidebar visible={mobileSidebarVisible} onHide={closeMobileSidebar}>
        <MobileSidebar closeMobileSidebar={closeMobileSidebar} />
      </Sidebar>
      {location.pathname === '/profile' && children}

      {location.pathname !== '/profile' && (
        <div className="app-content">
          <LeftSidebar />
          <main
            className={`app-content__content ${!rightSidebarState.showSidebar ? 'app-content__content--expanded' : ''}`}
          >
            {/* <div className="offline-container">
                <h2 className="offline-heading">{t(`mainContent.networkErrorText`)}</h2>
                <p className="offline-message">{t(`mainContent.networkErrorMessage`)}</p>
              </div> */}
            {children}
          </main>
          <RightSidebar />
        </div>
      )}
    </LayoutStyled>
  );
};

const LayoutStyled = styled.div`
  opacity: 0;
  animation: fadeIn 0.5s linear 2.5s forwards;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  .app-content {
    display: flex;
    justify-content: space-between;
    min-height: calc(100vh - 54px);
    background-color: var(--content-background-color);
    position: relative;
  }

  .app-content__content {
    width: 100%;
    padding-left: 260px;
    background-color: var(--content-background-color);
    border-right: 1px solid var(--global-border-color);
    position: relative;
  }
  .app-content__content--expanded {
    width: calc(100vw - 30px) !important;
  }

  .offline-container {
    z-index: 3;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    height: 100%;
    width: calc(100vw - 270px);
    background-color: rgba(0, 0, 0, 0.7);
  }

  .offline-heading {
    font-weight: bold;
    font-size: 24px;
    margin: 0;
    margin-top: 24px;
    color: white;
  }

  .offline-message {
    color: white;
  }

  @media screen and (min-width: 851px) {
    .app-content__content {
      width: calc(100vw - 295px);
    }
  }

  @media screen and (min-width: 1000px) {
    .app-content__content {
      width: calc(100vw - 310px);
    }
  }

  @media screen and (min-width: 1200px) {
    .app-content__content {
      width: calc(100vw - 320px);
    }
  }

  @media screen and (min-width: 1400px) {
    .app-content__content {
      width: calc(100vw - 450px);
    }
  }

  @media screen and (max-width: 1000px) {
    .app-content__content {
      padding-left: 240px;
    }

    .offline-container {
      width: calc(100vw - 250px);
    }
  }

  @media screen and (851px <= width <= 999px) {
    .app-content__content {
      width: calc(100vw - 295px);
    }
  }

  @media screen and (max-width: 850px) {
    .app-content {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      min-height: calc(100vh - 75px);
    }

    .app-content__content {
      padding-top: 0;
      padding-left: 0;
      width: 100% !important;
      position: unset;
    }

    .offline-container {
      width: 100%;
      height: 100%;
    }
  }

  @media screen and (max-width: 850px) {
    .app-content {
      min-height: calc(100vh - 96px);
    }
  }
`;

export default Layout;
