import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import styled from 'styled-components';
import Map, { FullscreenControl, Layer, NavigationControl, Source } from 'react-map-gl';

import { Accordion, AccordionTab } from 'primereact/accordion';

import { convertToSecondsToHourMinutes, geoJSONCoordinatesLengthToZoomLevel } from 'global/utils';
import { vehicleReportTranslationsPath } from 'global/variables';

import { SessionBodyProps, AccordionHeaderProps, SessionType, TotalSessionsProps, TripType } from './types';
import TripBody from './TripBody/TripBody';

// import totalSessions from './totalSessionsMockData';

const AccordionHeader = (props: AccordionHeaderProps) => {
  const {
    startedAt = 'Started At',
    endedAt = 'Ended At',
    startLocation = 'Start Location',
    endLocation = 'End Location',
  } = props;

  return (
    <AccordionHeaderStyled>
      <div className="accordion-header__session-details">
        <div className="accordion-header__session-detail-container">
          <p>{startedAt !== 'Started At' ? moment(startedAt).format('DD-MMM-YYYY') : startedAt}</p>
          <p>{startedAt !== 'Started At' ? moment(startedAt).format('hh:mm A') : startedAt}</p>
        </div>

        <div className="accordion-header__session-detail-container">
          <p>{endedAt !== 'Ended At' ? moment(endedAt).format('DD-MMM-YYYY') : endedAt}</p>
          <p>{endedAt !== 'Ended At' ? moment(endedAt).format('hh:mm A') : endedAt}</p>
        </div>

        <div className="accordion-header__session-detail-container">
          <p>{startLocation}</p>
          <p></p>
        </div>

        <div className="accordion-header__session-detail-container">
          <p>{endLocation}</p>
          <p></p>
        </div>
      </div>
    </AccordionHeaderStyled>
  );
};
const AccordionHeaderStyled = styled.header`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 20px;
  font-family: 'Poppins', sans-serif;

  p {
    margin: 0;
  }

  .accordion-header__session-details {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr;
    justify-content: space-between;
    padding: 0 12px;
    column-gap: 8px;
    font-size: 12px;
  }

  .accordion-header__session-detail-container {
    display: grid;
    place-items: center;
    row-gap: 4px;
  }
  .accordion-header__session-detail-container p:nth-of-type(1) {
    align-self: flex-start;
  }

  @media screen and (max-width: 500px) {
    .accordion-header__session-detail-container {
      font-size: 12px;
    }
  }
`;

