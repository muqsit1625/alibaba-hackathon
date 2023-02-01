//@ts-nocheck
import { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
// import { Offline, Online } from 'react-detect-offline';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import OneSignal from 'react-onesignal';

import { getDateByTimeZone, getLastSeenTime } from 'global/utils';

import { rightSidebarTranslationsPath } from 'global/variables';

import { RightSidebarContext } from 'components/contexts/RightSidebarProvider/RightSidebarProvider';
import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { notificationSelector, setNotifications } from 'redux/notification/notificationSlice';
import { useLazyGetSingleDriverByIdQuery } from 'redux/endpoints/drivers';

import DriverAndVehicleDetails from './DriverAndVehicleDetails/DriverAndVehicleDetails';
import NotificationCard from './NotificationCard/NotificationCard';

import NotificationIcon from 'assets/icons/notification-icon.svg';
import ExpandIcon from 'assets/icons/expand-icon.svg';
import DriverVehicleDetailsIcon from 'assets/icons/driver-vehicle-details-icon.svg';

const RightSidebar = () => {
  const storeDispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState] = useStateValue();

  const [rightSidebarState, rightSidebarDispatch] = useContext(RightSidebarContext);

  const notificationSlice = useSelector(notificationSelector);

  const [getSingleDriver, getSingleDriverByIdQueryState] = useLazyGetSingleDriverByIdQuery();
  console.log(
    '%cgetSingleDriverByIdQueryState:',
    'background-color:darkslateblue;color:white;',
    getSingleDriverByIdQueryState,
  );

  useEffect(() => {
    const anomalyTypeToNotificationTitle = {
      drowsy_anomaly: t(`${rightSidebarTranslationsPath}.notificationCard.drowsyDriverHeading`),
      distracted_anomaly: t(`${rightSidebarTranslationsPath}.notificationCard.distractedDriverHeading`),
      unauthorized_anomaly: t(`${rightSidebarTranslationsPath}.notificationCard.unauthorizedDriverHeading`),
      Distracted: t(`${rightSidebarTranslationsPath}.notificationCard.distractedDriverHeading`),
      Drowsy: t(`${rightSidebarTranslationsPath}.notificationCard.drowsyDriverHeading`),
      Unauthorized: t(`${rightSidebarTranslationsPath}.notificationCard.unauthorizedDriverHeading`),
    };
    const anomalyTypeToNotificationType = {
      drowsy_anomaly: 'error',
      distracted_anomaly: 'error',
      unauthorized_anomaly: 'warn',
      Distracted: 'error',
      Drowsy: 'error',
      Unauthorized: 'warn',
    };

    OneSignal.on('notificationDisplay', async function (event) {
      console.log('%cNotification Event:', 'background-color:brown;color:white;', event);

      const eventData = event?.data;

      console.log('eventData', eventData);

      if (eventData) {
        let driverName = '-';
        if (eventData?.driver_id && eventData?.driver_id !== '-') {
          try {
            const getSingleDriverReponse = await getSingleDriver(eventData.driver_id);

            driverName = getSingleDriverReponse?.data?.result
              ? `${getSingleDriverReponse.data.result?.driver_first_name || ''} ${
                  getSingleDriverReponse.data.result?.driver_last_name || ''
                }`
              : '-';
          } catch (error) {
            console.log('%cgetSingleDriver error:', 'background-color:red;color:white;', error);
          }
        }

        const notificationObj = {
          notificationType: anomalyTypeToNotificationType[eventData.anomaly_type] || '-',
          notificationTime: eventData.timestamp,
          notificationTitle: anomalyTypeToNotificationTitle[eventData.anomaly_type] || 'Notification',
          vehiclePlateNo: eventData.vehicle_plate_no,
          driverName,
          location: eventData?.location?.name ? eventData.location.name : '-',
        };
        console.log('rec', notificationObj);

        if (
          notificationObj.notificationTime === '' ||
          notificationObj.notificationTime === undefined ||
          notificationObj.notificationTime === null
        ) {
          return;
        }

        const sessionNotifications = sessionStorage.getItem('autilent-notifications');
        if (!sessionNotifications) {
          const _notifications = JSON.stringify([notificationObj]);
          sessionStorage.setItem('autilent-notifications', _notifications);
        } else {
          let _sessionNotifications = JSON.parse(sessionNotifications);
          _sessionNotifications.push(notificationObj);
          _sessionNotifications = JSON.stringify(_sessionNotifications);
          sessionStorage.setItem('autilent-notifications', _sessionNotifications);
        }

        storeDispatch(setNotifications(notificationObj));
        if (!rightSidebarState.showNotifications) {
          rightSidebarDispatch({ type: 'SET_SHOW_NOTIFICATIONS', payload: true });
        }
      }
    });
  }, [getSingleDriver, rightSidebarDispatch, rightSidebarState.showNotifications, storeDispatch, t]);

  const sortedNotificationsByTime = useMemo(() => {
    let notifications = notificationSlice.notifications.map((notification) => {
      return {
        ...notification,
        notificationTime: new Date(notification.notificationTime).getTime(),
      };
    });

    notifications.sort((a, b) => b.notificationTime - a.notificationTime);

    notifications = notifications.map((notification) => ({
      ...notification,
      notificationTime: getDateByTimeZone(notification.notificationTime),
    }));

    notifications = notifications.filter((el, index) => el.notificationTime !== 'Invalid date');

    /*Eliminating duplicate entries in notifications */

    let times = notifications.map((e) => e.notificationTime);
    let uniqueArray = notifications.filter((obj, index) => times.indexOf(obj.notificationTime) === index);

    return (notifications = uniqueArray);
  }, [notificationSlice.notifications]);

  const toggleSidebar = () => {
    rightSidebarDispatch({ type: 'SET_SHOW_SIDEBAR', payload: !rightSidebarState.showSidebar });
  };

  const toggleNotifications = () => {
    rightSidebarDispatch({ type: 'SET_SHOW_NOTIFICATIONS', payload: !rightSidebarState.showNotifications });
  };

  const toggleDriverVehicleDetails = () => {
    rightSidebarDispatch({
      type: 'SET_SHOW_DRIVER_AND_VEHICLE_DETAILS',
      payload: !rightSidebarState.showDriverAndVehicleDetails,
    });
  };

  return (
    <RightSidebarStyled isDirectionRtl={reducerState.isDirectionRtl} isSidebarVisible={rightSidebarState.showSidebar}>
      <div className={`right-sidebar ${!rightSidebarState.showSidebar ? 'right-sidebar--collapsed' : ''}`}>
        <div className="right-sidebar__toggle-container" onClick={() => toggleSidebar()}>
          {rightSidebarState.showSidebar && <i className="pi pi-angle-right"></i>}
          {!rightSidebarState.showSidebar && <i className="pi pi-angle-left"></i>}
        </div>
        {rightSidebarState.showSidebar && (
          <div className="right-sidebar__expandable" onClick={toggleNotifications}>
            <div className="right-sidebar__expandable-left">
              <img src={NotificationIcon} alt="Notifications" className="right-sidebar__expandable-left-icon" />
              <p className="right-sidebar__expandable-title">
                {t(`${rightSidebarTranslationsPath}.notificationsText`)}
              </p>
            </div>
            <div className="right-sidebar__expandable-right">
              <img
                src={ExpandIcon}
                alt="expand"
                className={`right-sidebar__notifications-expand-icon ${
                  rightSidebarState.showNotifications ? 'right-sidebar__notifications-expand-icon--rotated' : ''
                }`}
              />
            </div>
          </div>
        )}

        {rightSidebarState.showSidebar && (
          <CSSTransition
            in={rightSidebarState.showNotifications}
            timeout={250}
            classNames="right-sidebar__notification-transition"
            unmountOnExit
          >
            <>
              <div className="right-sidebar__notifications-container">
                {!sortedNotificationsByTime.length && (
                  <div className="right-sidebar__notifications-container-inner">
                    <i style={{ fontSize: '1.6em', color: '#9f9f9f' }} className="pi pi-bell"></i>
                    <p className="right-sidebar__notifications-text">
                      {t(`${rightSidebarTranslationsPath}.noNotificationsText`)}
                    </p>
                  </div>
                )}

                {sortedNotificationsByTime.length > 0 &&
                  sortedNotificationsByTime.map((notification, index) => {
                    return <NotificationCard key={index} {...notification} />;
                  })}
              </div>
            </>
          </CSSTransition>
        )}

        {rightSidebarState.showSidebar && (
          <div className="right-sidebar__expandable" onClick={toggleDriverVehicleDetails}>
            <div className="right-sidebar__expandable-left">
              <img
                src={DriverVehicleDetailsIcon}
                alt="Driver and Vehicle Details"
                className="right-sidebar__expandable-left-icon"
              />
              <p className="right-sidebar__expandable-title">
                {t(`${rightSidebarTranslationsPath}.driverAndVehicleDetailsText`)}
              </p>
            </div>
            <div className="right-sidebar__expandable-right">
              <img
                src={ExpandIcon}
                alt="expand"
                className={`right-sidebar__driver-vehicle-details-expand-icon ${
                  rightSidebarState.showDriverAndVehicleDetails
                    ? 'right-sidebar__driver-vehicle-details-expand-icon--rotated'
                    : ''
                }`}
              />
            </div>
          </div>
        )}

        {rightSidebarState.showSidebar && (
          <CSSTransition
            in={rightSidebarState.showDriverAndVehicleDetails}
            timeout={250}
            classNames="right-sidebar__driver-vehicle-details-transition"
            unmountOnExit
          >
            <div className="right-sidebar__driver-vehicle-details-main-container">
              <div className="right-sidebar__driver-vehicle-details-container">
                {/* <Offline>{t(`mainContent.networkErrorText`)}</Offline> */}

                <DriverAndVehicleDetails />
              </div>
            </div>
          </CSSTransition>
        )}
      </div>
    </RightSidebarStyled>
  );
};

