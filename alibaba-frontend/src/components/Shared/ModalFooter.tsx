import { MouseEventHandler } from 'react';
import styled from 'styled-components';

import { colors } from 'global/colors';

import PrimaryBtn from 'components/CButtons/PrimaryBtn';
import SecondaryBtn from 'components/CButtons/SecondaryBtn';

type FooterProps = {
  onHide: MouseEventHandler;
  formik: any;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  loading?: boolean;
  step?: number;
  totalSteps?: number;
  setStep?: Function;
};

export const ModalFooter = ({
  onHide,
  formik,
  primaryBtnText,
  secondaryBtnText,
  loading,
  setStep,
  step,
  totalSteps,
}: FooterProps) => {
  return (
    <ModalFooterStyled>
      <div className="modal-footer__cancel-button-container">
        <SecondaryBtn
          loading={loading}
          onClick={(e) => {
            if (step! > 1) {
              setStep!(--step!);
              return;
            }
            onHide(e);
          }}
          bColor={colors.themeBlue}
          bColorHover={colors.themeSecondaryHover}
          padding="10px 32px"
          children={secondaryBtnText ?? 'Cancel'}
          type="submit"
          style={{
            width: '100%',
            fontSize: '18px',
            lineHeight: '24px',
          }}
        />
      </div>

      <div className="modal-footer__add-button-container">
        <PrimaryBtn
          onClick={() => {
            if (step! < totalSteps!) {
              setStep!(++step!);
              return;
            }
            formik.handleSubmit();
          }}
          loading={loading}
          bColor={colors.themeBlue}
          bColorHover={colors.themeBlueHover}
          padding="10px 32px"
          children={primaryBtnText ?? 'Add'}
          type="submit"
          style={{
            width: '100%',
            fontSize: '18px',
            lineHeight: '24px',
          }}
        />
      </div>
    </ModalFooterStyled>
  );
};

const ModalFooterStyled = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap-reverse;
  width: 100%;
  column-gap: 40%;
  row-gap: 12px;

  .modal-footer__cancel-button-container {
    flex: 1;
    justify-self: flex-start;
    min-width: 140px;
  }

  .modal-footer__add-button-container {
    flex: 1;
    justify-self: flex-end;
    min-width: 140px;
  }
`;
