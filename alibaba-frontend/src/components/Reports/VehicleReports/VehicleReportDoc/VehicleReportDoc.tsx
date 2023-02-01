import { useMemo } from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { LogoThemePng } from 'global/image';
import { convertToSecondsToHourMinutes } from 'global/utils';
import { vehicleReportTranslationsPath } from 'global/variables';

import totalSessions from 'components/Reports/VehicleReports/TotalSessions/totalSessionsMockData';

import Fonts from 'assets/Fonts/index';

import { SessionType, TripType, VehicleReportDocProps } from './types';

Font.register({
  family: 'Almarai',
  fonts: [
    {
      src: Fonts.AlmaraiRegular,
    },
    {
      src: Fonts.AlmaraiLight,
      fontWeight: 'light',
    },
    {
      src: Fonts.AlmaraiBold,
      fontWeight: 'bold',
    },
    {
      src: Fonts.AlmaraiExtraBold,
      fontWeight: 'extrabold',
    },
  ],
});

const fontFamily = 'Almarai';

export default function VehicleReportDoc(props: VehicleReportDocProps) {
  const {
    isDirectionRtl,
    detailTypeToLanguageTextMap,
    tripsData,
    reportData,
    lastUpdated,
    metaData,
    reportBySessionData,
    vehicleImage,
    driverImage,
    mapRouteImages,
  } = props;

  const { t } = useTranslation();

  const metaDetails: any = useMemo(() => {
    return {
      userMeta: {
        [`${t(`${vehicleReportTranslationsPath}.reportData.companyName`)}`]: metaData.companyName,
        [`${t(`${vehicleReportTranslationsPath}.reportData.userEmail`)}`]: metaData.userEmail,
        [`${t(`${vehicleReportTranslationsPath}.reportData.userDesignation`)}`]: metaData.userDesignation,
      },
      reportMeta: {
        [`${t(`${vehicleReportTranslationsPath}.reportData.reportGeneratedOn`)}`]: moment(Date.now()).format(
          'DD-MMM-YYYY',
        ),
        [`${t(`${vehicleReportTranslationsPath}.reportData.startDate`)}`]: metaData.dates?.[0]
          ? moment(metaData.dates[0]).format('DD-MMM-YYYY | hh:mm A')
          : '-',
        [`${t(`${vehicleReportTranslationsPath}.reportData.endDate`)}`]: metaData.dates?.[1]
          ? moment(metaData.dates[1]).format('DD-MMM-YYYY | hh:mm A')
          : '-',
      },
    };
  }, [t, metaData.companyName, metaData.dates, metaData.userDesignation, metaData.userEmail]);

  const vehicleDetails: any = useMemo(() => {
    return {
      [`${t(`${vehicleReportTranslationsPath}.reportData.vehicleName`)}`]:
        reportData?.vehicle_detail?.make_model || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.vehiclePlateNo`)}`]:
        reportData?.vehicle_detail?.vehicle_plate_no || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.vinNumber`)}`]: reportData?.vehicle_detail?.chassis_no || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.distanceCovered`)}`]: reportData?.total_distance
        ? reportData.total_distance.toFixed(2).toString() + ' KM'
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.distanceCoveredPerDay`)}`]: reportData?.distance_per_day
        ? `${reportData?.distance_per_day.toFixed(2)} KM`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.lastLocation`)}`]:
        reportData?.last_location?.location?.toString() ?? '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.lastOnline`)}`]: reportData?.last_online?.epochtime
        ? moment.unix(parseInt(reportData.last_online.epochtime)).format('DD-MMM-YYYY | hh:mm A')
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.startLocation`)}`]:
        reportData?.start_location?.location || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.endLocation`)}`]: reportData?.end_location?.location || '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.maxSpeed`)}`]: reportData?.max_speed
        ? `${reportData?.max_speed} km/h`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.averageSpeed`)}`]: reportData?.avg_speed
        ? `${reportData?.avg_speed.toFixed(2)} km/h`
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.travelTime`)}`]: reportData?.travel_time
        ? convertToSecondsToHourMinutes(reportData?.travel_time)
        : '-',
      [`${t(`${vehicleReportTranslationsPath}.reportData.travelTimePerDay`)}`]: reportData?.travel_time_per_day
        ? convertToSecondsToHourMinutes(reportData?.travel_time_per_day)
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
    reportData?.vehicle_detail?.chassis_no,
    reportData?.vehicle_detail?.make_model,
    reportData?.vehicle_detail?.vehicle_plate_no,
  ]);

  const driverDetails = useMemo(() => {
    return {
      driverInVehicle:
        reportData?.current_driver && reportData?.current_driver?.status !== 404
          ? `${reportData.current_driver?.driver_first_name} ${reportData.current_driver?.driver_last_name}`
          : '-',
      authStatus:
        reportData?.auth_status === true
          ? t(`${vehicleReportTranslationsPath}.reportData.authorizedText`)
          : reportData?.auth_status === false
          ? t(`${vehicleReportTranslationsPath}.reportData.unauthorizedText`)
          : '-',
      lastUpdated: lastUpdated,
    };
  }, [t, lastUpdated, reportData?.auth_status, reportData?.current_driver]);

  const totalTrips: TripType[] = tripsData.map((trip: any, index: number) => {
    return {
      tripID: trip?.trip_id || index,
      startedAt: trip?.start_time ? moment(trip?.start_time).format('DD-MMM-YYYY | hh:mm A') : '-',
      endedAt: trip?.end_time ? moment(trip?.end_time).format('DD-MMM-YYYY | hh:mm A') : '-',
      totalTime: [undefined, null].includes(trip?.total_time) ? '-' : convertToSecondsToHourMinutes(trip?.total_time),
      travelTime: [undefined, null].includes(trip?.travel_time)
        ? '-'
        : convertToSecondsToHourMinutes(trip?.travel_time),
      idleTime: [undefined, null].includes(trip?.idle_time) ? '-' : convertToSecondsToHourMinutes(trip?.idle_time),
      startLocation: trip?.start_location?.location || '-',
      endLocation: trip?.end_location?.location || '-',
      distanceDriven: [undefined, null].includes(trip?.total_distance) ? '-' : `${trip?.total_distance.toFixed(2)} KM`,
      averageSpeed: [undefined, null].includes(trip?.avg_speed) ? '-' : `${trip?.avg_speed.toFixed(2)} km/h`,
      maxSpeed: [undefined, null].includes(trip?.max_speed) ? '-' : `${trip?.max_speed.toFixed(2)} km/h`,
      drivers: trip?.driver_details,
      totalEvents: trip?.anomaly_count ?? '-',
      distractedEvents: trip?.distracted_count ?? '-',
      drowsyEvents: trip?.drowsy_count ?? '-',
      overSpeeding: '-',
      hardAcceleration: '-',
      harshBrakes: '-',
      sharpTurns: '-',
      sessions: trip.sessions.map((session: any) => {
        return {
          sessionID: session.session_id,
          startedAt: session?.start_time ? moment(session?.start_time).format('DD-MMM-YYYY | hh:mm A') : '-',
          endedAt: session?.end_time ? moment(session?.end_time).format('DD-MMM-YYYY | hh:mm A') : '-',
          totalTime: [undefined, null].includes(session?.total_time)
            ? '-'
            : convertToSecondsToHourMinutes(session?.total_time),
          travelTime: [undefined, null].includes(session?.travel_time)
            ? '-'
            : convertToSecondsToHourMinutes(session?.travel_time),
          idleTime: [undefined, null].includes(session?.total_idle_time)
            ? '-'
            : convertToSecondsToHourMinutes(session?.total_idle_time),
          startLocation: session?.start_location?.location || '-',
          endLocation: session?.end_location?.location || '-',
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

  // const totalSessions: SessionType[] = reportBySessionData.map((session: any) => {
  //   return {
  //     sessionID: session.session_id,
  //     startedAt: session?.start_time ? moment(session?.start_time).format('DD-MMM-YYYY | hh:mm A') : '-',
  //     endedAt: session?.end_time ? moment(session?.end_time).format('DD-MMM-YYYY | hh:mm A') : '-',
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

  console.log('generated', totalTrips);

  const styles = StyleSheet.create({
    currentDriverContainer: {
      marginTop: 15,
    },
    currentDriverDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: 14,
      marginTop: 8,
    },
    currentDriverDetailContainer: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    currentDriverDetailLeft: {},
    currentDriverDetailRight: {},
    currentDriverDetailTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    currentDriverDetailValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
    },
    currentDriverDetailValueAuthorized: {
      backgroundColor: '#43ca82',
      color: 'white',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    currentDriverDetailValueUnAuthorized: {
      backgroundColor: '#f47878',
      color: 'white',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    currentDriverHeading: {
      marginBottom: 10,
      fontSize: 24,
      fontFamily: fontFamily,
      fontWeight: 'extrabold',
      backgroundColor: '#447abb',
      color: 'white',
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
    },
    driverImageContainer: {
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 5,
    },
    logo: {
      height: 30,
      width: 130,
    },
    logoContainer: {
      paddingTop: 20,
    },
    page: {
      paddingHorizontal: 20,
    },
    reportHeading: {
      fontSize: 30,
      textAlign: 'center',
      fontFamily: fontFamily,
      fontWeight: 'extrabold',
    },
    reportMetaDetailsContainer: {
      marginTop: 10,
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    reportMetaDetailsLeft: {},
    reportMetaDetailRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    reportMetaDetailsRight: {},
    reportMetaDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      fontSize: 12,
      marginTop: 8,
    },
    reportMetaDetailTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    reportMetaDetailValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
    },
    sessionDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      fontSize: 12,
    },
    sessionDetailContainerTop: {},
    sessionDetailContainerDown: {
      marginTop: 20,
    },
    sessionDetailHeading: {
      fontSize: 20,
      fontWeight: 'extrabold',
      textAlign: isDirectionRtl ? 'right' : 'left',
    },
    sessionDetailColumn: {
      marginTop: 20,
      flex: 0.5,
    },
    sessionDetailTitle: {
      fontWeight: 'bold',
    },
    sessionDetailValue: {
      fontWeight: 'light',
    },
    sessionDetailsContainer: {
      marginTop: 20,
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    sessionTripHeading: {
      fontSize: 30,
      textAlign: 'center',
      fontWeight: 'extrabold',
    },
    sessionHeading: {
      fontSize: 24,
      marginBottom: 5,
      textAlign: 'center',
      fontWeight: 'extrabold',
    },
    sessionMapContainer: {
      height: 310,
      width: '90%',
      marginTop: 5,
      backgroundColor: 'silver',
    },
    sessionMapDivision: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    sessionPage: {
      paddingBottom: 30,
      paddingHorizontal: 20,
      fontFamily: fontFamily,
    },
    sessionTotalEventsText: {
      fontSize: 14,
    },
    vehicleImageContainer: {
      alignItems: 'center',
      marginBottom: 10,
    },
    vehicleInformationContainer: {
      marginTop: 15,
    },
    vehicleInformationDetailsContainer: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    vehicleInformationDetailsLeft: {
      flex: 0.5,
      paddingLeft: 10,
    },
    vehicleInformationDetailsRight: {
      flex: 0.5,
    },
    vehicleInformationDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      fontSize: 14,
    },
    vehicleInformationTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    vehicleInformationHeading: {
      marginBottom: 5,
      fontSize: 24,
      fontFamily: fontFamily,
      fontWeight: 'extrabold',
      backgroundColor: '#447abb',
      color: 'white',
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
    },
    vehicleInformationValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src={LogoThemePng} style={styles.logo} />
        </View>

        <Text style={styles.reportHeading}>
          {t(`${vehicleReportTranslationsPath}.reportData.vehicleReportHeading`)}
        </Text>

        <View style={styles.reportMetaDetailsContainer}>
          <View style={styles.reportMetaDetailsLeft}>
            {Object.keys(metaDetails).map((detailType) => {
              return (
                <View key={detailType}>
                  {Object.keys(metaDetails[detailType]).map((detail) => {
                    return (
                      <View key={detail} style={styles.reportMetaDetail}>
                        <Text style={styles.reportMetaDetailTitle}>{detail}</Text>
                        <Text>
                          {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                        </Text>
                        <Text style={styles.reportMetaDetailValue}>{metaDetails[detailType][detail]}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

          <View style={styles.reportMetaDetailsRight}>
            {vehicleImage && (
              <View style={styles.vehicleImageContainer}>
                <Image
                  src={vehicleImage}
                  style={{
                    width: 150,
                    height: 120,
                  }}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.vehicleInformationContainer}>
          <Text style={styles.vehicleInformationHeading}>
            {t(`${vehicleReportTranslationsPath}.reportData.vehicleInformationHeading`)}
          </Text>

          <View style={styles.vehicleInformationDetailsContainer}>
            <View style={styles.vehicleInformationDetailsLeft}>
              {Object.keys(vehicleDetails)
                .slice(0, 7)
                .map((detailType: any) => {
                  return (
                    <View style={styles.vehicleInformationDetail}>
                      <Text style={styles.vehicleInformationTitle}>{detailType}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.vehicleInformationValue}>{vehicleDetails[detailType]}</Text>
                    </View>
                  );
                })}
            </View>

            <View style={styles.vehicleInformationDetailsRight}>
              {Object.keys(vehicleDetails)
                .slice(7)
                .map((detailType: any) => {
                  return (
                    <View style={styles.vehicleInformationDetail}>
                      <Text style={styles.vehicleInformationTitle}>{detailType}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.vehicleInformationValue}>{vehicleDetails[detailType]}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>

        <View style={styles.currentDriverContainer}>
          <Text style={styles.currentDriverHeading}>
            {t(`${vehicleReportTranslationsPath}.reportData.driverInformationHeading`)}
          </Text>

          <View style={styles.currentDriverDetailContainer}>
            <View style={styles.currentDriverDetailLeft}>
              <View style={styles.currentDriverDetail}>
                <Text style={styles.currentDriverDetailTitle}>
                  {reportData?.auth_status === true
                    ? t(`${vehicleReportTranslationsPath}.reportData.currentDriver`)
                    : t(`${vehicleReportTranslationsPath}.reportData.lastDriver`)}
                </Text>
                <Text>
                  {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                </Text>
                <Text style={styles.currentDriverDetailValue}>{driverDetails.driverInVehicle}</Text>
              </View>

              <View style={styles.currentDriverDetail}>
                <Text style={styles.currentDriverDetailTitle}>
                  {t(`${vehicleReportTranslationsPath}.reportData.authenticationStatus`)}
                </Text>
                <Text>
                  {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                </Text>
                <Text
                  style={[
                    styles.currentDriverDetailValue,
                    driverDetails.authStatus === 'Authorized'
                      ? styles.currentDriverDetailValueAuthorized
                      : styles.currentDriverDetailValueUnAuthorized,
                  ]}
                >
                  {driverDetails.authStatus}
                </Text>
              </View>

              <View style={styles.currentDriverDetail}>
                <Text style={styles.currentDriverDetailTitle}>
                  {t(`${vehicleReportTranslationsPath}.reportData.lastUpdated`)}
                </Text>
                <Text>
                  {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                </Text>
                <Text style={styles.currentDriverDetailValue}>{driverDetails.lastUpdated}</Text>
              </View>
            </View>

            <View style={styles.currentDriverDetailRight}>
              {driverImage && (
                <View style={styles.driverImageContainer}>
                  <Image
                    src={driverImage}
                    style={{
                      width: 90,
                      height: 90,
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>

      {totalTrips.map((trip: TripType, tripIndex: number) => {
        return (
          <>
            <Page key={trip.tripID} size="A4" style={styles.sessionPage}>
              <View style={styles.logoContainer}>
                <Image src={LogoThemePng} style={styles.logo} />
              </View>

              <Text style={styles.sessionTripHeading}>{`${t(`${vehicleReportTranslationsPath}.reportData.tripText`)} ${
                tripIndex + 1
              }`}</Text>

              {mapRouteImages[trip.tripID] ? (
                <View style={styles.sessionMapDivision}>
                  <View style={styles.sessionMapContainer}>
                    <Image
                      src={mapRouteImages[trip.tripID]}
                      style={{
                        height: '100%',
                        width: '100%',
                      }}
                    />
                  </View>
                </View>
              ) : null}

              <View style={styles.sessionDetailsContainer}>
                <View style={styles.sessionDetailColumn}>
                  <View style={styles.sessionDetailContainerTop}>
                    <Text style={styles.sessionDetailHeading}>
                      {t(`${vehicleReportTranslationsPath}.reportData.timeHeading`)}
                    </Text>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['startedAt']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.startedAt}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['endedAt']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.endedAt}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['totalTime']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.totalTime}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['idleTime']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.idleTime}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['travelTime']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.travelTime}</Text>
                    </View>
                  </View>

                  <View style={styles.sessionDetailContainerDown}>
                    <Text style={styles.sessionDetailHeading}>
                      {t(`${vehicleReportTranslationsPath}.reportData.vehicleHeading`)}
                    </Text>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['startLocation']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.startLocation}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['endLocation']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.endLocation}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['distanceDriven']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.distanceDriven}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['maxSpeed']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.maxSpeed}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['avgSpeed']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.averageSpeed}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sessionDetailColumn}>
                  <View style={styles.sessionDetailContainerTop}>
                    <Text style={styles.sessionDetailHeading}>
                      {t(`${vehicleReportTranslationsPath}.reportData.driversHeading`)}
                    </Text>

                    <View style={styles.sessionDetail}>
                      {trip.drivers?.map((driver: any) => {
                        return (
                          <Text key={driver} style={styles.sessionDetailValue}>{`${driver?.driver_first_name || ''} ${
                            driver?.driver_last_name || ''
                          }`}</Text>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.sessionDetailContainerDown}>
                    <Text style={styles.sessionDetailHeading}>
                      {t(`${vehicleReportTranslationsPath}.reportData.eventHeading`)}
                    </Text>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['totalEvents']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.totalEvents}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['distractedEvents']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.distractedEvents}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['drowsyEvents']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.drowsyEvents}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['overSpeeding']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.overSpeeding}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['hardAcceleration']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.hardAcceleration}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['harshBrakes']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.harshBrakes}</Text>
                    </View>

                    <View style={styles.sessionDetail}>
                      <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['sharpTurns']}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.sessionDetailValue}>{trip.sharpTurns}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Page>

            {/* {trip.sessions.map((session: SessionType, index: number) => {
              return (
                <Page key={session.sessionID} size="A4" style={styles.sessionPage}>
                  <View style={styles.logoContainer}>
                    <Image src={LogoThemePng} style={styles.logo} />
                  </View>

                  <Text style={styles.sessionTripHeading}>{`${t(
                    `${vehicleReportTranslationsPath}.reportData.tripText`,
                  )} ${tripIndex + 1}`}</Text>
                  <Text style={styles.sessionHeading}>{`${t(
                    `${vehicleReportTranslationsPath}.reportData.sessionText`,
                  )} ${index + 1}`}</Text>

                  <View style={styles.sessionMapDivision}>
                    <View style={styles.sessionMapContainer}>
                      <Image
                        src={mapRouteImages[session.sessionID]}
                        style={{
                          height: '100%',
                          width: '100%',
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.sessionDetailsContainer}>
                    <View style={styles.sessionDetailColumn}>
                      <View style={styles.sessionDetailContainerTop}>
                        <Text style={styles.sessionDetailHeading}>
                          {t(`${vehicleReportTranslationsPath}.reportData.timeHeading`)}
                        </Text>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['startedAt']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.startedAt}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['endedAt']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.endedAt}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['totalTime']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.totalTime}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['idleTime']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.idleTime}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['travelTime']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.travelTime}</Text>
                        </View>
                      </View>

                      <View style={styles.sessionDetailContainerDown}>
                        <Text style={styles.sessionDetailHeading}>
                          {t(`${vehicleReportTranslationsPath}.reportData.vehicleHeading`)}
                        </Text>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['startLocation']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.startLocation}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['endLocation']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.endLocation}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['distanceDriven']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.distanceDriven}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['maxSpeed']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.maxSpeed}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['avgSpeed']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.averageSpeed}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sessionDetailColumn}>
                      <View style={styles.sessionDetailContainerTop}>
                        <Text style={styles.sessionDetailHeading}>
                          {t(`${vehicleReportTranslationsPath}.reportData.driversHeading`)}
                        </Text>

                        <View style={styles.sessionDetail}>
                          {session.drivers?.map((driver: any, index: number) => {
                            return (
                              <Text key={index} style={styles.sessionDetailValue}>{`${
                                driver?.driver_first_name || ''
                              } ${driver?.driver_last_name || ''}`}</Text>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.sessionDetailContainerDown}>
                        <Text style={styles.sessionDetailHeading}>
                          {t(`${vehicleReportTranslationsPath}.reportData.eventHeading`)}
                        </Text>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['totalEvents']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.totalEvents}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>
                            {detailTypeToLanguageTextMap['distractedEvents']}
                          </Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.distractedEvents}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['drowsyEvents']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.drowsyEvents}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['overSpeeding']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.overSpeeding}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>
                            {detailTypeToLanguageTextMap['hardAcceleration']}
                          </Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.hardAcceleration}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['harshBrakes']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.harshBrakes}</Text>
                        </View>

                        <View style={styles.sessionDetail}>
                          <Text style={styles.sessionDetailTitle}>{detailTypeToLanguageTextMap['sharpTurns']}</Text>
                          <Text>
                            {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                          </Text>
                          <Text style={styles.sessionDetailValue}>{session.sharpTurns}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Page>
              );
            })} */}
          </>
        );
      })}
    </Document>
  );
}
