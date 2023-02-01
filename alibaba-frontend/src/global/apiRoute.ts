export const apiRoute = process.env.REACT_APP_API_ROUTE_DEMO;
export const localApiRoute = 'http://192.168.100.53:8080';

export const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const fetchToken = () => {
  let token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').token : null;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  };

  return config;
};

export const ImgFormData = {
  'x-amz-algorithm': 'AWS4-HMAC-SHA256',
  'x-amz-credential': 'AKIA4LIKQYIECLOSUVKR/20220623/us-east-2/s3/aws4_request',
  'x-amz-date': '20220623T085034Z',
  policy:
    'eyJleHBpcmF0aW9uIjogIjIwMjItMDYtMjNUMDk6MjA6MzRaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAibmV3LWF1dGlsZW50In0sIHsia2V5IjogInZlaGljbGVzLzFlY2YyZDE4LWIwMzQtNmY3ZS1iZDUxLTAyNDJhYzEzMDAwNC5qcGVnIn0sIHsieC1hbXotYWxnb3JpdGhtIjogIkFXUzQtSE1BQy1TSEEyNTYifSwgeyJ4LWFtei1jcmVkZW50aWFsIjogIkFLSUE0TElLUVlJRUNMT1NVVktSLzIwMjIwNjIzL3VzLWVhc3QtMi9zMy9hd3M0X3JlcXVlc3QifSwgeyJ4LWFtei1kYXRlIjogIjIwMjIwNjIzVDA4NTAzNFoifV19',
  'x-amz-signature': 'e864c7732788600d3d5c6cfad8cc9ac69422c376882d676ca772cc0fe76acb52',
};
