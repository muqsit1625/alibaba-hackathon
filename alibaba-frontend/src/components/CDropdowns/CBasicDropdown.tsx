import { Dropdown } from 'primereact/dropdown';
import styled from 'styled-components';

const cities = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' }
];

interface ICBasicDropdown {
  placeholder: string;
  label?: string;
  error?: string;
  width?: string;
  options?: { name: string }[] | null;
  selectedOption?: string;
  onChangeSelection?: (e: { value: any }) => void;
}

const CBasicDropdown: React.FC<ICBasicDropdown> = ({
  placeholder,
  label,
  error,
  width,
  options,
  selectedOption,
  onChangeSelection
}) => {
  // const [selectedCity, setSelectedCity] = useState<any>(null);
  // const onCityChange = (e: { value: any }) => {
  //   setSelectedCity(e.value);
  // };
  return (
    <CBasicDropdownStyled width={width}>
      <label htmlFor={label} className="label">
        {label}
      </label>
      <Dropdown
        value={selectedOption}
        options={options ? options : cities}
        onChange={onChangeSelection}
        optionLabel="name"
        placeholder={placeholder}
      />
      {/* <small id={label}>{error}</small> */}
      <div id={label} className="error-container">
        {error}
      </div>
    </CBasicDropdownStyled>
  );
};

interface Props {
  width?: string;
}

const CBasicDropdownStyled = styled.div<Props>`
  width: 100%;

  .p-dropdown {
    width: ${(p) => (p?.width ? p.width : '100%')};
    padding: 5px;
    margin-top: 5px;
    background: #f8f8f8;
    border: 1px solid #447abb;
    border-radius: 10px;
  }

  .p-inputtext {
    font-family: 'Poppins', sans-serif;
    color: black;
  }

  label {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 300;
    font-size: 18px;
    line-height: 19px;
    color: #303030;
    margin: 10px 0px;
  }

  .error-container {
    height: 1.5rem;
  }
`;

export default CBasicDropdown;
