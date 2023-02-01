import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import styled from 'styled-components';

import { fetchToken } from 'global/apiRoute';

import { S3Image } from 'components/Shared/S3Image';
import Spinner from '../Shared/Spinner';

type Props = {
  seeImagePopup: boolean;
  setSeeImagePopup: React.Dispatch<React.SetStateAction<boolean>>;
  imageUrl: string;
  style?: object;
  imageStyle?: object;
};

const SeeImagePopup = (props: Props) => {
  const { seeImagePopup, setSeeImagePopup, imageUrl, style, imageStyle } = props;

  return (
    <Dialog
      header="Preview Image"
      visible={seeImagePopup}
      style={{ width: '40vw', maxWidth: '540px', ...style }}
      onHide={() => {
        setSeeImagePopup(false);
      }}
      dismissableMask={true}
    >
      <SeeImagePopupStyled>
        <S3Image
          url={imageUrl}
          style={{
            width: '100%',
            height: 'auto',
            marginRight: 0,
            ...imageStyle
          }}
        />
      </SeeImagePopupStyled>
    </Dialog>
  );
};

const SeeImagePopupStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledImage = styled.img`
  width: 100%;
`;

export default SeeImagePopup;
