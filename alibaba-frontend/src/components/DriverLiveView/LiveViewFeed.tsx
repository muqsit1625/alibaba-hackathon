import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from 'primereact/button';

import { colors } from 'global/colors';
import { ChangeCamIcon, FullScreenIcon } from 'global/image';
import { liveFeedRoute } from 'global/liveFeedRoute';
import { vehicleOnlineStatusInterval } from 'global/variables';

import { authSelector } from 'redux/auth/authSlice';
import { useGetLiveStreamQuery } from 'redux/endpoints/liveview';
import { useGetOnlineStatusQuery, useGetSingleVehicleQuery } from 'redux/endpoints/vehicles';
import { setVehicleId, setVehiclePlateNo } from 'redux/mapOverview/mapOverviewSlice';

import Spinner from 'components/Shared/Spinner';

let pauseInterval: NodeJS.Timeout | undefined;

export const LiveViewFeed = ({ camSelected, setCamSelected }: { camSelected: string; setCamSelected: Function }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(authSelector);

  const [isPaused, setIsPaused] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  const vehicle_plate_no = new URLSearchParams(window.location.search).get('plate_no');
  const vehicle_id = new URLSearchParams(window.location.search).get('id');
  const queryState = useGetLiveStreamQuery(
    { vehicle_plate_no: vehicle_plate_no, status: isPaused ? 0 : 1 },
    { pollingInterval: 5000, skip: !showFeed },
  );

  const [camFeed, setCamFeed] = useState('');

  const vehicleOnlineStatusQueryState = useGetOnlineStatusQuery(vehicle_id, {
    pollingInterval: vehicleOnlineStatusInterval,
  });

  useEffect(() => {
    if (vehicle_plate_no) {
      dispatch(setVehiclePlateNo(vehicle_plate_no));
    }

    if (vehicle_id) {
      dispatch(setVehicleId(vehicle_id));
    }
  }, [dispatch, vehicle_id, vehicle_plate_no]);

  useEffect(() => {
    if (vehicleOnlineStatusQueryState.isSuccess) {
      const onlineStatus = vehicleOnlineStatusQueryState?.currentData?.result?.is_online;
      if (onlineStatus === true) {
        setIsPaused(false);
      }

      setShowFeed(onlineStatus);
    }
  }, [vehicleOnlineStatusQueryState?.currentData?.result?.is_online, vehicleOnlineStatusQueryState.isSuccess]);

  const resumeStream = () => {
    setIsPaused(false);
  };

  useEffect(() => {
    pauseInterval = setTimeout(() => {
      setIsPaused(true);
    }, 60000);

    return () => {
      setCamFeed('');
      clearTimeout(pauseInterval);
    };
  }, []);

  useEffect(() => {
    queryState.refetch();
    clearTimeout(pauseInterval);
    pauseInterval = setTimeout(() => {
      setIsPaused(true);
    }, 60000);
  }, [isPaused]);

  const toggleFullScreen = useCallback(() => {
    const elem = document.getElementById('live-view-feed');

    if (elem?.requestFullscreen) {
      elem?.requestFullscreen();
    }
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    setCamFeed(liveFeedRoute + `${user?.user?.user_id}/${vehicle_plate_no}${camSelected}`);
  }, [camSelected]);

  return showFeed ? (
    <StyledContainer id="live-view-feed">
      {isPaused && (
        <PausedOverlay>
          <Center>
            <StyledText>Stream Paused</StyledText>
            <Button className="p-button-primary" label="Resume" onClick={resumeStream} />
          </Center>
        </PausedOverlay>
      )}
      {!isPaused && <img className="mob-live-view" src={camFeed} alt="Live View Feed" />}
      <LiveFeedOptions className="p-buttonset">
        <Button
          className="p-button-secondary p-button-text"
          onClick={() => setCamSelected(camSelected === 'frontcam' ? 'backcam' : 'frontcam')}
        >
          <ChangeCamIcon />
        </Button>
        <Button className="p-button-secondary p-button-text" onClick={toggleFullScreen}>
          <FullScreenIcon />
        </Button>
      </LiveFeedOptions>
    </StyledContainer>
  ) : (
    <StyledContainer>
      <i className="pi pi-power-off"></i>
      <p>Vehicle Offline</p>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  width: 100%;
  position: relative;
  height: calc(100vh - 15.25rem);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  row-gap: 1rem;

  @media (max-width: 500px) {
    background: #f9fcff;
    height: calc(100vh - 16rem);
  }

  .mob-live-view {
    object-fit: cover;
    @media (max-width: 500px) {
      object-fit: contain;
    }
  }

  p,
  i {
    color: #ffffff;
    font-size: 1.25rem;
  }

  img {
    border-radius: 0.5rem;
    width: 100%;
    height: 100%;
    flex-grow: 1;
    object-fit: cover;
  }
`;

const LiveFeedOptions = styled.span`
  background: #fff;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 16px 0px #0000001a;

  .p-button-secondary {
    padding: 0.75rem;
    box-shadow: none;
  }

  .p-button.p-button-secondary:enabled:focus {
    box-shadow: none;
  }
`;

const PausedOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
  border-radius: 0.5rem;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;

  .p-button-primary {
    background: ${colors.themeBlue};
    padding: 0.75rem 3rem;
    border-radius: 0.675rem;
  }

  .p-button-primary .p-button-label {
    font-weight: 400;
  }
`;

const StyledText = styled.p`
  font-size: 1rem;
  color: #fff;
`;
