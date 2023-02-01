import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { fetchToken } from 'global/apiRoute';
import { LogoMark, LogoTheme, LogoutIcon, OfflineWifiImg, OnlineWifiImg } from 'global/image';
import { leftSidebarTranslationsPath } from 'global/variables';

import navLinks from 'components/Sidebar/LeftSidebar/navLinks';

import { useSelector } from 'react-redux';
import { authSelector } from 'redux/auth/authSlice';

import { S3Image } from 'components/Shared/S3Image';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { useMediaQuery } from 'react-responsive';
import { Detector, Offline, Online } from 'react-detect-offline';

interface HeaderProps {
  openMobileSidebar: Function;
}
const Header = (props: HeaderProps) => {
  const { openMobileSidebar } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: '(max-width:500px)' });

  const onLogoutClick = () => {
    // window.location.reload();

    if (window.confirm('Log out?')) {
      localStorage.clear();
      navigate('/');
      toast.success('Logged out successfully!', { autoClose: 2000 });
    }
  };

  const items = navLinks
    .map((navLink) => {
      return {
        label: `${navLink.name}`,
        icon: location.pathname === navLink.path ? <navLink.hoverIcon /> : <navLink.icon />,
        command: () => navigate(navLink.path),
        className: `header__toggle-menuitem header__toggle-menuitem--${
          location.pathname === navLink.path ? 'active' : 'inactive'
        }`,
      };
    })
    .concat({
      label: t(`${leftSidebarTranslationsPath}.logoutText`),
      icon: <LogoutIcon />,
      command: () => onLogoutClick(),
      className: `header__toggle-menuitem header__toggle-menuitem-logout`,
    });

  const authSlice: any = useSelector(authSelector);
  const manager = authSlice?.user?.user || authSlice?.user;
  console.log('manager:', manager);

  const menuRef: any = useRef(null);

  const goToProfilePage = () => {
    navigate('/profile');
  };

  return (
    <HeaderStyled>
      {isMobile ? (
        <>
          <div className="header__menu-button-container">
            <Menu model={items} popup ref={menuRef} className="header__toggle-menu" />
            <Button
              className="header__toggle-menu-button"
              label=""
              icon="pi pi-bars"
              // onClick={(event) => menuRef.current.toggle(event)}
              onClick={() => openMobileSidebar()}
              aria-controls="popup_menu"
              aria-haspopup
            />
          </div>

          <div className="header__logo-container">
            <LogoTheme className="header__logo" onClick={() => navigate('/')} />
          </div>

          <div className="header__profile-container">
            <div className="header__profile" onClick={goToProfilePage}>
              <p className="header__profile-name">{`${manager?.first_name || 'John'} ${
                manager?.last_name || 'Doe'
              }`}</p>

              <S3Image
                url={manager?.image}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '100%',
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="header__logo-container">
            <LogoTheme className="header__logo" onClick={() => navigate('/')} />
          </div>

          <div className="header__profile-container">
            <div className="header__profile" onClick={goToProfilePage}>
              <p className="header__profile-name">{`${manager?.first_name || 'John'} ${
                manager?.last_name || 'Doe'
              }`}</p>

              <Offline>
                <S3Image
                  url={manager?.image}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '100%',
                  }}
                />
              </Offline>
              <Online>
                <S3Image
                  url={manager?.image}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '100%',
                  }}
                />
              </Online>
            </div>
            {/* <Offline>
              <i
                title="No Internet connection"
                className="pi pi-wifi"
                style={{ fontSize: '2em', color: '#f31919' }}
              ></i>
            </Offline>
            <Online>
              <i title="You are Connected" className="pi pi-wifi" style={{ fontSize: '2em', color: '#14ae5c' }}></i>
            </Online> */}

            <Menu model={items} popup ref={menuRef} className="header__toggle-menu" />
            <Button
              className="header__toggle-menu-button"
              label=""
              icon="pi pi-bars"
              // onClick={(event) => menuRef.current.toggle(event)}
              onClick={() => openMobileSidebar()}
              aria-controls="popup_menu"
              aria-haspopup
            />
          </div>
        </>
      )}
    </HeaderStyled>
  );
};

const HeaderStyled = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 8px 64px 8px 32px;
  background: #fff;
  margin-bottom: 0px;
  position: sticky;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f8f8f8;
  width: 100%;
  z-index: 100;
  column-gap: 20px;

  .header__logo-container {
    display: flex;
  }

  .header__logo {
    cursor: pointer;
    width: 150px;
    height: 37px;
  }

  .header__profile-container {
    display: flex;
    align-items: center;
    column-gap: 14px;
  }

  .header__profile {
    display: flex;
    align-items: center;
    column-gap: 18px;
    cursor: pointer;
  }

  .header__profile-name {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 15px;
    margin: 0;
    text-align: right;
  }

  .header__toggle-menu-button {
    display: none;
    background-color: var(--app-primary-color) !important;
  }

  @media screen and (max-width: 850px) {
    z-index: 102;
    padding: 16px 24px;

    .header__toggle-menu-button {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 0;
    }
  }

  @media screen and (max-width: 500px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    .header__logo-container {
      width: 100px;
      justify-self: center;
    }

    .header__profile-container {
      flex-direction: row-reverse;
      justify-content: space-between;
      width: 100%;
    }

    .header__profile {
      flex-direction: column-reverse;
      align-items: flex-end;
    }

    .header__profile img {
      margin-right: 0;
    }

    .header__profile-name {
      font-size: 12px;
      text-align: right;
    }
  }
`;

export default Header;
