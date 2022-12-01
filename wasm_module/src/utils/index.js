import Platform from 'platform';

export const getDisplayedMessage = (result) => {
  switch (result) {
    case -1:
      return 'No Face';
    case 0:
      return 'Face detected';
    case 1:
      return 'Image Spoof';
    case 2:
      return 'Video Spoof';
    case 3:
      return 'Video Spoof';
    case 4:
      return 'Too far away';
    case 5:
      return 'Too far to right';
    case 6:
      return 'Too far to left';
    case 7:
      return 'Too far up';
    case 8:
      return 'Too far down';
    case 9:
      return 'Too blurry';
    case 10:
      return 'PLEASE REMOVE EYEGLASSES';
    case 11:
      return 'PLEASE REMOVE FACEMASK';
    default:
      return '';
  }
};

export const isIOS = Platform.os.family === 'iOS';
export const osVersion = Number(Platform.os.version);
export const isAndroid = Platform.os.family === 'Android';
export const isMobile = isIOS || isAndroid;

export function getQueryParams(queryString) {
  const query = queryString.split('+').join(' ');
  const params = {};

  const regex = /(?:\?|&|;)([^=]+)=([^&|;]+)/g;
  const tokens = regex.exec(query);

  if (tokens && tokens.length > 2) params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  return params;
}

export const isBackCamera = (availableDevices, currentDevice) => {
  const mediaDevice = availableDevices.find((device) => device.value === currentDevice);
  return mediaDevice?.label?.toLowerCase().includes('back');
};

export const canvasSizes = [
  { label: "12MP", value: "12MP" },
  { label: "8MP", value: "8MP" },
  { label: "7MP", value: "7MP" },
  { label: "5MP", value: "5MP" },
  { label: "4MP", value: "4MP" },
  { label: "2MP", value: "2MP" },
];

export const CANVAS_SIZE = {
  "12MP": { width: 4096, height: 3072 },
  "8MP": { width: 4096, height: 2160 },
  "7MP": { width: 3200, height: 2400 },
  "5MP": { width: 2560, height: 2048 },
  "4MP": { width: 2560, height: 1440 },
  "2MP": { width: 1920, height: 1080 },
};

// export const canvasSizes = [
//   {
//     label: "12MP",
//     value: { width: 4032, height: 3024 },
//   },
//   {
//     label: "8MP",
//     value: { width: 3264, height: 2448 },
//   },
//   {
//     label: "7MP",
//     value: { width: 3088, height: 2320 },
//   },
//   {
//     label: "5MP",
//     value: { width: 2576, height: 1932 },
//   },
//   {
//     label: "4MP",
//     value: { width: 2560, height: 1440 },
//   },
//   {
//     label: "2MP",
//     value: { width: 1920, height: 1080 },
//   },
// ];
