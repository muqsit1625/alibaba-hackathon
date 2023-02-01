import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Dialog } from 'primereact/dialog';

import { colors } from 'global/colors';
import { driverManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useDeleteDriverByIdMutation } from 'redux/endpoints/drivers';

import SecondaryBtn from 'components/CButtons/SecondaryBtn';
import PrimaryBtn from 'components/CButtons/PrimaryBtn';

type Props = {
  showModal: boolean;
  closeModal: () => void;
  driverDetails: any;
  getAllDrivers: Function;
};

export default function DeleteModal(props: Props) {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const { showModal, closeModal, driverDetails, getAllDrivers } = props;
  const driverId = driverDetails.driver_id;

  const [deleteDriver, deleteDriverQueryState] = useDeleteDriverByIdMutation();
  console.log('%cdeleteDriverQueryState:', 'background-color:mediumseagreen;', deleteDriverQueryState);

  useEffect(() => {
    if (deleteDriverQueryState.isSuccess) {
      getAllDrivers();

      closeModal();
    }
  }, [closeModal, deleteDriverQueryState.isSuccess, getAllDrivers]);

  const onDeleteClick = () => {
    deleteDriver(driverId);
  };

  return (
    <Dialog
      header={
        <header className="delete-modal__header">
          <h1 className="delete-modal__heading">{t(`${driverManagementPageTranslationsPath}.deleteDriverText`)}</h1>
        </header>
      }
      visible={showModal}
      style={{ width: '80vw', maxWidth: '650px', direction: reducerState.isDirectionRtl ? 'rtl' : 'ltr' }}
      onHide={() => closeModal()}
      draggable={false}
      dismissableMask={true}
    >
      <DeleteModalStyled>
        <p className="delete-modal__confirm-text">
          {`${t(`${driverManagementPageTranslationsPath}.formFields.deleteMessage`)} `}
          <b>{`${driverDetails?.driver_first_name || ''} ${driverDetails?.driver_last_name || ''}`}</b>
          {reducerState.isDirectionRtl ? '؟' : '?'}
        </p>

        <footer className="delete-modal__footer">
          <SecondaryBtn
            loading={deleteDriverQueryState.isLoading}
            onClick={() => closeModal()}
            bColor={colors.themeBlue}
            bColorHover={colors.themeSecondaryHover}
            padding="10px 32px"
            type="button"
            style={{
              width: '100%',
              fontSize: '18px',
              lineHeight: '24px',
            }}
          >
            {t(`${driverManagementPageTranslationsPath}.formFields.cancelText`)}
          </SecondaryBtn>

          <PrimaryBtn
            onClick={() => onDeleteClick()}
            loading={deleteDriverQueryState.isLoading}
            bColor="hsl(0, 84%, 43%)"
            bColorHover="hsl(0, 84%, 38%)"
            padding="10px 32px"
            type="button"
            style={{
              width: '100%',
              fontSize: '18px',
              lineHeight: '24px',
            }}
          >
            {t(`${driverManagementPageTranslationsPath}.formFields.deleteText`)}
          </PrimaryBtn>
        </footer>
      </DeleteModalStyled>
    </Dialog>
  );
}

const DeleteModalStyled = styled.div`
  font-family: 'Poppins', sans-serif;

  .delete-modal__confirm-text {
    font-size: 16px;
    margin: 0;
  }

  .delete-modal__footer {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    column-gap: 100px;
    row-gap: 12px;
  }

  .delete-modal__footer > div {
    flex: 1;
  }
`;
