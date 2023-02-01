import { SelectButton } from 'primereact/selectbutton';
import { useState } from 'react';
import { colors } from '../../global/colors';
import styled from 'styled-components';
import { LiveViewFeed } from './LiveViewFeed';

export const DriverLiveViewLogic = () => {
  const [camView, setCamView] = useState('frontcam');
  const options = [
    { label: 'Cabin View', value: 'frontcam' },
    { label: 'Road View', value: 'backcam' }
  ];
  return (
    <StyledContainer>
      <SelectButton value={camView} options={options} onChange={(e) => setCamView(e.value)} />
      <LiveViewFeed camSelected={camView} setCamSelected={setCamView} />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .p-selectbutton {
    background: ${colors.gray};
    border-radius: 10px;
  }

  .p-selectbutton .p-button-label {
    font-weight: 400;
    font-size: 14px;
  }

  .p-selectbutton .p-button {
    border-radius: 10px;
    box-shadow: none;
    padding: 0.625rem 1.75rem;
  }

  .p-selectbutton .p-button:not(.p-highlight) {
    border: none;
    background: transparent;
    color: #ffffff;
  }

  .p-selectbutton .p-button:not(.p-highlight):hover {
    color: ${colors.dgray};
    background: transparent;
  }

  .p-selectbutton .p-button.p-highlight {
    background-color: ${colors.themeBlue};
    border-color: ${colors.themeBlue};
  }
`;
