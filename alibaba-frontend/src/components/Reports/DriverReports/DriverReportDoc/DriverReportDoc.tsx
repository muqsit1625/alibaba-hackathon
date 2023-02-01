import React, { useMemo } from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { LogoThemePng } from 'global/image';
import { convertToSecondsToHourMinutes } from 'global/utils';
import { driverReportTranslationsPath } from 'global/variables';

import { DriverReportDocProps, SessionType } from './types';

const fontFamily = 'Almarai';

export default function DriverReportDoc(props: DriverReportDocProps) {
  const { t } = useTranslation();

  const { isDirectionRtl, reportData, reportBySessionData, metaData, driverImage, mapRouteImages } = props;

  const metaDetails: any = useMemo(() => {
    return {
      userMeta: {
        [`${t(`${driverReportTranslationsPath}.reportData.companyName`)}`]: metaData.companyName,
        [`${t(`${driverReportTranslationsPath}.reportData.userEmail`)}`]: metaData.userEmail,
        [`${t(`${driverReportTranslationsPath}.reportData.userDesignation`)}`]: metaData.userDesignation,
      },
      reportMeta: {
        [`${t(`${driverReportTranslationsPath}.reportData.reportGeneratedOn`)}`]: moment(Date.now()).format(
          'DD-MMM-YYYY',
        ),
        [`${t(`${driverReportTranslationsPath}.reportData.startDate`)}`]: metaData.dates?.[0]
          ? moment(metaData.dates[0]).format('DD-MMM-YYYY | hh:mm A')
          : '-',
        [`${t(`${driverReportTranslationsPath}.reportData.endDate`)}`]: metaData.dates?.[1]
          ? moment(metaData.dates[1]).format('DD-MMM-YYYY | hh:mm A')
          : '-',
      },
    };
  }, [t, metaData.companyName, metaData.dates, metaData.userDesignation, metaData.userEmail]);

  const driverDetails: {
    [key: string]: string;
  } = useMemo(() => {
    return {
      [`${t(`${driverReportTranslationsPath}.reportData.driverName`)}`]: `${
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
    reportData?.driver_detail?.address,
    reportData?.driver_detail?.cnic,
    reportData?.driver_detail?.created_at,
    reportData?.driver_detail?.driver_first_name,
    reportData?.driver_detail?.driver_last_name,
    reportData?.driver_detail?.license_number,
    reportData?.driver_detail?.phone_number,
    reportData?.total_distance,
    reportData?.total_idle_time,
    reportData?.total_time,
  ]);

  const eventsDetails: {
    [key: string]: string | number;
  } = useMemo(() => {
    return {
      [`${t(`${driverReportTranslationsPath}.reportData.totalEvents`)}`]: reportData?.total_events || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.averageEventsPerDay`)}`]: reportData?.average_events
        ? Math.trunc(reportData?.average_events)
        : '-',
      [`${t(`${driverReportTranslationsPath}.reportData.distractedCount`)}`]: reportData?.distracted_count || '-',
      [`${t(`${driverReportTranslationsPath}.reportData.drowsyCount`)}`]: reportData?.drowsy_count || '-',
    };
  }, [t, reportData?.average_events, reportData?.distracted_count, reportData?.drowsy_count, reportData?.total_events]);

  const totalSessions: SessionType[] = reportBySessionData.map((session: any) => {
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

  const styles = StyleSheet.create({
    eventsContainer: {
      marginTop: 15,
    },
    eventsDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      fontSize: 14,
      marginTop: 8,
    },
    eventsDetailContainer: {},
    eventsDetailTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    eventsDetailValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
    },
    eventsHeading: {
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
    driverImageContainer: {
      alignItems: 'center',
      marginBottom: 10,
    },
    driverInformationContainer: {
      marginTop: 15,
    },
    driverInformationDetailsContainer: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    driverInformationDetailsLeft: {
      flex: 0.45,
    },
    driverInformationDetailsRight: {
      flex: 0.45,
    },
    driverInformationDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      fontSize: 14,
    },
    driverInformationTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    driverInformationHeading: {
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
    driverInformationValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
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
    reportMetaDetailRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    reportMetaDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
      fontSize: 12,
      marginTop: 8,
    },
    reportMetaDetailSection: {
      fontSize: 12,
    },
    reportMetaDetailsLeft: {},
    reportMetaDetailTitle: {
      fontFamily: fontFamily,
      fontWeight: 'bold',
    },
    reportMetaDetailsRight: {},
    reportMetaDetailValue: {
      fontFamily: fontFamily,
      fontWeight: 'light',
    },
    sessionDetail: {
      display: 'flex',
      flexDirection: isDirectionRtl ? 'row-reverse' : 'row',
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
      fontWeight: 'semibold',
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
    sessionHeading: {
      fontSize: 30,
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
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src={LogoThemePng} style={styles.logo} />
        </View>

        <Text style={styles.reportHeading}>
          {t(`${driverReportTranslationsPath}.reportData.driverReportHeading`).toUpperCase()}
        </Text>

        <View style={styles.reportMetaDetailsContainer}>
          <View style={styles.reportMetaDetailsLeft}>
            {Object.keys(metaDetails).map((detailType) => {
              return (
                <View key={detailType} style={styles.reportMetaDetailSection}>
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
            {driverImage && (
              <View style={styles.driverImageContainer}>
                <Image
                  src={driverImage}
                  style={{
                    width: 100,
                    height: 120,
                  }}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.driverInformationContainer}>
          <Text style={styles.driverInformationHeading}>
            {t(`${driverReportTranslationsPath}.reportData.driverInformationHeading`)}
          </Text>

          <View style={styles.driverInformationDetailsContainer}>
            <View style={styles.driverInformationDetailsLeft}>
              {Object.keys(driverDetails)
                .slice(0, 6)
                .map((detailName) => {
                  return (
                    <View key={detailName} style={styles.driverInformationDetail}>
                      <Text style={styles.driverInformationTitle}>{detailName}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.driverInformationValue}>{driverDetails[detailName]}</Text>
                    </View>
                  );
                })}
            </View>

            <View style={styles.driverInformationDetailsRight}>
              {Object.keys(driverDetails)
                .slice(6)
                .map((detailName) => {
                  return (
                    <View key={detailName} style={styles.driverInformationDetail}>
                      <Text style={styles.driverInformationTitle}>{detailName}</Text>
                      <Text>
                        {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                      </Text>
                      <Text style={styles.driverInformationValue}>{driverDetails[detailName]}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>

        <View style={styles.eventsContainer}>
          <Text style={styles.eventsHeading}>
            {t(`${driverReportTranslationsPath}.reportData.eventsInformationHeading`)}
          </Text>

          <View style={styles.eventsDetailContainer}>
            {Object.keys(eventsDetails).map((eventName) => {
              return (
                <View key={eventName} style={styles.eventsDetail}>
                  <Text style={styles.eventsDetailTitle}>{eventName}</Text>
                  <Text>
                    {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                  </Text>
                  <Text style={styles.eventsDetailValue}>{eventsDetails[eventName]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Page>

      {totalSessions.map((session, index) => {
        return (
          <Page key={session.sessionID} size="A4" style={styles.sessionPage}>
            <View style={styles.logoContainer}>
              <Image src={LogoThemePng} style={styles.logo} />
            </View>

            <Text style={styles.sessionHeading}>{`${t(`${driverReportTranslationsPath}.reportData.sessionText`)} ${
              index + 1
            }`}</Text>

            <View style={styles.sessionMapDivision}>
              <View style={styles.sessionMapContainer}>
                {mapRouteImages[session.sessionID] && (
                  <Image
                    src={mapRouteImages[session.sessionID]}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  />
                )}
              </View>
            </View>

            <View style={styles.sessionDetailsContainer}>
              <View style={styles.sessionDetailColumn}>
                <View style={styles.sessionDetailContainerTop}>
                  <Text style={styles.sessionDetailHeading}>
                    {t(`${driverReportTranslationsPath}.reportData.timeHeading`).toUpperCase()}
                  </Text>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.startedAt`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.startedAt}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.endedAt`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.endedAt}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.totalTime`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.totalTime}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.travelTime`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.travelTime}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.idleTime`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.idleTime}</Text>
                  </View>
                </View>

                <View style={styles.sessionDetailContainerDown}>
                  <Text style={styles.sessionDetailHeading}>
                    {t(`${driverReportTranslationsPath}.reportData.vehicleHeading`).toUpperCase()}
                  </Text>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.distanceDriven`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.distanceDriven}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.maxSpeed`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.maxSpeed}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.averageSpeed`)}
                    </Text>
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
                    {t(`${driverReportTranslationsPath}.reportData.eventsHeading`).toUpperCase()}
                  </Text>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.totalEvents`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.totalEvents}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.distractedEvents`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.distractedEvents}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.drowsyEvents`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.drowsyEvents}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.overSpeeding`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.overSpeeding}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.hardAcceleration`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.hardAcceleration}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.harshBrakes`)}
                    </Text>
                    <Text>
                      {isDirectionRtl ? ' ' : ''}:{!isDirectionRtl ? ' ' : ''}
                    </Text>
                    <Text style={styles.sessionDetailValue}>{session.harshBrakes}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailTitle}>
                      {t(`${driverReportTranslationsPath}.reportData.sharpTurns`)}
                    </Text>
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
      })}
    </Document>
  );
}
