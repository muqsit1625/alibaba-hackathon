import moment from 'moment';

export const getBase64StringFromDataURL = (dataURL: any) => dataURL.replace('data:', '').replace(/^.+,/, '');

export const convertToBase64 = (file: File, callback: Function): void => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = getBase64StringFromDataURL(reader.result);
    callback(file, base64);
  };
  reader.readAsDataURL(file);
};

export const convertToMinutes = (time: number) => {
  return time / 60;
};

export const convertToHours = (time: number) => {
  return time / 3600;
};

export const convertToSecondsToHourMinutes = (time: number): string => {
  if (time < 60) {
    return `${Math.trunc(time)} Sec`;
  }

  if (time < 3600) {
    return `${Math.trunc(time / 60)} Min`;
  }

  let hours = Math.trunc(time / 3600);
  let min = Math.trunc(((time / 3600) % 1) * 60);
  return `${hours} Hrs${min > 0 ? ` ${min} Min` : ''}`;
};

export function getDateByTimeZone(date: string): string {
  let timezoneOffset = moment().utcOffset();
  timezoneOffset += timezoneOffset;

  return moment(date).utcOffset(timezoneOffset).format('DD-MMM-YYYY | h:mm:ss A');
}

export const getLastSeenTime = (time: string, format: 'short' | 'long' = 'short'): string => {
  const formats = {
    short: {
      s: '<1m',
      ss: '<1m',
      m: '1m',
      mm: '%dm',
      h: '1h',
      hh: '%dh',
      d: '1d',
      dd: '%dd',
      w: '1w',
      ww: '%dw',
      M: '1mth',
      MM: '%dmth',
      y: '1y',
      yy: '%dy',
    },
    long: {
      s: '<1 Minute',
      ss: '<1 Minute',
      m: '1 Minute',
      mm: '%d Minutes',
      h: '1 Hour',
      hh: '%d Hours',
      d: '1 Day',
      dd: '%d Days',
      w: '1 Week',
      ww: '%d Weeks',
      M: '1 Month',
      MM: '%d Months',
      y: '1 Year',
      yy: '%d Years',
    },
  };
  moment.updateLocale('en', {
    relativeTime: formats[format],
  });

  let timezoneOffset = moment().utcOffset();

  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const utcHoursAddedDate = moment([year, month, day, hours, minutes, seconds]).add(timezoneOffset / 60, 'hours');

  return utcHoursAddedDate.fromNow();
};

export const convertDateToTimeElapsed = (date: string) => {
  const dateInMilliSecs = new Date(date).getTime();
  const currentTimeInMilliSecs = Date.now();
  const timeZoneOffset = new Date(Date.now()).getTimezoneOffset();

  const timeElapsedInMillisecs = currentTimeInMilliSecs - dateInMilliSecs;
  let timeElapsedInMinutes = Math.trunc(timeElapsedInMillisecs / 1000 / 60);
  timeElapsedInMinutes += timeZoneOffset;

  if (Number.isNaN(timeElapsedInMinutes)) {
    return '';
  }

  if (timeElapsedInMinutes < 60) {
    return `${timeElapsedInMinutes === 0 ? '<1' : timeElapsedInMinutes} Minute${
      timeElapsedInMinutes > 1 ? 's' : ''
    } Ago`;
  }

  const timeElapsedInHours = Math.trunc(timeElapsedInMinutes / 60);

  if (timeElapsedInHours > 23) {
    const timeElapsedInDays = Math.trunc(timeElapsedInHours / 24);

    return `${timeElapsedInDays} Day${timeElapsedInDays > 1 ? 's' : ''} ago`;
  }

  return `${timeElapsedInHours} Hours ago`;
};

export function convertDateToMinutes(date: string): string {
  const dateInMilliSecs = new Date(date).getTime();
  const currentTimeInMilliSecs = Date.now();
  const timeZoneOffset = new Date(Date.now()).getTimezoneOffset();

  const timeElapsedInMillisecs = currentTimeInMilliSecs - dateInMilliSecs;
  let timeElapsedInMinutes = Math.trunc(timeElapsedInMillisecs / 1000 / 60);
  timeElapsedInMinutes += timeZoneOffset;

  if (Number.isNaN(timeElapsedInMinutes)) {
    return '';
  }

  if (timeElapsedInMinutes < 60) {
    return `${timeElapsedInMinutes === 0 ? '<1' : timeElapsedInMinutes}m ago`;
  }

  const timeElapsedInHours = Math.trunc(timeElapsedInMinutes / 60);

  if (timeElapsedInHours > 23) {
    const timeElapsedInDays = Math.trunc(timeElapsedInHours / 24);

    return `${timeElapsedInDays}d ago`;
  }

  return `${timeElapsedInHours}h ago`;
}

export function geoJSONCoordinatesLengthToZoomLevel(dataLength: number): number {
  switch (true) {
    case dataLength <= 50:
      return 12;
    case dataLength > 50 && dataLength <= 150:
      return 11;
    case dataLength > 150 && dataLength <= 500:
      return 8;
    case dataLength > 500:
    default:
      return 6;
  }
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const preventNonNumericalInput = (e: any) => {
  e = e || window.event;
  var charCode = typeof e.which == 'undefined' ? e.keyCode : e.which;
  var charStr = String.fromCharCode(charCode);

  if (!charStr.match(/^[0-9]*\.?[0-9]*$/)) e.preventDefault();
};

export const preventNonNumericalAndZeroInput = (e: any) => {
  e = e || window.event;
  var charCode = typeof e.which == 'undefined' ? e.keyCode : e.which;
  var charStr = String.fromCharCode(charCode);

  if (!charStr.match(/^[1-9][0-9]*(\.[0-9]{1,3})?$/)) e.preventDefault();
};

export const differenceBetweenTwoDates = (startDate: any, endDate: any) => {
  let difference = startDate.getTime() - endDate.getTime();
  let TotalDays = Math.abs(Math.ceil(difference / (1000 * 3600 * 24)));
  return TotalDays + 1;
};