const SessionBody = (props: SessionBodyProps) => {
  const {
    sessionID,
    geoJSONData,
    startedAt,
    endedAt,
    idleTime,
    travelTime,
    totalTime,
    distanceDriven,
    startLocation,
    endLocation,
    averageSpeed,
    maxSpeed,
    drivers,
    totalEvents,
    distractedEvents,
    drowsyEvents,
    overSpeeding,
    hardAcceleration,
    harshBrakes,
    sharpTurns,
  } = props.sessionBodyData;

  const { t } = useTranslation();

  const timingDetails: {
    [key: string]: any;
  } = {
    [`${t(`${vehicleReportTranslationsPath}.reportData.startedAt`)}`]: startedAt
      ? moment(startedAt).format('DD-MMM-YYYY | hh:mm A')
      : '-',
    [`${t(`${vehicleReportTranslationsPath}.reportData.endedAt`)}`]: endedAt
      ? moment(endedAt).format('DD-MMM-YYYY | hh:mm A')
      : '-',
    [`${t(`${vehicleReportTranslationsPath}.reportData.idleTime`)}`]: idleTime,
    [`${t(`${vehicleReportTranslationsPath}.reportData.travelTime`)}`]: travelTime,
    [`${t(`${vehicleReportTranslationsPath}.reportData.totalTime`)}`]: totalTime,
  };
  const vehicleDetails: {
    [key: string]: any;
  } = {
    [`${t(`${vehicleReportTranslationsPath}.reportData.distanceDriven`)}`]: distanceDriven,
    [`${t(`${vehicleReportTranslationsPath}.reportData.averageSpeed`)}`]: averageSpeed,
    [`${t(`${vehicleReportTranslationsPath}.reportData.maxSpeed`)}`]: maxSpeed,
    [`${t(`${vehicleReportTranslationsPath}.reportData.startLocation`)}`]: startLocation,
    [`${t(`${vehicleReportTranslationsPath}.reportData.endLocation`)}`]: endLocation,
  };
  const driverDetails: any = {
    drivers,
  };
  const eventsDetails: {
    [key: string]: any;
  } = {
    [`${t(`${vehicleReportTranslationsPath}.reportData.totalEvents`)}`]: totalEvents,
    [`${t(`${vehicleReportTranslationsPath}.reportData.distractedEvents`)}`]: distractedEvents,
    [`${t(`${vehicleReportTranslationsPath}.reportData.drowsyEvents`)}`]: drowsyEvents,
    [`${t(`${vehicleReportTranslationsPath}.reportData.overSpeeding`)}`]: overSpeeding,
    [`${t(`${vehicleReportTranslationsPath}.reportData.hardAcceleration`)}`]: hardAcceleration,
    [`${t(`${vehicleReportTranslationsPath}.reportData.harshBrakes`)}`]: harshBrakes,
    [`${t(`${vehicleReportTranslationsPath}.reportData.sharpTurns`)}`]: sharpTurns,
  };

  console.log('%cgeoJSONData:', 'background-color:yellow;', geoJSONData);

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
          {geoJSONData?.geoJSONDataObject?.features[0]?.geometry?.coordinates?.length === 0 ? (
            <p>No map data available</p>
          ) : (
            <Map
              onLoad={onMapLoaded}
              onClick={onMapClick}
              ref={mapRef}
              preserveDrawingBuffer={true}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              initialViewState={{
                bounds: geoJSONData.lngLatBounds || null,
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
          )}
        </div>
      </div>

      <div className="session-body__details-section">
        <section className="session-body__details-container">
          <h3 className="session-body__details-heading">
            {t(`${vehicleReportTranslationsPath}.reportData.timeHeading`)}
          </h3>

          {Object.keys(timingDetails).map((detailType) => {
            return (
              <div className="session-body__detail">
                <p className="session-body__detail-title">{detailType}:&nbsp;</p>
                <p className="session-body__detail-value">{timingDetails[detailType]}</p>
              </div>
            );
          })}
        </section>

        <section className="session-body__details-container">
          <h3 className="session-body__details-heading">
            {t(`${vehicleReportTranslationsPath}.reportData.vehicleHeading`)}
          </h3>

          {Object.keys(vehicleDetails).map((detailType) => {
            return (
              <div className="session-body__detail">
                <p className="session-body__detail-title">{detailType}:&nbsp;</p>
                <p className="session-body__detail-value">{vehicleDetails[detailType]}</p>
              </div>
            );
          })}
        </section>

        <section className="session-body__details-container">
          <h3 className="session-body__details-heading">
            {t(`${vehicleReportTranslationsPath}.reportData.driversHeading`)}
          </h3>

          <div className="session-body__detail">
            {driverDetails.drivers?.map((driver: any) => {
              return (
                <p className="session-body__detail-value">{`${driver?.driver_first_name || ''} ${
                  driver?.driver_last_name || ''
                }`}</p>
              );
            })}
          </div>
        </section>

        <section className="session-body__details-container">
          <div className="session-body__details-heading-container">
            <h3 className="session-body__details-heading">
              {t(`${vehicleReportTranslationsPath}.reportData.eventHeading`)}
            </h3>
          </div>

          {Object.keys(eventsDetails).map((detailType) => {
            return (
              <div className="session-body__detail">
                <p className="session-body__detail-title">{detailType}:&nbsp;</p>
                <p className="session-body__detail-value">{eventsDetails[detailType]}</p>
              </div>
            );
          })}
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
    flex-direction: column;
    gap: 20px;
    border-bottom: 1px solid #646464;
    padding-bottom: 20px;
  }

  .session-body__map-container {
    background-color: silver;
    min-height: 400px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .session-body__details-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .session-body__details-container {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
  }

  .session-body__details-heading-container {
    display: flex;
    justify-content: space-between;
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

  @media screen and (max-width: 500px) {
  }
`;

export default function TotalSessions(props: TotalSessionsProps) {
  const { tripsData, reportBySessionData, geoJSONData, tripGeoJSONData, setMapRouteImages, mapRouteImages } = props;

  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeIndex1, setActiveIndex1] = useState<number | null>(null);

  const validTripsData = Array.isArray(tripsData) === true ? tripsData : [];

  const totalTrips = validTripsData.map((trip: any, index: number) => {
    return {
      tripID: trip?.trip_id || index,
      geoJSONData: tripGeoJSONData[trip.trip_id],
      startedAt: trip?.start_time || '-',
      endedAt: trip?.end_time || '-',
      totalTime: [undefined, null].includes(trip?.total_time) ? '-' : convertToSecondsToHourMinutes(trip?.total_time),
      travelTime: [undefined, null].includes(trip?.travel_time)
        ? '-'
        : convertToSecondsToHourMinutes(trip?.travel_time),
      idleTime: [undefined, null].includes(trip?.total_idle_time)
        ? '-'
        : convertToSecondsToHourMinutes(trip?.total_idle_time),
      startLocation: trip?.start_location?.address || '-',
      endLocation: trip?.end_location?.address || '-',
      distanceDriven: [undefined, null].includes(trip?.total_distance) ? '-' : `${trip?.total_distance.toFixed(2)} KM`,
      averageSpeed: [undefined, null].includes(trip?.avg_speed) ? '-' : `${trip?.avg_speed.toFixed(2)} km/h`,
      maxSpeed: [undefined, null].includes(trip?.max_speed) ? '-' : `${trip?.max_speed.toFixed(2)} km/h`,
      drivers: trip?.driver_details,
      totalEvents: trip?.distracted_count + trip?.drowsy_count ?? '-',
      distractedEvents: trip?.distracted_count ?? '-',
      drowsyEvents: trip?.drowsy_count ?? '-',
      overSpeeding: 'N/A',
      hardAcceleration: 'N/A',
      harshBrakes: 'N/A',
      sharpTurns: 'N/A',
      sessions: trip.sessions.map((session: any) => {
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
          startLocation: session?.start_location?.address || '-',
          endLocation: session?.end_location?.address || '-',
          distanceDriven: [undefined, null].includes(session?.total_distance)
            ? '-'
            : `${session?.total_distance.toFixed(2)} KM`,
          averageSpeed: [undefined, null].includes(session?.avg_speed) ? '-' : `${session?.avg_speed.toFixed(2)} km/h`,
          maxSpeed: [undefined, null].includes(session?.max_speed) ? '-' : `${session?.max_speed.toFixed(2)} km/h`,
          drivers: session?.driver_details,
          totalEvents: session?.total_events ?? '-',
          distractedEvents: session?.distracted_count ?? '-',
          drowsyEvents: session?.drowsy_count ?? '-',
          overSpeeding: '-',
          hardAcceleration: '-',
          harshBrakes: '-',
          sharpTurns: '-',
        };
      }),
    };
  });

  console.log('%ctotalTrips:', 'background-color:orange;', totalTrips);
  // const totalSessions: SessionType[] = reportBySessionData.map((session: any) => {
  //   return {
  //     sessionID: session.session_id,
  //     geoJSONData: geoJSONData[session.session_id],
  //     startedAt: session?.start_time || '-',
  //     endedAt: session?.end_time || '-',
  //     totalTime: [undefined, null].includes(session?.total_time)
  //       ? '-'
  //       : convertToSecondsToHourMinutes(session?.total_time),
  //     travelTime: [undefined, null].includes(session?.travel_time)
  //       ? '-'
  //       : convertToSecondsToHourMinutes(session?.travel_time),
  //     idleTime: [undefined, null].includes(session?.total_idle_time)
  //       ? '-'
  //       : convertToSecondsToHourMinutes(session?.total_idle_time),
  //     startLocation: session?.start_location?.location || '-',
  //     endLocation: session?.end_location?.location || '-',
  //     distanceDriven: [undefined, null].includes(session?.total_distance)
  //       ? '-'
  //       : `${session?.total_distance.toFixed(2)} KM`,
  //     averageSpeed: [undefined, null].includes(session?.avg_speed) ? '-' : `${session?.avg_speed.toFixed(2)} km/h`,
  //     maxSpeed: [undefined, null].includes(session?.max_speed) ? '-' : `${session?.max_speed.toFixed(2)} km/h`,
  //     drivers: session?.driver_details,
  //     totalEvents: session?.total_events ?? '-',
  //     distractedEvents: session?.distracted_count ?? '-',
  //     drowsyEvents: session?.drowsy_count ?? '-',
  //     overSpeeding: '-',
  //     hardAcceleration: '-',
  //     harshBrakes: '-',
  //     sharpTurns: '-',
  //   };
  // });

  return (
    <TotalSessionsStyled>
      <div className="total-sessions">
        <div className="total-sessions__headings">
          <p>{t(`${vehicleReportTranslationsPath}.reportData.startedAt`).toUpperCase()}</p>
          <p>{t(`${vehicleReportTranslationsPath}.reportData.endedAt`).toUpperCase()}</p>
          <p>{t(`${vehicleReportTranslationsPath}.reportData.startLocation`).toUpperCase()}</p>
          <p>{t(`${vehicleReportTranslationsPath}.reportData.endLocation`).toUpperCase()}</p>
        </div>
        <div className="total-sessions__empty-div"></div>
      </div>
      <AccordionStyled activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {totalTrips.map((trip: TripType) => {
          return (
            <AccordionTab
              key={trip.tripID}
              header={
                <AccordionHeader
                  startedAt={trip.startedAt}
                  endedAt={trip.endedAt}
                  startLocation={trip?.startLocation}
                  endLocation={trip?.endLocation}
                />
              }
            >
              <TripBody
                tripBodyData={{
                  tripID: trip.tripID,
                  geoJSONData: trip.geoJSONData,
                  startedAt: trip.startedAt,
                  endedAt: trip.endedAt,
                  idleTime: trip.idleTime,
                  travelTime: trip.travelTime,
                  totalTime: trip.totalTime,
                  distanceDriven: trip.distanceDriven,
                  startLocation: trip.startLocation,
                  endLocation: trip.endLocation,
                  averageSpeed: trip.averageSpeed,
                  maxSpeed: trip.maxSpeed,
                  drivers: trip.drivers,
                  totalEvents: trip.totalEvents,
                  distractedEvents: trip.distractedEvents,
                  drowsyEvents: trip.drowsyEvents,
                  overSpeeding: trip.overSpeeding,
                  hardAcceleration: trip.hardAcceleration,
                  harshBrakes: trip.harshBrakes,
                  sharpTurns: trip.sharpTurns,
                }}
                mapRouteImages={mapRouteImages}
                setMapRouteImages={setMapRouteImages}
              />

              <section className="total-trips__trip-sessions-container">
                <Heading3>
                  {t(`${vehicleReportTranslationsPath}.reportData.sessionsHeading`)} {`(${trip.sessions.length})`}
                </Heading3>

                <div className="total-sessions">
                  <div className="total-sessions__headings">
                    <p>{t(`${vehicleReportTranslationsPath}.reportData.startedAt`).toUpperCase()}</p>
                    <p>{t(`${vehicleReportTranslationsPath}.reportData.endedAt`).toUpperCase()}</p>
                    <p>{t(`${vehicleReportTranslationsPath}.reportData.startLocation`).toUpperCase()}</p>
                    <p>{t(`${vehicleReportTranslationsPath}.reportData.endLocation`).toUpperCase()}</p>
                  </div>
                  <div className="total-sessions__empty-div"></div>
                </div>
                <AccordionStyled activeIndex={activeIndex1} onTabChange={(e) => setActiveIndex1(e.index)}>
                  {trip.sessions.map((session: SessionType) => {
                    console.log('main session', session);
                    return (
                      <AccordionTab
                        key={session.sessionID}
                        header={
                          <AccordionHeader
                            startedAt={session.startedAt}
                            endedAt={session.endedAt}
                            startLocation={session?.startLocation || '-'}
                            endLocation={session?.endLocation || '-'}
                          />
                        }
                      >
                        <SessionBody
                          sessionBodyData={{
                            sessionID: session.sessionID,
                            geoJSONData: session.geoJSONData,
                            startedAt: session.startedAt,
                            endedAt: session.endedAt,
                            totalTime: session.totalTime,
                            travelTime: session.travelTime,
                            idleTime: session.idleTime,
                            startLocation: session?.startLocation || '-',
                            endLocation: session?.endLocation || '-',
                            distanceDriven: session.distanceDriven,
                            averageSpeed: session.averageSpeed,
                            maxSpeed: session.maxSpeed,
                            drivers: session.drivers,
                            totalEvents: session.distractedEvents + session.drowsyEvents,
                            distractedEvents: session.distractedEvents,
                            drowsyEvents: session.drowsyEvents,
                            overSpeeding: session.overSpeeding || 'N/A',
                            hardAcceleration: session.hardAcceleration || 'N/A',
                            harshBrakes: session.harshBrakes || 'N/A',
                            sharpTurns: session.sharpTurns || 'N/A',
                          }}
                          mapRouteImages={mapRouteImages}
                          setMapRouteImages={setMapRouteImages}
                        />
                      </AccordionTab>
                    );
                  })}
                </AccordionStyled>
              </section>
            </AccordionTab>
          );
        })}
      </AccordionStyled>

      {/* <AccordionStyled activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {totalSessions.map((session: SessionType) => {
          return (
            <>
              <AccordionTab
                key={session.sessionID}
                header={
                  <AccordionHeader
                    startedAt={session.startedAt}
                    endedAt={session.endedAt}
                    startLocation={session.startLocation}
                    endLocation={session.endLocation}
                  />
                }
              >
                <SessionBody
                  sessionBodyData={{
                    sessionID: session.sessionID,
                    geoJSONData: session.geoJSONData,
                    startedAt: session.startedAt,
                    endedAt: session.endedAt,
                    totalTime: session.totalTime,
                    travelTime: session.travelTime,
                    idleTime: session.idleTime,
                    startLocation: session.startLocation,
                    endLocation: session.endLocation,
                    distanceDriven: session.distanceDriven,
                    averageSpeed: session.averageSpeed,
                    maxSpeed: session.maxSpeed,
                    drivers: session.drivers,
                    totalEvents: session.totalEvents,
                    distractedEvents: session.distractedEvents,
                    drowsyEvents: session.drowsyEvents,
                    overSpeeding: session.overSpeeding,
                    hardAcceleration: session.hardAcceleration,
                    harshBrakes: session.harshBrakes,
                    sharpTurns: session.sharpTurns
                  }}
                  mapRouteImages={mapRouteImages}
                  setMapRouteImages={setMapRouteImages}
                />
              </AccordionTab>
            </>
          );
        })}
      </AccordionStyled> */}
    </TotalSessionsStyled>
  );
}

const TotalSessionsStyled = styled.div`
  width: 100%;
  max-width: 850px;
  font-family: 'Poppins', sans-serif;

  .total-trips__trips-total-heading {
    font-weight: bold;
    font-size: 22px;
    margin: 0;
  }

  .total-trips__trips-total-value {
    font-size: 20px;
  }

  .total-trips__trips-details-container {
    margin-top: 8px;
  }

  .total-trips__trips-details-heading {
    font-weight: bold;
  }

  .total-trips__trip-map-container {
    background-color: silver;
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .total-trips__trip-detail-container {
    display: grid;
    row-gap: 4px;
  }

  .total-trips__trip-detail {
    display: flex;
    font-family: 'Poppins', sans-serif;
  }

  .total-trips__trip-detail p {
    margin: 0;
  }

  .total-trips__trip-detail-title {
    font-weight: 600;
  }

  .total-trips__trip-sessions-container {
    margin-top: 8px;
  }

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
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr;
    place-items: center;
    column-gap: 8px;
    flex: 1;
    padding: 0 20px;
    font-size: 12px;
  }

  @media screen and (max-width: 500px) {
    .total-sessions {
      padding: 0px;
    }

    .total-sessions__headings {
      padding: 0 12px;
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

const Heading3 = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background-color: var(--app-primary-color);
  color: white;
  margin-bottom: 0.5rem;
  padding: 6px 20px;
  text-align: center;

  @media screen and (max-width: 500px) {
    font-size: 1rem;
  }
`;
