import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import styled from 'styled-components';
import Map, { FullscreenControl, Layer, NavigationControl, Source } from 'react-map-gl';

import { Accordion, AccordionTab } from 'primereact/accordion';

import { convertToSecondsToHourMinutes, geoJSONCoordinatesLengthToZoomLevel } from 'global/utils';

import totalSessions from './totalSessionsMockData';

import { SessionBodyProps, SessionHeaderProps, SessionType, TotalSessionsProps } from './types';
import { driverReportTranslationsPath } from 'global/variables';

const SessionHeader = (props: SessionHeaderProps) => {
  const { t } = useTranslation();

  const {
    startedAt = t(`${driverReportTranslationsPath}.reportData.startedAt`),
    endedAt = t(`${driverReportTranslationsPath}.reportData.startedAt`),
  } = props;

  return (
    <SessionHeaderStyled>
      <div className="session-header__session-details">
        <div className="session-header__session-detail-container">
          <p>{startedAt !== 'Start Time' ? moment(startedAt).format('DD-MMM-YYYY') : startedAt}</p>
          <p>{startedAt !== 'Start Time' ? moment(startedAt).format('hh:mm A') : startedAt}</p>
        </div>

        <div className="session-header__session-detail-container">
          <p>{endedAt !== 'End Time' ? moment(endedAt).format('DD-MMM-YYYY') : endedAt}</p>
          <p>{endedAt !== 'End Time' ? moment(endedAt).format('hh:mm A') : endedAt}</p>
        </div>
      </div>
    </SessionHeaderStyled>
  );
};
const SessionHeaderStyled = styled.header`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 20px;
  font-family: 'Poppins', sans-serif;

  p {
    margin: 0;
  }

  .session-header__session-title {
    font-size: 20px;
  }

  .session-header__session-details {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 12px;
    column-gap: 40px;
  }

  .session-header__session-date-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    column-gap: 24px;
    row-gap: 12px;
  }

  .session-header__session-time-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    column-gap: 24px;
    row-gap: 12px;
    width: 180px;
  }

  .session-header__session-detail-container {
    display: grid;
    place-items: center;
    grid-template-rows: auto auto;
    row-gap: 4px;
    font-size: 12px;
  }
  .session-header__session-detail-container p:nth-of-type(1) {
    align-self: flex-start;
  }

  @media screen and (max-width: 500px) {
    .session-header__session-details {
      column-gap: 20px;
    }
  }
`;

