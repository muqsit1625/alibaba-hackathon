import { ImgHTMLAttributes, useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import DriverUnAuthorizedAvatar from 'assets/icons/driver-unauthorized-avatar.png';

import { apiRoute, fetchToken } from 'global/apiRoute';
import { mockImg } from 'global/image';

import Spinner from './Spinner';

const cachedImages: { [key: string]: string } = {};

interface S3ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  url: string;
}
export const S3Image = (props: S3ImageProps) => {
  const { url, style } = props;

  const config = fetchToken();

  const [imgUrl, setImgUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  const isImageInCache: boolean = Object.prototype.hasOwnProperty.call(cachedImages, url);

  useEffect(() => {
    setImageLoading(true);

    if (!isImageInCache) {
      cachedImages[`${url}`] = '';

      axios.get(`${apiRoute}/api/v1/drivers/get_image//${url}`, config).then((res) => {
        setImgUrl(res?.data?.result?.result);
        cachedImages[url] = res?.data?.result?.result;

        setImageLoading(false);
      });
    } else {
      setImgUrl(cachedImages[url]);

      setImageLoading(false);
    }
  }, [config, isImageInCache, url]);

  if (imageLoading) {
    return <Spinner />;
  }

  return <StyledImage src={imgUrl ?? DriverUnAuthorizedAvatar} style={style} {...props} />;
};

const StyledImage = styled.img`
  width: 28px;
  height: 28px;
  margin-right: 0.5rem;
`;
