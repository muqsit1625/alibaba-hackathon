//@ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import OneSignal from 'react-onesignal';
import mapboxgl from 'mapbox-gl';
import { toast } from 'react-toastify';

import './App.css';

import { isJwtTokenExpired } from 'utils';
import { Logo, LogoTheme, NLCLogo } from 'global/image';
import { configVars } from 'global/variables';

import RightSidebarProvider from 'components/contexts/RightSidebarProvider/RightSidebarProvider';

import { authSelector, setToken } from 'redux/auth/authSlice';

import { defaultRoutes } from './routes';

import { setMultiple, setNotifications } from 'redux/notification/notificationSlice';

import { SignIn } from 'pages';

import Layout from 'components/Layout/Layout';
import Spinner from 'components/Shared/Spinner';
import LanguageSelector from 'components/Shared/LanguageSelector/LanguageSelector';
import { Detector } from 'react-detect-offline';
import { Toast } from 'react-bootstrap';
import moment from 'moment';
// import { Detector } from 'react-detect-offline';

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [timePassedSinceLastOnline, setTimePassedSinceLastOnline] = useState(null);
  const [passedValue, setPassedValue] = useState(null);
  const [transitionStarted, setTransitionStarted] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setTimeout(() => {
        if (isOnline) {
          return;
        }
        setTimePassedSinceLastOnline(Date.now());
        setShowToast(true);
      }, 3000);

      // setTimeout(() => setShowToast(false), 8000);
    } else {
      setTimeout(() => {
        setShowToast(false);
        setTimePassedSinceLastOnline(null);
      }, 3000);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!timePassedSinceLastOnline) {
      setPassedValue('a few seconds ago');
      return;
    }

    const intervalId = setInterval(() => {
      let time = moment(timePassedSinceLastOnline).fromNow();
      setPassedValue(time);
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timePassedSinceLastOnline]);

  useEffect(() => {
    setTimeout(() => {
      setTransitionStarted(true);
    }, 100);
  }, []);

  useEffect(() => {
    let sessionNotifications = sessionStorage.getItem('autilent-notifications');

    if (sessionNotifications) {
      sessionNotifications = JSON.parse(sessionNotifications);

      dispatch(setMultiple({ notifications: sessionNotifications }));
    }
  }, [dispatch]);

  useEffect(() => {
    setTimeout(() => {
      setTransitionStarted(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const userStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    console.log('manager id is', userStorage?.user?.manager_id);
    const token = userStorage?.token;

    if (token && isJwtTokenExpired(token)) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const userStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

    if (userStorage) {
      OneSignal.init({
        appId: configVars.oneSignalAppId,
        // appId: '141dae00-ef16-4437-80db-09fa4e7e5687',  localapi

        allowLocalhostAsSecureOrigin: true,
        notifyButton: true,
      })
        .then(() => {
          const managerId = userStorage?.user?.manager_id;

          OneSignal.getSubscription((isSubscribed) => {
            console.log('the item', isSubscribed);
            if (isSubscribed) {
              if (managerId) {
                OneSignal.setExternalUserId(managerId);
              }
            }
          });

          OneSignal.on('subscriptionChange', function (isSubscribed) {
            console.log("The user's subscription state is now:", isSubscribed);
            if (isSubscribed) {
              if (managerId) {
                OneSignal.setExternalUserId(managerId);
              }
            } else {
              OneSignal.removeExternalUserId();
            }
          });
        })
        .catch((error) => {
          console.log('%cOneSignal init error:', 'background-color:red;color:white;', error);
        });

      OneSignal.showSlidedownPrompt();

      if (location.pathname === '/') {
        return navigate('/overview');
      }
    }
  }, [location.pathname, navigate]);

  const userStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  return (
    <AppStyled>
      {/* <Detector
        render={({ online }) => {
          <>
            {online
              ? null
              : toast.error('No Internet Connection', { autoClose: 5000, position: 'top-right', toastId: 'e-1' })}
          </>;
        }}
      /> */}

      <Toast
        style={{
          position: 'fixed',
          bottom: '30px',
          zIndex: 1000,
          background: 'white',
          color: 'var(--app-primary-color)',
          left: '50%',
          right: '50%',
          transform: 'translate(-50%, 0)',
        }}
        show={showToast}
        onClose={() => setShowToast(false)}
      >
        <Toast.Header closeButton={false} style={{ background: 'var(--error-hover-color)', color: 'white' }}>
          <strong className="me-auto">No Internet Connection</strong>
          <small>{passedValue || '-'}</small>
        </Toast.Header>
        <Toast.Body style={{ color: 'var(--error-hover-color)' }}>Trying to Reconnect ....</Toast.Body>
      </Toast>

      <LanguageSelector />

      <CSSTransition in={transitionStarted} timeout={5500} classNames="app__logo-transition" unmountOnExit>
        <>
          <div className="app__loading-screen">
            <div className="app__logo-container">
              <LogoTheme className="app__logo" />
            </div>

            <Spinner />
            {/* <img className="nlc_logo_container" src={NLCLogo} alt="nlc" /> */}
          </div>
        </>
      </CSSTransition>

      {!userStorage && <SignIn />}
      {userStorage && (
        <RightSidebarProvider>
          <Layout>
            <Routes>
              {defaultRoutes.map((route) => {
                if (route.info === 'private') {
                  return <Route key={route.name} path={route.layout + route.path} element={<route.element />} />;
                }
              })}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </Layout>
        </RightSidebarProvider>
      )}
    </AppStyled>
  );
}

const AppStyled = styled.div`
  .app__loading-screen {
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    z-index: 9999;
    background-color: white;
  }

  .nlc_logo_container {
    height: 105px;
    width: 250px;
    margin-top: 15vh;
  }

  .app__logo-transition-enter {
    opacity: 0;
  }
  .app__logo-transition-enter-active {
    opacity: 1;
    transition: all 1.5s ease;
  }
  .app__logo-transition-exit {
    opacity: 1;
  }
  .app__logo-transition-exit-active {
    opacity: 0;
    transition: all 0.5s ease;
  }

  .app__logo-container {
    height: 250px;
    width: 250px;
  }

  .app__logo {
    height: 100%;
    width: 100%;
  }
`;

export default App;
