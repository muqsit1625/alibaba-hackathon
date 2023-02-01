import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ErrorOutlineRed from 'assets/icons/error-outline-red.svg';
import ErrorOutlineYellow from 'assets/icons/error-outline-yellow.svg';
import Dot from 'assets/icons/dot.svg';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { NotificationCardProps } from './types';

const NotificationCard = (props: NotificationCardProps) => {
  const { notificationType, notificationTitle, notificationTime, vehiclePlateNo, driverName, location } = props;

  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <NotificationCardStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <div className={`notification-card ${notificationType ? `notification-card--${notificationType}` : ''}`}>
        <div className="notification-card__left">
          {notificationType === 'error' && (
            <img src={ErrorOutlineRed} alt="Error Outline Red" className="notification-card__left-icon" />
          )}
          {notificationType === 'warn' && (
            <img src={ErrorOutlineYellow} alt="Error Outline Yellow" className="notification-card__left-icon" />
          )}
        </div>

        <div className="notification-card__content">
          <div className="notification-card__notification-header">
            <p className="notification-card__notification-title">{notificationTitle}</p>
            <p className="notification-card__notification-time">{notificationTime}</p>
          </div>

          <div className="notification-card__vehicle-name-container">
            <p className="notification-card__vehicle-name-title">Vehicle:&nbsp;</p>
            <p className="notification-card__vehicle-name-value">{vehiclePlateNo}</p>
          </div>

          <div className="notification-card__driver-name-container">
            <p className="notification-card__driver-name-title">Driver Name:&nbsp;</p>
            <p className="notification-card__driver-name-value">{driverName}</p>
          </div>

          <div className="notification-card__location-container">
            <p className="notification-card__location-title">Location:&nbsp;</p>
            <p className="notification-card__location-value">{location}</p>
          </div>

          {/* <a href="/" className="notification-card__details-link">
            Click on the Notification for further details
          </a> */}
        </div>
      </div>
    </NotificationCardStyled>
  );
};

const NotificationCardStyled = styled.div<{ isDirectionRtl: boolean }>`
  .notification-card--error {
    --border-color: #f47878;
    --border-left-color: rgba(244, 120, 120, 0.4);
  }
  .notification-card--warn {
    --border-color: #fff786;
    --border-left-color: rgba(255, 247, 134, 0.4);
  }

  min-width: 215px;
  width: 100%;

  .notification-card {
    border-radius: 10px;
    min-height: 120px;
    background-color: white;
    border: 1px solid var(--border-color);
    display: grid;
    grid-template-columns: 40px auto;
  }

  .notification-card__left {
    border-left: ${(props) => (props.isDirectionRtl ? 'unset' : '6px solid var(--border-left-color)')};
    border-right: ${(props) => (props.isDirectionRtl ? '6px solid var(--border-left-color)' : 'unset')};
    border-radius: ${(props) => (props.isDirectionRtl ? '0 10px 10px 0' : '10px 0px 0px 10px')};
    display: flex;
    justify-content: center;
    padding-top: 10px;
  }

  .notification-card__left-icon {
    height: 16px;
    width: 16px;
  }

  .notification-card__content {
    display: grid;
    row-gap: 6px;
    padding: 10px 8px 10px 8px;
  }

  .notification-card__notification-header {
    display: grid;
  }
  .notification-card__notification-title {
    font-size: 9px;
    font-weight: bold;
  }
  .notification-card__notification-header-dot {
    height: 5px;
    width: 5px;
  }
  .notification-card__notification-time {
    font-size: 9px;
    direction: ltr;
    text-align: ${(props) => (props.isDirectionRtl ? 'right' : 'left')};
  }

  .notification-card__vehicle-name-container {
    display: flex;
    font-size: 12px;
  }
  .notification-card__vehicle-name-title {
  }
  .notification-card__vehicle-name-value {
    font-weight: bold;
  }

  .notification-card__driver-name-container {
    display: flex;
    font-size: 10px;
  }
  .notification-card__driver-name-title {
    color: #646464;
  }
  .notification-card__driver-name-value {
    font-weight: bold;
    color: #646464;
  }

  .notification-card__location-container {
    display: flex;
    font-size: 10px;
  }
  .notification-card__location-title {
    color: #646464;
  }
  .notification-card__location-value {
    font-weight: bold;
    color: #646464;
  }

  .notification-card__details-link {
    font-size: 9px;
    color: #646464;
  }
`;

export default NotificationCard;
