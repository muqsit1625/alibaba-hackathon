import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';

import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';

import { driverReportData } from './driverReportMockData';

import { colors } from 'global/colors';
import { fetchToken } from 'global/apiRoute';
import { SearchIcon } from 'global/icons';
import { convertToMinutes, convertToSecondsToHourMinutes, geoJSONCoordinatesLengthToZoomLevel } from 'global/utils';
import { driverReportTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { authSelector } from 'redux/auth/authSlice';

import { S3Image } from 'components/Shared/S3Image';
import TotalSessions from 'components/Reports/DriverReports/TotalSessions/TotalSessions';
import DriverReportDoc from 'components/Reports/DriverReports/DriverReportDoc/DriverReportDoc';
import Spinner from 'components/Shared/Spinner';
import Btn from 'components/CButtons/Btn';
import SecondaryBtn from 'components/CButtons/SecondaryBtn';

import { DriverDetailsType, DriverReportsOutputProps, DriverStatsType, EventsDetailsType } from './types';

const DriverReportsOutput = ({
  data,
  driverImage,
  reportData,
  reportBySessionData,
  driverReportBySessionQueryState,
}: DriverReportsOutputProps) => {
  console.log('%creportData:', 'background-color:red;', reportData);

  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const authSlice: any = useSelector(authSelector);
  const metaData = {
    ...data,
    companyName: authSlice?.user?.user?.company_name || '-',
    userEmail: authSlice?.user?.user?.email,
    userDesignation: 'Manager',
  };

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const fileName: string | null = useMemo(() => {
    let fileName = null;
    if (reportData) {
      fileName = `${reportData?.driver_detail?.driver_first_name}_${
        reportData?.driver_detail?.driver_last_name
      }_${moment(data.dates[0]).format('DD MMM').replace(' ', '')}-${
        data.dates[1]
          ? moment(data.dates[1]).format('DD MMM').replace(' ', '')
          : moment(data.dates[0]).format('DD MMM').replace(' ', '')
      }`;
    }

    return fileName;
  }, [data.dates, reportData]);

  const driverDetails: DriverDetailsType = useMemo(() => {
    return {
      [`${t(`${driverReportTranslationsPath}.reportData.name`)}`]: `${
        reportData?.driver_detail?.driver_first_name || ''
      } ${reportData?.driver_detail?.driver_last_name || ''}`,
      [`${t(`${driverReportTranslationsPath}.reportData.driverLicenseNumber`)}`]:
        reportData?.driver_detail?.license_number || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.onboardingDate`)}`]: reportData?.driver_detail?.created_at
        ? moment(reportData?.driver_detail?.created_at).format('DD-MMM-YYYY | hh:mm A')
        : '-',
      [`${t(`${driverReportTranslationsPath}.reportData.address`)}`]: reportData?.driver_detail?.address || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.cnic`)}`]: reportData?.driver_detail?.cnic || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.phoneNumber`)}`]: reportData?.driver_detail?.phone_number,
    };
  }, [
    t,
    reportData?.driver_detail?.address,
    reportData?.driver_detail?.cnic,
    reportData?.driver_detail?.created_at,
    reportData?.driver_detail?.driver_first_name,
    reportData?.driver_detail?.driver_last_name,
    reportData?.driver_detail?.license_number,
    reportData?.driver_detail?.phone_number,
  ]);

  const driverStats: DriverStatsType = useMemo(() => {
    return {
      [`${t(`${driverReportTranslationsPath}.reportData.totalDistance`)}`]: reportData?.total_distance
        ? `${reportData?.total_distance.toFixed(2)} KM`
        : '-',
      [`${t(`${driverReportTranslationsPath}.reportData.averageDistancePerDay`)}`]: reportData?.avg_distance
        ? `${reportData?.avg_distance.toFixed(2)} KM`
        : '-',
      [`${t(`${driverReportTranslationsPath}.reportData.totalTime`)}`]: [undefined, null].includes(
        reportData?.total_time,
      )
        ? '-'
        : convertToSecondsToHourMinutes(reportData?.total_time),
      [`${t(`${driverReportTranslationsPath}.reportData.averageTimePerDay`)}`]: [undefined, null].includes(
        reportData?.avg_time_for_date_range,
      )
        ? '-'
        : convertToSecondsToHourMinutes(reportData?.avg_time_for_date_range),
      [`${t(`${driverReportTranslationsPath}.reportData.totalIdleTime`)}`]: [undefined, null].includes(
        reportData?.total_idle_time,
      )
        ? '-'
        : convertToSecondsToHourMinutes(reportData?.total_idle_time),
      [`${t(`${driverReportTranslationsPath}.reportData.averageIdleTimePerDay`)}`]: [undefined, null].includes(
        reportData?.avg_idle_time_per_day,
      )
        ? '-'
        : convertToSecondsToHourMinutes(reportData?.avg_idle_time_per_day),
    };
  }, [
    t,
    reportData?.avg_distance,
    reportData?.avg_idle_time_per_day,
    reportData?.avg_time_for_date_range,
    reportData?.total_distance,
    reportData?.total_idle_time,
    reportData?.total_time,
  ]);

  const eventsDetails: EventsDetailsType = useMemo(() => {
    return {
      [`${t(`${driverReportTranslationsPath}.reportData.totalEvents`)}`]: reportData?.total_events || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.averageEventsPerDay`)}`]: reportData?.average_events
        ? Math.trunc(reportData?.average_events)
        : '-',
      [`${t(`${driverReportTranslationsPath}.reportData.distractedCount`)}`]: reportData?.distracted_count || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.drowsyCount`)}`]: reportData?.drowsy_count || '-',
    };
  }, [t, reportData?.average_events, reportData?.distracted_count, reportData?.drowsy_count, reportData?.total_events]);

  const geoJSONData = useMemo(() => {
    const allGeoJSONData: any = {};
    for (const key in reportBySessionData) {
      if (reportBySessionData[key]?.route_location_data?.length > 1) {
        const routeLocationDataLngLat = reportBySessionData[key]?.route_location_data.map((location: any) => {
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

        allGeoJSONData[`${reportBySessionData[key].session_id}`] = {
          lngLatBounds: [
            [minLongitude - longitudeDiff, minLatitude - latitudeDiff],
            [maxLongitude + longitudeDiff, maxLatitude + latitudeDiff],
          ],
        };
      }

      allGeoJSONData[`${reportBySessionData[key].session_id}`] = {
        ...allGeoJSONData[`${reportBySessionData[key].session_id}`],
        geoJSONDataStyleType: reportBySessionData[key]?.route_location_data?.length > 1 ? 'route' : 'point',
        geoJSONDataObject: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: reportBySessionData[key]?.route_location_data?.length > 1 ? 'LineString' : 'Point',
                coordinates: reportBySessionData[key]?.route_location_data
                  ? reportBySessionData[key]?.route_location_data?.length > 1
                    ? reportBySessionData[key]?.route_location_data.map((locationPacket: any) => {
                        return [parseFloat(locationPacket.longitude), parseFloat(locationPacket.latitude)];
                      })
                    : [
                        parseFloat(reportBySessionData[key]?.route_location_data[0].longitude),
                        parseFloat(reportBySessionData[key]?.route_location_data[0].latitude),
                      ]
                  : [],
              },
              properties: {},
            },
          ],
        },
        layerProps: {
          id: reportBySessionData[key]?.route_location_data?.length > 1 ? 'route' : 'point',
          type: reportBySessionData[key]?.route_location_data?.length > 1 ? 'line' : 'circle',
          source: reportBySessionData[key]?.route_location_data?.length > 1 ? 'route' : 'point',
          paint:
            reportBySessionData[key]?.route_location_data?.length > 1
              ? {
                  'line-color': 'red',
                  'line-width': 3,
                }
              : {
                  'circle-radius': 3,
                  'circle-color': 'red',
                },
          layout:
            reportBySessionData[key]?.route_location_data?.length > 1
              ? {
                  'line-join': 'miter',
                  'line-cap': 'square',
                }
              : {},
        },
      };
    }

    return allGeoJSONData;
  }, [reportBySessionData]);
  console.log('%cgeoJSONData:', 'background-color:coral;', geoJSONData);

  const [mapRouteImages, setMapRouteImages] = useState<any>({});
  const [areImagesLoaded, setAreImagesLoaded] = useState<boolean>(false);
  const [pdfGenerationProgress, setPdfGenerationProgress] = useState<number | null>(null);
  console.log('%cmapRouteImages:', 'background-color:chocolate;color:white;', mapRouteImages);
  console.log('%careImagesLoaded:', 'background-color:chocolate;color:white;', areImagesLoaded);

  const generatePDF = () => {
    console.log('%cgeoJSONData for PDF:', 'background-color:hotpink;', geoJSONData);
    const geoJSONDataLength = Object.keys(geoJSONData).length;

    if (geoJSONDataLength > 0) {
      setAreImagesLoaded(false);
      setPdfGenerationProgress(0);

      let imagesToProcess = 10;
      let leftIndex = 0;
      let rightIndex = imagesToProcess;

      const routeImages: any = {};

      const actualPixelRatio = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', {
        get: function () {
          return 300 / 96;
        },
      });

      const produceMap = (singleGeoJSONData: any, sessionID: string) => {
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
                ? singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[
                    Math.trunc(numberOfPoints / 2)
                  ][0]
                : singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[0],
              singleGeoJSONData.layerProps.type === 'line'
                ? singleGeoJSONData.geoJSONDataObject.features[0].geometry.coordinates[
                    Math.trunc(numberOfPoints / 2)
                  ][1]
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
      };
      (async () => {
        let stop = false;
        while (stop === false) {
          setPdfGenerationProgress(
            Math.trunc(
              ((leftIndex >= geoJSONDataLength ? geoJSONDataLength : leftIndex + 1) / geoJSONDataLength) * 100,
            ),
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

        Object.defineProperty(window, 'devicePixelRatio', {
          get: function () {
            return actualPixelRatio;
          },
        });
      })();

      setMapRouteImages(routeImages);
      console.log('%crouteImages:', 'background-color:orange;color:white;', routeImages);
    } else {
      setAreImagesLoaded(true);
    }
  };

  const renderDialogFooter = useMemo(() => {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <SecondaryBtn
          bColor={colors.themeBlue}
          bColorHover={colors.themeSecondaryHover}
          onClick={() => setIsDownloadDialogOpen(false)}
        >
          {t(`${driverReportTranslationsPath}.cancelText`)}
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

  return (
    <StyledCard>
      {reportData ? (
        <StyledReportContainer isDirectionRtl={reducerState.isDirectionRtl}>
          <header className="driver-reports-output__header">
            <h1 className="driver-reports-output__driver-report-heading">
              {t(`${driverReportTranslationsPath}.reportData.driverReportHeading`).toUpperCase()}
            </h1>

            <div className="driver-reports-output__report-range-container">
              <p className="driver-reports-output__report-range-heading">
                {t(`${driverReportTranslationsPath}.reportData.from`).toUpperCase()}
              </p>
              <p className="driver-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[0]).format('DD-MMM-YYYY') : '-'}
              </p>
              <p className="driver-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[0]).format('hh:mm A') : '-'}
              </p>
            </div>
            <div className="driver-reports-output__report-range-container">
              <p className="driver-reports-output__report-range-heading">
                {' '}
                {t(`${driverReportTranslationsPath}.reportData.till`).toUpperCase()}
              </p>
              <p className="driver-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[1]).format('DD-MMM-YYYY') : '-'}
              </p>
              <p className="driver-reports-output__report-range-value">
                {data?.dates?.[0] ? moment(data.dates[1]).format('hh:mm A') : '-'}
              </p>
            </div>
          </header>

          <section className="driver-reports-output__driver-information-container">
            <Heading1>{t(`${driverReportTranslationsPath}.reportData.driverInformationHeading`)}</Heading1>

            <div className="driver-reports-output__driver-information">
              <div className="driver-reports-output__driver-information-left">
                {Object.keys(driverDetails).map((detailName, index) => {
                  return (
                    <div key={index} className="driver-reports-output__detail">
                      <p className="driver-reports-output__detail-title">{detailName}</p>
                      <p className="driver-reports-output__detail-value">
                        {driverDetails[detailName as keyof DriverDetailsType]}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="driver-reports-output__driver-information-right">
                {reportData?.driver_detail?.driver_media_url && (
                  <S3Image style={DriverS3ImageStyle} url={reportData.driver_detail.driver_media_url} />
                )}
              </div>
            </div>
          </section>

          <section className="driver-reports-output__driver-stats-container">
            <Heading1>{t(`${driverReportTranslationsPath}.reportData.driverStatsHeading`)}</Heading1>

            <div className="driver-reports-output__driver-stats">
              {Object.keys(driverStats).map((detailName, index) => {
                return (
                  <div key={index} className="driver-reports-output__detail">
                    <p className="driver-reports-output__detail-title">{detailName}</p>
                    <p className="driver-reports-output__detail-value">
                      {driverStats[detailName as keyof DriverStatsType]}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="driver-reports-output__events-information-container">
            <Heading1>{t(`${driverReportTranslationsPath}.reportData.eventsInformationHeading`)}</Heading1>

            <div className="driver-reports-output__events-information">
              {Object.keys(eventsDetails).map((detailName, index) => {
                return (
                  <div key={index} className="driver-reports-output__detail">
                    <p className="driver-reports-output__detail-title">{detailName}</p>
                    <p className="driver-reports-output__detail-value">
                      {eventsDetails[detailName as keyof EventsDetailsType]}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="driver-report-output__total-sessions-container">
            <Heading1>
              {t(`${driverReportTranslationsPath}.reportData.totalSessionsHeading`)}{' '}
              {reportBySessionData.length > 0 && `(${reportBySessionData.length})`}
            </Heading1>
            {driverReportBySessionQueryState.isLoading ? (
              <div className="driver-reports-output__total-sessions-loading-container">
                <Spinner />
              </div>
            ) : (
              !reportBySessionData ||
              (reportBySessionData.length === 0 ? (
                <p>{t(`${driverReportTranslationsPath}.reportData.noSessionsText`)}</p>
              ) : (
                <>
                  <TotalSessions
                    reportBySessionData={reportBySessionData}
                    geoJSONData={geoJSONData}
                    mapRouteImages={mapRouteImages}
                    setMapRouteImages={setMapRouteImages}
                  />
                </>
              ))
            )}
          </div>

          <FlexRow style={{ margin: '6rem 0 0', marginLeft: 'auto' }}>
            <Btn variant="theme" onClick={onDownloadPDFButtonClick}>
              {t(`${driverReportTranslationsPath}.downloadPDFText`)}
            </Btn>

            <Dialog
              header={t(`${driverReportTranslationsPath}.downloadDriverReportText`)}
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
                      {t(`${driverReportTranslationsPath}.preparingPDFMessage`)}
                    </p>
                    <p className="download-pdf-dialog__info-text">
                      {t(`${driverReportTranslationsPath}.downloadPDFMessage`)}
                    </p>
                  </div>
                ) : (
                  <div className="download-pdf-dialog__download-pdf-button-container">
                    <DownloadBtn
                      fileName={fileName ?? 'document'}
                      document={
                        <DriverReportDoc
                          isDirectionRtl={reducerState.isDirectionRtl}
                          reportData={reportData}
                          metaData={metaData}
                          reportBySessionData={reportBySessionData}
                          driverImage={driverImage}
                          mapRouteImages={mapRouteImages}
                        />
                      }
                    >
                      {({ blob, url, loading, error }) =>
                        loading
                          ? t(`${driverReportTranslationsPath}.loadingDocumentText`)
                          : t(`${driverReportTranslationsPath}.downloadPDFText`)
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
                  <DriverReportDoc
                    reportData={reportData}
                    metaData={metaData}
                    reportBySessionData={reportBySessionData}
                    driverImage={driverImage}
                    mapRouteImages={mapRouteImages}
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
          <DriverInfoItem>{t(`${driverReportTranslationsPath}.selectReport`)}</DriverInfoItem>
        </Center>
      )}

      {/* <PDFViewer style={{ width: '100%', height: '600px' }}>
        <DriverReportDoc
          isDirectionRtl={reducerState.isDirectionRtl}
          reportData={reportData}
          metaData={metaData}
          reportBySessionData={reportBySessionData}
          driverImage={driverImage}
          mapRouteImages={mapRouteImages}
        />
      </PDFViewer> */}
    </StyledCard>
  );
};

export default DriverReportsOutput;

const Heading1 = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  background-color: var(--app-primary-color);
  color: white;
  padding: 6px 20px;
  margin-bottom: 0.5rem;
  text-align: center;

  @media screen and (max-width: 500px) {
    font-size: 1rem;
  }
`;

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

const StyledReportContainer = styled.div<{ isDirectionRtl: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 16px;

  .driver-reports-output__header {
    width: 100%;
    max-width: 750px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: center;
  }

  .driver-reports-output__driver-report-heading {
    font-size: 24px;
    font-weight: bold;
    grid-column: 1/3;
    text-align: center;
  }

  .driver-reports-output__report-range-container {
    display: grid;
    place-items: center;
    font-size: 12px;
  }

  .driver-reports-output__report-range-heading {
    margin: 0;
    font-weight: bold;
  }

  .driver-reports-output__report-range-value {
    margin: 0;
    text-align: center;
    direction: ltr;
  }

  .driver-reports-output__driver-information-container,
  .driver-reports-output__driver-stats-container,
  .driver-reports-output__events-information-container,
  .driver-report-output__total-sessions-container {
    width: 100%;
    max-width: 750px;
  }

  .driver-reports-output__total-sessions-loading-container {
    display: flex;
  }

  .driver-reports-output__driver-information {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    width: 100%;
    max-width: 750px;
    column-gap: 28px;
  }

  .driver-reports-output__driver-information-left {
    display: grid;
    row-gap: 8px;
    margin-top: 5px;
  }

  .driver-reports-output__driver-information-right {
    margin-bottom: 20px;
  }

  .driver-reports-output__driver-stats {
    display: grid;
    row-gap: 8px;
  }

  .driver-reports-output__events-information {
    display: grid;
    row-gap: 8px;
  }

  .driver-reports-output__detail {
    display: flex;
    flex-direction: column;
    font-size: 12px;
  }

  .driver-reports-output__detail-title {
    font-weight: bold;
    margin: 0;
  }
  .driver-reports-output__detail-value {
    margin: 0;
    direction: ltr;
    text-align: ${(props) => (props.isDirectionRtl ? 'right' : 'left')};
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

const DriverImage = styled.img`
  width: 10.25rem;
  height: 10rem;
  object-fit: cover;
  border-radius: 0.75rem;
`;

const DriverS3ImageStyle: CSSProperties = {
  width: '10.25rem',
  height: '10rem',
  objectFit: 'cover',
};

const DriverInfoItem = styled.p`
  margin: 0;
  font-size: 12px;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  row-gap: 1rem;
  padding: 20px 0;
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
