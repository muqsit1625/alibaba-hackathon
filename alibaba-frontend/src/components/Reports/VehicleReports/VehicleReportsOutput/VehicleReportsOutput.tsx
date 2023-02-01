//@ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import styled from 'styled-components';
import { Document, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';

import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';

import { tripsData } from './vehicleReportMockData';

import { SearchIcon } from 'global/icons';
import { colors } from 'global/colors';
import {
  convertDateToTimeElapsed,
  convertToSecondsToHourMinutes,
  differenceBetweenTwoDates,
  geoJSONCoordinatesLengthToZoomLevel,
  getLastSeenTime,
} from 'global/utils';
import { driverAuthStatusInterval, vehicleReportTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { authSelector } from 'redux/auth/authSlice';
import { useCurrentAuthAndDriverQuery } from 'redux/endpoints/liveview';
import { useLazyGetVehicleReportByTripQuery } from 'redux/endpoints/reports';

import { S3Image } from 'components/Shared/S3Image';
import TotalSessions from 'components/Reports/VehicleReports/TotalSessions/TotalSessions';
import VehicleReportDoc from 'components/Reports/VehicleReports/VehicleReportDoc/VehicleReportDoc';
import Spinner from 'components/Shared/Spinner';

import { DriverDetailsType, EventsDetailsType, VehicleDetailsType, VehicleReportsOutputProps } from './types';
import Btn from 'components/CButtons/Btn';
import SecondaryBtn from 'components/CButtons/SecondaryBtn';

const VehicleReportsOutput = ({
  data,
  reportData,
  reportDataNew,
  reportBySessionData,
  reportByTripData,
  vehicleImage,
  driverImage,
  vehicleReportBySessionQueryState,
  vehicleReportByTripQueryState,
}: VehicleReportsOutputProps) => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const authSlice: any = useSelector(authSelector);
  const currentAuthAndDriverQueryState = useCurrentAuthAndDriverQuery(reportData?.vehicle_details?.vehicle_plate_no, {
    skip: !reportData?.vehicle_details?.vehicle_plate_no,
    pollingInterval: driverAuthStatusInterval,
  });

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const metaData = {
    ...data,
    companyName: authSlice?.user?.user?.company_name || '-',
    userEmail: authSlice?.user?.user?.email,
    userDesignation: 'Manager',
  };

  const fileName: string | null = useMemo(() => {
    let name = null;

    if (reportData) {
      name = `${reportData?.vehicle_detail?.vehicle_plate_no}_${moment(data.dates[0])
        .format('DD MMM')
        .replace(' ', '')}-${
        data.dates[1]
          ? moment(data.dates[1]).format('DD MMM').replace(' ', '')
          : moment(data.dates[0]).format('DD MMM').replace(' ', '')
      }`;
    }

    return name;
  }, [data.dates, reportData]);

  const vehicleDetails: VehicleDetailsType = useMemo(() => {
    let travelPerDay = reportData?.travel_time
      ? reportData?.travel_time / differenceBetweenTwoDates(data.dates[1], data.dates[0]).toFixed(2)
      : '10';

    return {
      [`${t(`${vehicleReportTranslationsPath}.reportData.vehicleName`)}`]:
        reportData?.vehicle_details?.make_model || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.vehiclePlateNo`)}`]:
        reportData?.vehicle_details?.vehicle_plate_no || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.vinNumber`)}`]: reportData?.vehicle_details?.chassis_no,
      [`${t(`${vehicleReportTranslationsPath}.reportData.distanceCovered`)}`]: reportData?.total_distance
        ? reportData.total_distance.toFixed(2).toString() + ' KM'
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.distanceCoveredPerDay`)}`]: reportData?.total_distance
        ? `${(reportData?.total_distance / differenceBetweenTwoDates(data.dates[1], data.dates[0])).toFixed(2)} KM`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.lastLocation`)}`]: reportData?.end_location?.address || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.lastOnline`)}`]: reportData?.end_location?.timestamp
        ? moment.unix(parseInt(reportData.end_location.timestamp)).format('DD-MMM-YYYY | hh:mm A')
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.startLocation`)}`]: reportData?.start_location?.address || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.endLocation`)}`]: reportData?.end_location?.address || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.maxSpeed`)}`]: reportData?.max_speed
        ? `${reportData?.max_speed} km/h`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.averageSpeed`)}`]: reportData?.avg_speed
        ? `${reportData?.avg_speed.toFixed(2)} km/h`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.travelTime`)}`]: reportData?.travel_time
        ? convertToSecondsToHourMinutes(reportData?.travel_time)
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.travelTimePerDay`)}`]: reportData?.travel_time
        ? convertToSecondsToHourMinutes(travelPerDay)
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.totalIdleTime`)}`]: reportData?.total_idle_time
        ? convertToSecondsToHourMinutes(reportData?.total_idle_time)
        : '-',
    };
  }, [
    t,
    reportData?.avg_speed,
    reportData?.distance_per_day,
    reportData?.end_location?.location,
    reportData?.last_location?.location,
    reportData?.last_online?.epochtime,
    reportData?.max_speed,
    reportData?.start_location?.location,
    reportData?.total_distance,
    reportData?.total_idle_time,
    reportData?.travel_time,
    reportData?.travel_time_per_day,
    reportData?.vehicle_details?.chassis_no,
    reportData?.vehicle_details?.make_model,
    reportData?.vehicle_details?.vehicle_plate_no,
  ]);

  const eventsDetails: EventsDetailsType = useMemo(() => {
    return {
      [`${t(`${vehicleReportTranslationsPath}.reportData.distractedCount`)}`]: reportData?.distracted_count ?? '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.drowsyCount`)}`]: reportData?.drowsy_count ?? '-',
    };
  }, [reportData?.distracted_count, reportData?.drowsy_count, t]);

  const driverDetails: DriverDetailsType = useMemo(() => {
    return {
      [`${t(`${vehicleReportTranslationsPath}.reportData.currentDriver`)}`]:
        reportData?.current_driver && reportData?.current_driver?.status !== 404
          ? `${reportData?.current_driver?.driver_first_name || ''} ${
              reportData?.current_driver?.driver_last_name || ''
            }`
          : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.authorizationStatus`)}`]:
        reportData?.auth_status === true
          ? t(`${vehicleReportTranslationsPath}.reportData.authorizedText`)
          : t(`${vehicleReportTranslationsPath}.reportData.unauthorizedText`),
      [`${t(`${vehicleReportTranslationsPath}.reportData.lastUpdated`)}`]:
        reportData?.current_driver &&
        reportData?.current_driver?.status !== 404 &&
        currentAuthAndDriverQueryState?.data?.auth_status?.sentTime
          ? getLastSeenTime(currentAuthAndDriverQueryState?.data?.auth_status?.sentTime, 'long')
          : '-',
    };
  }, [
    t,
    currentAuthAndDriverQueryState?.data?.auth_status?.sentTime,
    reportData?.auth_status,
    reportData?.current_driver,
  ]);

  console.log('major', reportByTripData);

  const tripGeoJSONData = useMemo(() => {
    const allGeoJSONData: any = {};
    for (const key in reportByTripData) {
      if (reportByTripData[key]?.vehicle_route?.length > 1) {
        const routeLocationDataLngLat = reportByTripData[key]?.vehicle_route.map((location: any) => {
          return {
            longitude: parseFloat(location.longitude),
            latitude: parseFloat(location.latitude),
          };
        });
        const minLongitude = Math.min(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.longitude));
        const maxLongitude = Math.max(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.longitude));
        const minLatitude = Math.min(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.latitude));
        const maxLatitude = Math.max(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.latitude));

        const longitudeDiff = maxLongitude - minLongitude;
        const latitudeDiff = maxLatitude - minLatitude;

        allGeoJSONData[`${reportByTripData[key].trip_id}`] = {
          lngLatBounds: [
            [minLongitude - longitudeDiff, minLatitude - latitudeDiff],
            [maxLongitude + longitudeDiff, maxLatitude + latitudeDiff],
          ],
        };
      }

      allGeoJSONData[`${reportByTripData[key].trip_id}`] = {
        ...allGeoJSONData[`${reportByTripData[key].trip_id}`],
        geoJSONDataStyleType: reportByTripData[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
        geoJSONDataObject: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: reportByTripData[key]?.vehicle_route?.length > 1 ? 'LineString' : 'Point',
                coordinates: reportByTripData[key]?.vehicle_route
                  ? reportByTripData[key]?.vehicle_route?.length > 1
                    ? reportByTripData[key]?.vehicle_route.map((locationPacket: any) => {
                        return [parseFloat(locationPacket.longitude), parseFloat(locationPacket.latitude)];
                      })
                    : reportByTripData[key]?.vehicle_route?.length === 1
                    ? [
                        parseFloat(reportByTripData[key]?.vehicle_route[0].longitude),
                        parseFloat(reportByTripData[key]?.vehicle_route[0].latitude),
                      ]
                    : []
                  : [],
              },
              properties: {},
            },
          ],
        },
        layerProps: {
          id: reportByTripData[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
          type: reportByTripData[key]?.vehicle_route?.length > 1 ? 'line' : 'circle',
          source: reportByTripData[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
          paint:
            reportByTripData[key]?.vehicle_route?.length > 1
              ? {
                  'line-color': 'red',
                  'line-width': 3,
                }
              : {
                  'circle-radius': 3,
                  'circle-color': 'red',
                },
          layout:
            reportByTripData[key]?.vehicle_route?.length > 1
              ? {
                  'line-join': 'miter',
                  'line-cap': 'square',
                }
              : {},
        },
      };
    }

    return allGeoJSONData;
  }, [reportByTripData]);
  console.log('%ctripGeoJSONData:', 'background-color:pink', tripGeoJSONData);

  const geoJSONData = useMemo(() => {
    const allGeoJSONData: any = {};
    for (const tripKey in reportByTripData) {
      const tripSessions = reportByTripData[tripKey].sessions;

      for (const key in tripSessions) {
        if (tripSessions[key]?.vehicle_route?.length > 1) {
          const routeLocationDataLngLat = tripSessions[key]?.vehicle_route.map((location: any) => {
            return {
              longitude: parseFloat(location.longitude),
              latitude: parseFloat(location.latitude),
            };
          });
          const minLongitude = Math.min(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.longitude));
          const maxLongitude = Math.max(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.longitude));
          const minLatitude = Math.min(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.latitude));
          const maxLatitude = Math.max(...routeLocationDataLngLat.map((lngLatObj: any) => lngLatObj.latitude));

          const longitudeDiff = maxLongitude - minLongitude;
          const latitudeDiff = maxLatitude - minLatitude;

          allGeoJSONData[`${tripSessions[key].session_id}`] = {
            lngLatBounds: [
              [minLongitude - longitudeDiff, minLatitude - latitudeDiff],
              [maxLongitude + longitudeDiff, maxLatitude + latitudeDiff],
            ],
          };
        }

        allGeoJSONData[`${tripSessions[key].session_id}`] = {
          ...allGeoJSONData[`${tripSessions[key].session_id}`],
          geoJSONDataStyleType: tripSessions[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
          geoJSONDataObject: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: tripSessions[key]?.vehicle_route?.length > 1 ? 'LineString' : 'Point',
                  coordinates: tripSessions[key]?.vehicle_route
                    ? tripSessions[key]?.vehicle_route?.length > 1
                      ? tripSessions[key]?.vehicle_route.map((locationPacket: any) => {
                          return [parseFloat(locationPacket.longitude), parseFloat(locationPacket.latitude)];
                        })
                      : tripSessions[key]?.vehicle_route?.length === 1
                      ? [
                          parseFloat(tripSessions[key]?.route_location_data[0].longitude),
                          parseFloat(tripSessions[key]?.route_location_data[0].latitude),
                        ]
                      : []
                    : [],
                },
                properties: {},
              },
            ],
          },
          layerProps: {
            id: tripSessions[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
            type: tripSessions[key]?.vehicle_route?.length > 1 ? 'line' : 'circle',
            source: tripSessions[key]?.vehicle_route?.length > 1 ? 'route' : 'point',
            paint:
              tripSessions[key]?.vehicle_route?.length > 1
                ? {
                    'line-color': 'red',
                    'line-width': 3,
                  }
                : {
                    'circle-radius': 3,
                    'circle-color': 'red',
                  },
            layout:
              tripSessions[key]?.vehicle_route?.length > 1
                ? {
                    'line-join': 'miter',
                    'line-cap': 'square',
                  }
                : {},
          },
        };
      }
    }

    return allGeoJSONData;
  }, [reportByTripData]);
  console.log('%cgeoJSONData:', 'background-color:red;color:white;', geoJSONData);

  const [mapRouteImages, setMapRouteImages] = useState<any>({});
  const [areImagesLoaded, setAreImagesLoaded] = useState<boolean>(false);
  const [pdfGenerationProgress, setPdfGenerationProgress] = useState<number | null>(null);
  console.log('%cmapRouteImages:', 'background-color:crimson;color:white;', mapRouteImages);
  console.log('%careImagesLoaded:', 'background-color:crimson;color:white;', areImagesLoaded);

  const generatePDF = () => {
    console.log('%cgeoJSONData for PDF:', 'background-color:hotpink;', geoJSONData);
    const geoJSONDataLength = Object.keys(geoJSONData).length;
    const tripGeoJSONDataLength = Object.keys(tripGeoJSONData).length;
    const totalDataLength = geoJSONDataLength + tripGeoJSONDataLength;

    if (totalDataLength === 0) {
      return setAreImagesLoaded(true);
    }

    setAreImagesLoaded(false);
    setPdfGenerationProgress(0);

    const actualPixelRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      get: function () {
        return 300 / 96;
      },
    });

    const routeImages: any = {};

    if (geoJSONDataLength > 0) {
      let imagesToProcess = 10;
      let leftIndex = 0;
      let rightIndex = imagesToProcess;

      (async () => {
        let stop = false;
        while (stop === false) {
          setPdfGenerationProgress(
            Math.trunc(((leftIndex >= totalDataLength ? totalDataLength : leftIndex + 1) / totalDataLength) * 100),
          );
          let geoJSONs: any = Object.keys(geoJSONData).slice(leftIndex, rightIndex);
          geoJSONs = geoJSONs.map((sessionID: string) => {
            return { geoJSONDataObj: geoJSONData[sessionID], sessionID };
          });
          geoJSONs = geoJSONs.map(({ geoJSONDataObj, sessionID }: { geoJSONDataObj: any; sessionID: string }) => {
            return produceMap(geoJSONDataObj, sessionID);
          });

          const produceMapResult = await Promise.allSettled(geoJSONs);
          console.log('%cproduceMapResult:', 'background-color:mediumvioletred;color:white', produceMapResult);

          if (rightIndex > geoJSONDataLength) {
            stop = true;
            setAreImagesLoaded(true);
          } else {
            leftIndex = rightIndex;
            rightIndex = rightIndex + imagesToProcess;
          }
        }
      })();
    }

    if (tripGeoJSONDataLength > 0) {
      let imagesToProcess = 10;
      let leftIndex = 0;
      let rightIndex = imagesToProcess;

      (async () => {
        let stop = false;
        while (stop === false) {
          setPdfGenerationProgress(
            Math.trunc(((leftIndex >= totalDataLength ? totalDataLength : leftIndex + 1) / totalDataLength) * 100),
          );
          let geoJSONs: any = Object.keys(tripGeoJSONData).slice(leftIndex, rightIndex);
          geoJSONs = geoJSONs.map((tripID: string) => {
            return { geoJSONDataObj: tripGeoJSONData[tripID], tripID };
          });
          geoJSONs = geoJSONs.map(({ geoJSONDataObj, tripID }: { geoJSONDataObj: any; tripID: string }) => {
            return produceMap(geoJSONDataObj, tripID);
          });

          const produceMapResult = await Promise.allSettled(geoJSONs);
          console.log('%cproduceMapResult:', 'background-color:mediumvioletred;color:white', produceMapResult);

          if (rightIndex > tripGeoJSONDataLength) {
            stop = true;
            setAreImagesLoaded(true);
          } else {
            leftIndex = rightIndex;
            rightIndex = rightIndex + imagesToProcess;
          }
        }
      })();
    }

    setMapRouteImages(routeImages);
    console.log('%crouteImages:', 'background-color:orange;color:white;', routeImages);

    function produceMap(singleGeoJSONData: any, sessionID: string) {
      return new Promise((resolve, reject) => {
        // Create map container
        const hidden: any = document.createElement('div');
        hidden.className = 'hidden-map';
        document.body.appendChild(hidden);
        const container = document.createElement('div');

        container.style.width = '600px';
        container.style.height = '310px';
        hidden.appendChild(container);

        const numberOfPoints = singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates.length - 1;

        const renderMap = new mapboxgl.Map({
          container: container,
          bounds: singleGeoJSONData?.lngLatBounds || null,
          center: [
            singleGeoJSONData.layerProps.type === 'line'
              ? singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[Math.trunc(numberOfPoints / 2)][0]
              : singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[0],
            singleGeoJSONData.layerProps.type === 'line'
              ? singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[Math.trunc(numberOfPoints / 2)][1]
              : singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[1],
          ],
          zoom:
            singleGeoJSONData.layerProps.type === 'line'
              ? geoJSONCoordinatesLengthToZoomLevel(
                  singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates.length,
                )
              : 14,
          style: 'mapbox://styles/mapbox/streets-v11',
          interactive: false,
          fadeDuration: 0,
          attributionControl: false,
        });

        renderMap.on('load', () => {
          renderMap.addSource(singleGeoJSONData.geoJSONDataStyleType, {
            type: 'geojson',
            data: { ...singleGeoJSONData.geoJSONDataObject },
          });

          renderMap.addLayer({
            id: singleGeoJSONData.layerProps.id,
            type: singleGeoJSONData.layerProps.type,
            source: singleGeoJSONData.layerProps.source,
            layout: singleGeoJSONData.layerProps.layout,
            paint: singleGeoJSONData.layerProps.paint,
          });

          renderMap.once('idle', function () {
            const mapImage = renderMap.getCanvas().toDataURL();

            routeImages[sessionID] = mapImage;

            renderMap.remove();
            hidden.parentNode.removeChild(hidden);

            resolve('Promise Resolved');
          });
        });
      });
    }

    Object.defineProperty(window, 'devicePixelRatio', {
      get: function () {
        return actualPixelRatio;
      },
    });
  };

  const renderDialogFooter = useMemo(() => {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <SecondaryBtn
          bColor={colors.themeBlue}
          bColorHover={colors.themeSecondaryHover}
          onClick={() => setIsDownloadDialogOpen(false)}
        >
          {t(`${vehicleReportTranslationsPath}.cancelText`)}
        </SecondaryBtn>
      </div>
    );
  }, [t]);

  const onDownloadPDFButtonClick = () => {
    setIsDownloadDialogOpen(true);
    if (areImagesLoaded === false) {
      generatePDF();
    }
  };

  const detailTypeToLanguageTextMap = {
    startedAt: t(`${vehicleReportTranslationsPath}.reportData.startedAt`),
    endedAt: t(`${vehicleReportTranslationsPath}.reportData.endedAt`),
    totalTime: t(`${vehicleReportTranslationsPath}.reportData.totalTime`),
    idleTime: t(`${vehicleReportTranslationsPath}.reportData.idleTime`),
    travelTime: t(`${vehicleReportTranslationsPath}.reportData.travelTime`),
    startLocation: t(`${vehicleReportTranslationsPath}.reportData.startLocation`),
    endLocation: t(`${vehicleReportTranslationsPath}.reportData.endLocation`),
    distanceDriven: t(`${vehicleReportTranslationsPath}.reportData.distanceDriven`),
    maxSpeed: t(`${vehicleReportTranslationsPath}.reportData.maxSpeed`),
    avgSpeed: t(`${vehicleReportTranslationsPath}.reportData.averageSpeed`),
    totalEvents: t(`${vehicleReportTranslationsPath}.reportData.totalEvents`),
    distractedEvents: t(`${vehicleReportTranslationsPath}.reportData.distractedEvents`),
    drowsyEvents: t(`${vehicleReportTranslationsPath}.reportData.drowsyEvents`),
    overSpeeding: t(`${vehicleReportTranslationsPath}.reportData.overSpeeding`),
    hardAcceleration: t(`${vehicleReportTranslationsPath}.reportData.hardAcceleration`),
    harshBrakes: t(`${vehicleReportTranslationsPath}.reportData.harshBrakes`),
    sharpTurns: t(`${vehicleReportTranslationsPath}.reportData.sharpTurns`),
  };

  console.log('reports change', reportByTripData);

  return (
    <StyledCard>
      {reportData ? (
        <StyledReportContainer>
          <header className="vehicle-reports-output__header">
            <h1 className="vehicle-reports-output__vehicle-report-heading">
              {t(`${vehicleReportTranslationsPath}.reportData.vehicleReportHeading`)}
            </h1>

            <div className="vehicle-reports-output__report-range-container">
              <p className="vehicle-reports-output__report-range-heading">
                {t(`${vehicleReportTranslationsPath}.reportData.from`)}
              </p>
              <p className="vehicle-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[0]).format('DD-MMM-YYYY') : '-'}
              </p>
              <p className="vehicle-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[0]).format('hh:mm A') : '-'}
              </p>
            </div>
            <div className="vehicle-reports-output__report-range-container">
              <p className="vehicle-reports-output__report-range-heading">
                {t(`${vehicleReportTranslationsPath}.reportData.till`)}
              </p>
              <p className="vehicle-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[1]).format('DD-MMM-YYYY') : '-'}
              </p>
              <p className="vehicle-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[1]).format('hh:mm A') : '-'}
              </p>
            </div>
          </header>

          <section className="vehicle-reports-output__vehicle-information-container">
            <Heading1>{t(`${vehicleReportTranslationsPath}.reportData.vehicleInformationHeading`)}</Heading1>

            <div className="vehicle-reports-output__vehicle-information">
              <div className="vehicle-reports-output__vehicle-information-left">
                {Object.keys(vehicleDetails)
                  .slice(0, 9)
                  .map((detailName, index) => {
                    return (
                      <div key={index} className="vehicle-reports-output__vehicle-detail">
                        <p className="vehicle-reports-output__vehicle-detail-title">{detailName}:&nbsp;</p>
                        <p className="vehicle-reports-output__vehicle-detail-value">
                          {vehicleDetails[detailName as keyof VehicleDetailsType]}
                        </p>
                      </div>
                    );
                  })}
              </div>
              <div className="vehicle-reports-output__vehicle-information-right">
                {vehicleImage && (
                  <S3Image
                    url={reportData?.vehicle_details?.vehicle_image}
                    style={{ height: '100px', width: '140px' }}
                  />
                )}

                {Object.keys(vehicleDetails)
                  .slice(9)
                  .map((detailName, index) => {
                    return (
                      <div key={index} className="vehicle-reports-output__vehicle-detail">
                        <p className="vehicle-reports-output__vehicle-detail-title">{detailName}:&nbsp;</p>
                        <p className="vehicle-reports-output__vehicle-detail-value">
                          {vehicleDetails[detailName as keyof VehicleDetailsType]}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          <section className="vehicle-reports-output__vehicle-events-container">
            <header className="vehicle-reports-output__vehicle-events-header">
              <Heading1>{t(`${vehicleReportTranslationsPath}.reportData.eventsHeading`)}</Heading1>
            </header>

            {Object.keys(eventsDetails).map((detailName, index) => {
              return (
                <div key={index} className="vehicle-reports-output__vehicle-detail">
                  <p className="vehicle-reports-output__vehicle-detail-title">{detailName}:&nbsp;</p>
                  <p className="vehicle-reports-output__vehicle-detail-value">
                    {eventsDetails[detailName as keyof EventsDetailsType]}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="vehicle-reports-output__current-driver-container">
            <header className="vehicle-reports-output__current-driver-header">
              <Heading1>{t(`${vehicleReportTranslationsPath}.reportData.currentDriverHeading`)}</Heading1>
            </header>

            {Object.keys(driverDetails).map((detailName, index) => {
              return (
                <div
                  key={index}
                  className={`vehicle-reports-output__vehicle-detail ${
                    detailName === t(`${vehicleReportTranslationsPath}.reportData.authorizationStatus`)
                      ? 'vehicle-reports-output__vehicle-detail-authorization-status'
                      : ''
                  }`}
                >
                  <p className="vehicle-reports-output__vehicle-detail-title">{detailName}:&nbsp;</p>
                  <p
                    className={`vehicle-reports-output__vehicle-detail-value ${
                      detailName === t(`${vehicleReportTranslationsPath}.reportData.authorizationStatus`)
                        ? driverDetails[detailName] === t(`${vehicleReportTranslationsPath}.reportData.authorizedText`)
                          ? 'vehicle-reports-output__vehicle-detail-value--green'
                          : 'vehicle-reports-output__vehicle-detail-value--red'
                        : ''
                    }`}
                  >
                    {driverDetails[detailName as keyof DriverDetailsType]}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="vehicle-reports-output__total-sessions-container">
            <Heading1>
              {t(`${vehicleReportTranslationsPath}.reportData.tripsHeading`)}{' '}
              {`(${reportByTripData.length === undefined ? 0 : reportByTripData.length})`}
            </Heading1>

            {vehicleReportByTripQueryState.isLoading ? (
              <div className="vehicle-reports-output__total-sessions-loading-container">
                <Spinner />
              </div>
            ) : !reportByTripData || reportByTripData.length === 0 ? (
              <p>{t(`${vehicleReportTranslationsPath}.reportData.noTripsText`)}</p>
            ) : !Array.isArray(reportByTripData) ? (
              <p>{t(`${vehicleReportTranslationsPath}.reportData.corruptTripsText`)}</p>
            ) : (
              <TotalSessions
                tripsData={reportByTripData}
                // reportBySessionData={reportBySessionData}
                tripGeoJSONData={tripGeoJSONData}
                geoJSONData={geoJSONData}
                mapRouteImages={mapRouteImages}
                setMapRouteImages={setMapRouteImages}
              />
            )}
          </section>

          <FlexRow style={{ margin: '6rem 0 0', marginLeft: 'auto' }}>
            <Btn variant="theme" onClick={onDownloadPDFButtonClick}>
              {t(`${vehicleReportTranslationsPath}.downloadPDFText`)}
            </Btn>

            <Dialog
              header={t(`${vehicleReportTranslationsPath}.downloadVehicleReportText`)}
              style={{ width: '90vw', maxWidth: '1000px', direction: reducerState.isDirectionRtl ? 'rtl' : 'ltr' }}
              visible={isDownloadDialogOpen}
              onHide={() => setIsDownloadDialogOpen(false)}
              footer={renderDialogFooter}
              draggable={false}
            >
              <DownloadPDFDialogStyled>
                {!areImagesLoaded ? (
                  <div className="download-pdf-dialog__progress-container">
                    <div className="download-pdf-dialog__progress">
                      <p className="download-pdf-dialog__progress-percentage">{`${pdfGenerationProgress}%`}</p>
                      <Spinner width={120} height={120} />
                    </div>

                    <p className="download-pdf-dialog__pdf-prepare-text">
                      {t(`${vehicleReportTranslationsPath}.preparingPDFMessage`)}
                    </p>
                    <p className="download-pdf-dialog__info-text">
                      {t(`${vehicleReportTranslationsPath}.downloadPDFMessage`)}
                    </p>
                  </div>
                ) : (
                  <div className="download-pdf-dialog__download-pdf-button-container">
                    <DownloadBtn
                      fileName={fileName ?? 'document'}
                      document={
                        <VehicleReportDoc
                          isDirectionRtl={reducerState.isDirectionRtl}
                          detailTypeToLanguageTextMap={detailTypeToLanguageTextMap}
                          tripsData={reportByTripData}
                          reportData={reportData}
                          metaData={metaData}
                          reportBySessionData={reportBySessionData}
                          vehicleImage={vehicleImage}
                          driverImage={driverImage}
                          mapRouteImages={mapRouteImages}
                          lastUpdated={
                            reportData?.current_driver &&
                            reportData?.current_driver?.status !== 404 &&
                            currentAuthAndDriverQueryState?.data?.auth_status?.sentTime
                              ? convertDateToTimeElapsed(currentAuthAndDriverQueryState?.data?.auth_status?.sentTime)
                              : '-'
                          }
                        />
                      }
                    >
                      {({ blob, url, loading, error }) =>
                        loading
                          ? t(`${vehicleReportTranslationsPath}.loadingDocumentText`)
                          : t(`${vehicleReportTranslationsPath}.downloadPDFText`)
                      }
                    </DownloadBtn>
                  </div>
                )}
              </DownloadPDFDialogStyled>
            </Dialog>

            {/* {!areImagesLoaded ? (
              <DocumentLoadingButton>{'Loading Document...'}</DocumentLoadingButton>
            ) : (
              <DownloadBtn
                fileName={fileName ?? 'document'}
                document={
                  <VehicleReportDoc
                    reportData={reportData}
                    metaData={metaData}
                    reportBySessionData={reportBySessionData}
                    vehicleImage={vehicleImage}
                    driverImage={driverImage}
                    mapRouteImages={mapRouteImages}
                    lastUpdated={
                      reportData?.current_driver &&
                      reportData?.current_driver?.status !== 404 &&
                      currentAuthAndDriverQueryState?.data?.auth_status?.sentTime
                        ? convertDateToTimeElapsed(currentAuthAndDriverQueryState?.data?.auth_status?.sentTime)
                        : '-'
                    }
                  />
                }
              >
                {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download PDF')}
              </DownloadBtn>
            )} */}
          </FlexRow>
        </StyledReportContainer>
      ) : (
        <Center>
          <SearchIcon />
          <VehicleReportItem>{t(`${vehicleReportTranslationsPath}.selectReport`)}</VehicleReportItem>
        </Center>
      )}

      {/* <PDFViewer style={{ width: '100%', height: '600px' }}>
        <VehicleReportDoc
          isDirectionRtl={reducerState.isDirectionRtl}
          detailTypeToLanguageTextMap={detailTypeToLanguageTextMap}
          tripsData={reportByTripData}
          reportData={reportData}
          metaData={metaData}
          reportBySessionData={reportBySessionData}
          vehicleImage={vehicleImage}
          driverImage={driverImage}
          mapRouteImages={mapRouteImages}
          lastUpdated={
            reportData?.current_driver &&
            reportData?.current_driver?.status !== 404 &&
            currentAuthAndDriverQueryState?.data?.auth_status?.sentTime
              ? convertDateToTimeElapsed(currentAuthAndDriverQueryState?.data?.auth_status?.sentTime)
              : '-'
          }
        />
      </PDFViewer> */}
    </StyledCard>
  );
};

export default VehicleReportsOutput;

const StyledCard = styled(Card)`
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #f8f8f8;
  font-family: Poppins;

  .p-card-body {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .p-card-content {
    padding: 0;
  }

  @media screen and (max-width: 500px) {
    .p-card-body {
      padding: 20px;
    }
  }
`;

const StyledReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 28px;

  .vehicle-reports-output__header {
    width: 100%;
    max-width: 750px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: center;
  }

  .vehicle-reports-output__vehicle-report-heading {
    font-size: 24px;
    font-weight: bold;
    grid-column: 1/3;
    text-align: center;
  }

  .vehicle-reports-output__report-range-container {
    display: grid;
    place-items: center;
  }

  .vehicle-reports-output__report-range-heading {
    margin: 0;
    font-weight: bold;
  }

  .vehicle-reports-output__report-range-value {
    margin: 0;
    text-align: center;
    font-size: 12px;
    direction: ltr;
  }

  .vehicle-reports-output__vehicle-information-container,
  .vehicle-reports-output__vehicle-events-container,
  .vehicle-reports-output__current-driver-container,
  .vehicle-reports-output__total-sessions-container {
    width: 100%;
    max-width: 750px;
  }

  .vehicle-reports-output__total-sessions-loading-container {
    display: flex;
  }

  .vehicle-reports-output__vehicle-information {
    width: 100%;
    max-width: 750px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: 16px;
    column-gap: 16px;
  }

  .vehicle-reports-output__vehicle-plate-image {
    height: 100px;
    width: 140px;
  }

  .vehicle-reports-output__vehicle-detail {
    margin-top: 5px;
    display: flex;
    font-size: 12px;
  }
  .vehicle-reports-output__vehicle-detail-authorization-status {
    align-items: center;
  }

  .vehicle-reports-output__vehicle-detail-title {
    font-weight: bold;
    margin: 0;
  }

  .vehicle-reports-output__vehicle-detail-value {
    margin: 0;
    direction: ltr;
  }
  .vehicle-reports-output__vehicle-detail-value--green {
    background-color: #43ca82;
    color: white;
    padding: 4px 12px;
    border-radius: 8px;
  }
  .vehicle-reports-output__vehicle-detail-value--red {
    background-color: #f47878;
    color: white;
    padding: 4px 12px;
    border-radius: 8px;
  }

  @media screen and (max-width: 500px) {
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 2rem;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.25rem;
`;

const Heading1 = styled.h2`
  margin: 0;
  font-size: 20px;
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

const VehicleReportItem = styled.p`
  margin: 0;
  font-size: 12px;
  margin-bottom: 1.5rem;
`;

const VehicleStatusPill = styled('span')<{ isAuth?: boolean }>`
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  color: #ffffff;
  border-radius: 0.5rem;
  background-color: ${(props) => (props.isAuth ? colors.successGreen : colors.unAuthRed)};
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  row-gap: 1rem;
`;

const DocumentLoadingButton = styled.button`
  border: 1px solid ${colors.themeBlue};
  padding: 8px 44px;
  background-color: ${colors.themeBlue};
  border-radius: 10px;
  color: #ffffff;
  font-family: 'Poppins';
  font-style: normal;
  font-size: 18px;
  line-height: 24px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: #ffffff;
    background-color: ${colors.themeBlueHover};
  }
`;

const DownloadBtn = styled(PDFDownloadLink)`
  border: 1px solid ${colors.themeBlue};
  padding: 8px 44px;
  background-color: ${colors.themeBlue};
  border-radius: 10px;
  color: #ffffff;
  font-family: 'Poppins';
  font-style: normal;
  font-size: 18px;
  line-height: 24px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: #ffffff;
    background-color: ${colors.themeBlueHover};
  }
`;

const DownloadPDFDialogStyled = styled.div`
  margin-top: 20px;

  .download-pdf-dialog__progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .download-pdf-dialog__progress {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .download-pdf-dialog__progress-percentage {
    position: absolute;
    font-size: 32px;
    color: var(--app-primary-color);
    margin: 0;
  }

  .download-pdf-dialog__pdf-prepare-text {
    font-size: 24px;
    font-weight: bold;
  }

  .download-pdf-dialog__info-text {
    font-size: 20px;
  }

  .download-pdf-dialog__download-pdf-button-container {
    display: flex;
    justify-content: center;
  }
`;
