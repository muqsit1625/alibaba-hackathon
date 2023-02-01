import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import Map, { FullscreenControl, Layer, NavigationControl, Source } from 'react-map-gl';
import styled from 'styled-components';

import { geoJSONCoordinatesLengthToZoomLevel } from 'global/utils';
import { vehicleReportTranslationsPath } from 'global/variables';

import { TripBodyProps } from './types';

export default function TripBody(props: TripBodyProps) {
  const {
    tripID,
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
  } = props.tripBodyData;

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

  const numberOfPoints = geoJSONData.geoJSONDataObject.features[0].geometry.coordinates.length - 1;

  const mapRef: any = useRef(null);

  const onMapLoaded = () => {
    function updateCanvasImage() {
      const mapImage = mapRef.current.getCanvas().toDataURL();

      props.setMapRouteImages((prev: any) => ({
        ...prev,
        [tripID]: mapImage,
      }));
    }

    mapRef.current.on('moveend', updateCanvasImage);
    mapRef.current.on('zoomend', updateCanvasImage);

    if (!props.mapRouteImages[tripID]) {
      const mapImage = mapRef.current.getCanvas().toDataURL();
      props.setMapRouteImages((prev: any) => ({
        ...prev,
        [tripID]: mapImage,
      }));
    }
  };

  console.log('%cgeoJSONData:', 'background-color:green;color:white;', geoJSONData);

  return (
    <TripBodyStyled noData={geoJSONData?.geoJSONDataObject?.features[0]?.geometry?.coordinates.length === 0}>
      <section className="trip-body__map-journey-container">
        <div className="trip-body__map-container">
          {geoJSONData?.geoJSONDataObject?.features[0]?.geometry?.coordinates.length === 0 ? (
            <p style={{ marginBottom: '0px' }}>No Map Data</p>
          ) : (
            <Map
              ref={mapRef}
              onLoad={onMapLoaded}
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
      </section>

      <div className="trip-body__details-section">
        <section className="trip-body__details-container">
          <h3 className="trip-body__details-heading">{t(`${vehicleReportTranslationsPath}.reportData.timeHeading`)}</h3>

          {Object.keys(timingDetails).map((detailType) => {
            return (
              <div className="trip-body__detail">
                <p className="trip-body__detail-title">{detailType}:&nbsp;</p>
                <p className="trip-body__detail-value">{timingDetails[detailType]}</p>
              </div>
            );
          })}
        </section>

        <section className="trip-body__details-container">
          <h3 className="trip-body__details-heading">
            {t(`${vehicleReportTranslationsPath}.reportData.vehicleHeading`)}
          </h3>

          {Object.keys(vehicleDetails).map((detailType) => {
            return (
              <div className="trip-body__detail">
                <p className="trip-body__detail-title">{detailType}:&nbsp;</p>
                <p className="trip-body__detail-value">{vehicleDetails[detailType]}</p>
              </div>
            );
          })}
        </section>

        <section className="trip-body__details-container">
          <h3 className="trip-body__details-heading">
            {t(`${vehicleReportTranslationsPath}.reportData.driversHeading`)}
          </h3>

          <div className="trip-body__detail">
            {driverDetails.drivers?.map((driver: any) => {
              return (
                <p className="trip-body__detail-value">{`${driver?.driver_first_name || ''} ${
                  driver?.driver_last_name || ''
                }`}</p>
              );
            })}
          </div>
        </section>

        <section className="trip-body__details-container">
          <div className="trip-body__details-heading-container">
            <h3 className="trip-body__details-heading">
              {t(`${vehicleReportTranslationsPath}.reportData.eventHeading`)}
            </h3>
          </div>

          {Object.keys(eventsDetails).map((detailType) => {
            return (
              <div className="trip-body__detail">
                <p className="trip-body__detail-title">{detailType}:&nbsp;</p>
                <p className="trip-body__detail-value">{eventsDetails[detailType]}</p>
              </div>
            );
          })}
        </section>
      </div>
    </TripBodyStyled>
  );
}

const TripBodyStyled = styled.div<{ noData: boolean }>`
  font-family: 'Poppins', sans-serif;
  display: grid;

  .trip-body__map-journey-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-bottom: 1px solid #646464;
    padding-bottom: 20px;
  }

  .trip-body__map-container {
    background-color: silver;
    min-height: ${(props) => (props.noData ? '200px' : '400px')};
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .trip-body__details-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .trip-body__details-container {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
  }

  .trip-body__details-heading-container {
    display: flex;
    justify-content: space-between;
  }

  .trip-body__details-heading {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  .trip-body__detail {
    display: flex;
    font-size: 12px;
  }
  .trip-body__detail p {
    margin: 0;
  }

  .trip-body__detail-title {
    font-weight: 600;
  }

  .trip-body__detail-value {
    direction: ltr;
  }
`;
