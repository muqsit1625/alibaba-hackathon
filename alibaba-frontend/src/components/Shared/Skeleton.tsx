import { ImgHTMLAttributes, useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

import DriverUnAuthorizedAvatar from 'assets/icons/driver-unauthorized-avatar.png';

import { apiRoute, fetchToken } from 'global/apiRoute';
import { mockImg } from 'global/image';

import Spinner from './Spinner';

interface SkeletonProps {
  dimensions?: {
    height: string;
    width: string;
    margin?: string;
  };
}

export const Skeleton = (props: SkeletonProps) => {
  return (
    <SkeletonImage dimensions={props.dimensions}>
      <div className="skeleton-loading-image__shape" />
    </SkeletonImage>
  );
};

const SkeletonAnimation = keyframes`
     0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const SkeletonImage = styled.div<SkeletonProps>`
  width: ${(props) => (props.dimensions && props.dimensions.width) || '28px'};
  height: ${(props) => (props.dimensions && props.dimensions.height) || '28px'};
  margin: ${(props) => (props.dimensions?.margin && props.dimensions.margin) || '0px'};

  .skeleton-loading-image__shape {
    animation: ${SkeletonAnimation} 1s ease-in-out infinite;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 20%,
      rgba(255, 255, 255, 0.6) 80%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 10px;
    width: ${(props) => (props.dimensions && props.dimensions.width) || '28px'};
    height: ${(props) => (props.dimensions && props.dimensions.height) || '28px'};
  }
`;
