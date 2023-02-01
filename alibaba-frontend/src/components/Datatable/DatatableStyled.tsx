import { colors } from '../../global/colors';
import styled from 'styled-components';

export const DatatableStyled = styled.div<{ isDirectionRtl: boolean }>`
  .card {
    border: none;
  }
  .p-datatable .p-datatable-header {
    background-color: #fff;
    border: none;
    border-radius: 10px;
    padding: 16px;
  }

  .datatable-filter-demo .p-paginator .p-paginator-current {
    margin-left: auto;
  }

  .p-paginator button {
    height: 28px !important;
    min-width: 28px !important;
    font-size: 12px;
  }

  .p-paginator button .p-paginator-icon {
    font-size: 12px;
    transform: ${(props) => (props.isDirectionRtl ? 'rotate(180deg)' : '')};
  }

  .p-paginator .p-paginator-current {
    font-size: 12px;
  }

  .datatable-filter-demo .p-progressbar {
    height: 0.5rem;
    background-color: #d8dadc;
  }
  .datatable-filter-demo .p-progressbar .p-progressbar-value {
    background-color: #607d8b;
  }
  .datatable-filter-demo .p-datepicker {
    min-width: 25rem;
  }
  .datatable-filter-demo .p-datepicker td {
    font-weight: 400;
  }
  .datatable-filter-demo .p-datatable.p-datatable-customers .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }
  .datatable-filter-demo .p-datatable.p-datatable-customers .p-paginator {
    padding: 1rem;
  }
  .datatable-filter-demo .p-datatable.p-datatable-customers .p-datatable-thead > tr > th {
    text-align: left;
  }
  .datatable-filter-demo .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td {
    cursor: auto;
  }
  .datatable-filter-demo .p-datatable.p-datatable-customers .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }

  .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.6rem !important;
    border-color: #ecf5ff;
    font-family: 'Poppins', sans-serif;
    color: #999999;
    font-size: 12px;
  }

  /* custom */
  .header-table {
    display: flex;
    justify-content: space-between;
  }

  .p-datatable .p-datatable-thead > tr > th {
    color: ${colors.themeBlue};
    background-color: #fff;
    border-color: #ecf5ff;
    border-left: none;
    padding: 8px 16px;
  }

  .p-column-title {
    color: var(--app-primary-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 14px;
  }

  .p-column-filter-row .p-column-filter-menu-button,
  .p-column-filter-row .p-column-filter-clear-button {
    display: none;
  }

  .customer-badge {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 7px 15px;
    width: 151px;
    color: #ffffff;
    border-radius: 15px;
  }

  .status-allocated {
    background: #43ca82;
  }

  .status-unallocated {
    background: #f47878;
  }

  .settings {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 4px;
  }

  .p-inputtext {
    background: #f8f8f8;
    border-radius: 10px;
    border: none;
    padding: 8px 14px;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
  }

  .userBodyTemplate {
    display: flex;
    align-items: center;
    > img {
      margin-right: 2px;
    }
  }

  .sticky {
    position: sticky;
    /* width: 100px; */
    /* left: 0; */
    right: 0;
    z-index: 0;
    background: #fff;
    border-left: 1px solid #ecf5ff !important;
  }

  .see-image {
    text-decoration: underline;
    cursor: pointer;
    margin: 0 !important;
  }

  .btn-icon {
    transform: scale(1.4);
  }

  .disabled-icon-btn {
    cursor: not-allowed;
    svg path {
      fill: lightgrey;
    }
  }

  @media screen and (max-width: 850px) {
    max-width: unset;

    .p-datatable .p-datatable-tbody > tr > td {
      font-size: 14px;
      padding: 0.6rem 1rem !important;
    }

    .p-inputtext {
      font-size: 14px;
      height: 36px;
    }
  }

  @media screen and (max-width: 500px) {
    .p-inputtext {
      font-size: 12px;
      height: 32px;
    }
  }
`;