const SessionBody = (props: SessionBodyProps) => {
  const { t } = useTranslation();

  const {
    sessionID,
    geoJSONData,
    startedAt,
    endedAt,
    idleTime,
    travelTime,
    totalTime,
    distanceDriven,
    averageSpeed,
    maxSpeed,
    distractedEvents,
    drowsyEvents,
    overSpeeding,
    hardAcceleration,
    harshBrakes,
    sharpTurns,
  } = props.sessionBodyData;

  const timingDetails = {
    startedAt: startedAt ? moment(startedAt).format('DD-MMM-YYYY | hh:mm A') : '-',
    endedAt: endedAt ? moment(endedAt).format('DD-MMM-YYYY | hh:mm A') : '-',
    idleTime,
    travelTime,
    totalTime,
  };
  const vehicleDetails = {
    distanceDriven,
    maxSpeed,
    averageSpeed,
  };
  const eventsDetails = {
    distractedEvents,
    drowsyEvents,
    overSpeeding,
    hardAcceleration,
    harshBrakes,
    sharpTurns,
  };

  const numberOfPoints = geoJSONData.geoJSONDataObject.features[0].geometry.coordinates.length - 1;
  const mapRef: any = useRef(null);

  const onMapLoaded = () => {
    function updateCanvasImage() {
      const mapImage = mapRef.current.getCanvas().toDataURL();

      props.setMapRouteImages((prev) => ({
        ...prev,
        [sessionID]: mapImage,
      }));
    }

    mapRef.current.on('moveend', updateCanvasImage);
    mapRef.current.on('zoomend', updateCanvasImage);

    if (!props.mapRouteImages[sessionID]) {
      const mapImage = mapRef.current.getCanvas().toDataURL();
      props.setMapRouteImages((prev) => ({
        ...prev,
        [sessionID]: mapImage,
      }));
    }
  };

  const onMapClick = () => {
    console.log('%cclickedMap geoJSONData:', 'background-color:aqua', geoJSONData);
  };

  return (
    <SessionBodyStyled>
      <div className="session-body__map-journey-container">
        <div className="session-body__map-container">
          <Map
            onLoad={onMapLoaded}
            onClick={onMapClick}
            ref={mapRef}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            preserveDrawingBuffer={true}
            initialViewState={{
              longitude:
                geoJSONData.layerProps.type === 'line'
                  ? geoJSONData.geoJSONDataObject.features[0].geometry.coordinates[Math.trunc(numberOfPoints / 2)][0]
                  : geoJSONData.geoJSONDataObject.features[0].geometry.coordinates[0],
              latitude:
                geoJSONData.layerProps.type === 'line'
                  ? geoJSONData.geoJSONDataObject.features[0].geometry.coordinates[Math.trunc(numberOfPoints / 2)][1]
                  : geoJSONData.geoJSONDataObject.features[0].geometry.coordinates[1],
              zoom:
                geoJSONData.layerProps.type === 'line'
                  ? geoJSONCoordinatesLengthToZoomLevel(
                      geoJSONData.geoJSONDataObject.features[0].geometry.coordinates.length,
                    )
                  : 14,
            }}
          >
            <FullscreenControl />
            <NavigationControl visualizePitch={true} />
            <Source id="route" type="geojson" data={geoJSONData.geoJSONDataObject}>
              <Layer {...geoJSONData.layerProps} />
            </Source>
          </Map>
        </div>
      </div>

      <div className="session-body__details-section">
        <section className="session-body__details-container">
          <h1 className="session-body__details-heading">
            {t(`${driverReportTranslationsPath}.reportData.timeHeading`)}
          </h1>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.startedAt`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{timingDetails.startedAt}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.endedAt`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{timingDetails.endedAt}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.totalTime`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{timingDetails.totalTime}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.travelTime`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{timingDetails.travelTime}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.idleTime`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{timingDetails.idleTime}</p>
          </div>
        </section>

        <section className="session-body__details-container">
          <h1 className="session-body__details-heading">
            {t(`${driverReportTranslationsPath}.reportData.eventsHeading`)}
          </h1>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.distractedEvents`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.distractedEvents}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.drowsyEvents`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.drowsyEvents}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.overSpeeding`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.overSpeeding}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.hardAcceleration`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.hardAcceleration}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.harshBrakes`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.harshBrakes}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.sharpTurns`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{eventsDetails.sharpTurns}</p>
          </div>
        </section>

        <section className="session-body__details-container">
          <h1 className="session-body__details-heading">
            {t(`${driverReportTranslationsPath}.reportData.vehicleHeading`)}
          </h1>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.distanceDriven`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{vehicleDetails.distanceDriven}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.maxSpeed`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{vehicleDetails.maxSpeed}</p>
          </div>

          <div className="session-body__detail">
            <p className="session-body__detail-title">
              {t(`${driverReportTranslationsPath}.reportData.averageSpeed`)}:&nbsp;
            </p>
            <p className="session-body__detail-value">{vehicleDetails.averageSpeed}</p>
          </div>
        </section>
      </div>
    </SessionBodyStyled>
  );
};
const SessionBodyStyled = styled.main`
  display: grid;
  row-gap: 20px;
  font-family: 'Poppins', sans-serif;

  p {
    margin: 0;
  }

  .session-body__map-journey-container {
    display: flex;
    column-gap: 20px;
    border-bottom: 1px solid #646464;
    padding-bottom: 20px;
  }

  .session-body__map-container {
    background-color: silver;
    min-height: 230px;
    width: 100%;
  }

  .session-body__details-section {
    display: flex;
    flex-wrap: wrap;
    column-gap: 80px;
    row-gap: 20px;
  }

  .session-body__details-container {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
  }

  .session-body__details-heading {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  .session-body__detail {
    display: flex;
    font-size: 12px;
  }

  .session-body__detail-title {
    font-weight: 600;
  }

  .session-body__detail-value {
    direction: ltr;
  }
`;

export default function TotalSessions(props: TotalSessionsProps) {
  const { reportBySessionData, geoJSONData, setMapRouteImages, mapRouteImages } = props;

  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalSessions: SessionType[] = reportBySessionData.map((session: any) => {
    return {
      sessionID: session.session_id,
      geoJSONData: geoJSONData[session.session_id],
      startedAt: session?.start_time || '-',
      endedAt: session?.end_time || '-',
      totalTime: [undefined, null].includes(session?.total_time)
        ? '-'
        : convertToSecondsToHourMinutes(session?.total_time),
      travelTime: [undefined, null].includes(session?.travel_time)
        ? '-'
        : convertToSecondsToHourMinutes(session?.travel_time),
      idleTime: [undefined, null].includes(session?.total_idle_time)
        ? '-'
        : convertToSecondsToHourMinutes(session?.total_idle_time),
      distanceDriven: [undefined, null].includes(session?.total_distance)
        ? '-'
        : `${session?.total_distance.toFixed(2)} KM`,
      averageSpeed: [undefined, null].includes(session?.avg_speed) ? '-' : `${session?.avg_speed.toFixed(2)} km/h`,
      maxSpeed: [undefined, null].includes(session?.max_speed) ? '-' : `${session?.max_speed.toFixed(2)} km/h`,
      totalEvents: session?.total_events ?? '-',
      distractedEvents: session?.distracted_count ?? '-',
      drowsyEvents: session?.drowsy_count ?? '-',
      overSpeeding: '-',
      hardAcceleration: '-',
      harshBrakes: '-',
      sharpTurns: '-',
    };
  });

  return (
    <TotalSessionsStyled>
      <div className="total-sessions">
        <div className="total-sessions__headings">
          <p>{t(`${driverReportTranslationsPath}.reportData.startedAt`)}</p>
          <p>{t(`${driverReportTranslationsPath}.reportData.endedAt`)}</p>
        </div>
        <div className="total-sessions__empty-div"></div>
      </div>
      <AccordionStyled activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {totalSessions.map((session: SessionType) => {
          return (
            <AccordionTab
              key={session.sessionID}
              header={<SessionHeader startedAt={session.startedAt} endedAt={session.endedAt} />}
            >
              <SessionBody
                sessionBodyData={{
                  sessionID: session.sessionID,
                  geoJSONData: session.geoJSONData,
                  startedAt: session.startedAt,
                  endedAt: session.endedAt,
                  idleTime: session.idleTime,
                  travelTime: session.travelTime,
                  totalTime: session.totalTime,
                  distanceDriven: session.distanceDriven,
                  averageSpeed: session.averageSpeed,
                  maxSpeed: session.maxSpeed,
                  driverName: session.driverName,
                  distractedEvents: session.distractedEvents,
                  drowsyEvents: session.drowsyEvents,
                  overSpeeding: session.overSpeeding,
                  hardAcceleration: session.hardAcceleration,
                  harshBrakes: session.harshBrakes,
                  sharpTurns: session.sharpTurns,
                }}
                mapRouteImages={mapRouteImages}
                setMapRouteImages={setMapRouteImages}
              />
            </AccordionTab>
          );
        })}
      </AccordionStyled>
    </TotalSessionsStyled>
  );
}

const TotalSessionsStyled = styled.div`
  width: 100%;
  max-width: 850px;
  font-family: 'Poppins', sans-serif;

  .total-sessions {
    display: flex;
    padding: 0 20px;
  }

  .p-accordion .p-accordion-tab .p-accordion-header .p-accordion-header-link {
    flex-direction: row-reverse;
  }

  .p-accordion-header .pi-chevron-right {
    transform: rotate(90deg);
  }
  .p-accordion-header .pi-chevron-down {
    transform: rotate(180deg);
  }

  .total-sessions__empty-div {
    height: 16px;
    width: 16px;
  }

  .total-sessions__headings {
    display: flex;
    justify-content: center;
    flex: 1;
    padding: 0 20px;
    column-gap: 40px;
    font-size: 12px;
  }

  @media screen and (max-width: 500px) {
    .total-sessions {
      padding: 0px;
    }

    .p-accordion .p-accordion-header .p-accordion-header-link {
      padding: 1.25rem 0;
    }
  }
`;

const AccordionStyled = styled(Accordion)`
  .p-accordion-header-text {
    flex: 1;
  }
`;