const RightSidebarStyled = styled.aside<{ isDirectionRtl: boolean }>`
  p {
    margin: 0;
  }

  .right-sidebar {
    width: 300px;
    background-color: #f9fcff;
    height: 100%;
    padding-top: 54px;
    position: fixed;
    top: 0;
    right: 0;
    overflow-y: scroll;

    direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};
  }

  .right-sidebar--collapsed {
    width: 30px !important;
  }

  .right-sidebar__toggle-container {
    position: absolute;
    top: 54px;
    z-index: 1;
    padding: 36px 0;
    width: max-content;
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: white;
    border: 1px solid silver;
    cursor: pointer;
    left: ${(props) => (props.isDirectionRtl ? '0' : 'unset')};
    // border-radius: ${(props) => (props.isSidebarVisible ? '0 8px 8px 0' : '8px 0 0 8px')};
  }

  .right-sidebar__toggle-container .pi-angle-right,
  .right-sidebar__toggle-container .pi-angle-left {
    font-size: 16px;
    color: silver;
  }

  .right-sidebar__toggle-container:hover .pi-angle-right,
  .right-sidebar__toggle-container:hover .pi-angle-left {
    color: var(--app-primary-color);
  }

  .right-sidebar__expandable {
    background-color: white;
    display: flex;
    justify-content: space-between;
    padding: 10px 18px 10px 38px;
    cursor: pointer;
    border-radius: 0 0 6px 6px;
  }

  .right-sidebar__expandable-left {
    display: flex;
    column-gap: 8px;
    align-items: center;
  }

  .right-sidebar__expandable-title {
    color: var(--primary-color);
    font-size: 12px;
  }

  .right-sidebar__expandable-left-icon {
    height: 14px;
    width: 14px;
  }

  .right-sidebar__notifications-container {
    padding-left: 30px;
    padding-right: 8px;
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 10px;
    min-height: 35vh;
    max-height: 35vh;
    overflow-y: scroll;
  }

  .right-sidebar__notifications-container-inner {
    background: white;
    border-radius: 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    align-items: center;
    height: 30vh;
    margin-top: 5px;
  }

  .right-sidebar__notifications-text {
    font-size: 10px;
    color: var(--text-color);
  }

  .right-sidebar__notification-transition-enter {
    max-height: 0;
    min-height: 0;
  }
  .right-sidebar__notification-transition-enter-active {
    max-height: 35vh;
    min-height: 35vh;
    transition: all 0.25s ease;
  }
  .right-sidebar__notification-transition-exit {
    max-height: 35vh;
    min-height: 35vh;
  }
  .right-sidebar__notification-transition-exit-active {
    max-height: 0;
    min-height: 0;
    transition: all 0.25s ease;
  }

  right-sidebar__driver-vehicle-details-main-container {
    max-height: 40vh;
  }

  .right-sidebar__driver-vehicle-details-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 22px;
  }

  .right-sidebar__driver-vehicle-details-transition-enter {
    max-height: 0;
    overflow: hidden;
  }
  .right-sidebar__driver-vehicle-details-transition-enter-active {
    max-height: 500px;
    transition: all 0.25s ease;
  }
  .right-sidebar__driver-vehicle-details-transition-exit {
    max-height: 500px;
  }
  .right-sidebar__driver-vehicle-details-transition-exit-active {
    max-height: 0;
    overflow: hidden;
    transition: all 0.25s ease;
  }

  .right-sidebar__notifications-expand-icon--rotated {
    transform: rotate(180deg);
  }

  .right-sidebar__driver-vehicle-details-expand-icon--rotated {
    transform: rotate(180deg);
  }

  @media screen and (min-width: 1000px) {
    .right-sidebar__notifications-container {
      padding-left: 30px;
      padding-right: 20px;
    }
  }

  @media screen and (min-width: 1200px) {
    .right-sidebar {
      width: 320px;
    }
  }

  @media screen and (min-width: 1400px) {
    .right-sidebar {
      width: 450px;
    }

    .right-sidebar__expandable-title {
      font-size: 14px;
    }

    .right-sidebar__no-notifications-text {
      font-size: 10px;
    }
  }

  @media screen and (851px <= width <= 999px) {
    .right-sidebar {
      width: 285px;
    }

    .right-sidebar__driver-vehicle-details-container {
      padding: 20px 16px;
    }
  }

  @media screen and (max-width: 850px) {
    .right-sidebar {
      width: 100% !important;
      height: auto;
      padding-top: 0;
      position: relative;
      overflow: auto;
      padding-top: 40px;
    }

    .right-sidebar__toggle-container {
      width: 100% !important;
      position: relative;
      top: unset;
      padding: 8px;
      border-radius: 0;
    }

    .right-sidebar__toggle-container .pi-angle-right {
      transform: rotate(-90deg);
    }

    .right-sidebar__toggle-container .pi-angle-left {
      transform: rotate(-90deg);
    }

    .right-sidebar__expandable {
      padding: 18px;
    }
  }
`;

export default RightSidebar;
