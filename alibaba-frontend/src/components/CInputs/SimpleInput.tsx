import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import styled from 'styled-components';
import { preventNonNumericalAndZeroInput, preventNonNumericalInput } from 'global/utils';

interface SimpleInputInterface {
  label?: string;
  error?: string;
  placeholder: string;
  formik?: any;
  name?: string;
  type?: string;
  notNegative?: boolean;
}

const SimpleInput: React.FC<SimpleInputInterface> = ({
  label,
  error,
  placeholder,
  formik,
  name = '',
  type = 'text',
  notNegative = false,
}) => {
  return (
    <SimpleInputStyled>
      <label htmlFor={label} className="label">
        {label}
      </label>
      {/* {type !== 'number' ? ( */}
      <InputText
        placeholder={placeholder}
        name={name}
        value={formik.values[name]}
        onChange={(e) => {
          if (notNegative && e.target.value) {
            if (e.target.value.match(/^[1-9]\d*$/)) {
              formik.setFieldValue(name, e.target.value);
            }
          } else {
            formik.setFieldValue(name, e.target.value);
          }
        }}
        onBlur={formik.handleBlur}
        type={type}
        // onKeyPress={(e) => (notNegative ? preventNonNumericalInput(e, formik.values[name]) : undefined)}
      />
      {/* ) : ( */}
      {/* <InputNumber
        placeholder={placeholder}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        format={false}
      /> */}
      {/* )} */}
      <div className="error-container">
        {formik.touched[name] && formik.errors[name] ? (
          <small
            id={label}
            className={`text-danger text-right error ${
              formik.touched[name] && formik.errors[name] ? 'show-error' : ''
            }`}
            style={{ fontSize: '12px' }}
          >
            {formik.errors[name]}
          </small>
        ) : null}
      </div>
    </SimpleInputStyled>
  );
};

const SimpleInputStyled = styled.div`
  display: flex;
  flex-direction: column;

  .label {
    margin-bottom: 5px;
  }
  /* Inner components */
  label {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 300;
    font-size: 18px;
    line-height: 19px;
    color: #303030;
    margin: 10px 0px;
  }

  .p-inputtext {
    background: #f8f8f8;
    border: 1px solid #447abb;
    border-radius: 10px;
    padding: 15px;
    font-family: 'Poppins', sans-serif;
    color: black;
  }
  .error-container {
    height: 1.5rem;
  }
  .error {
    color: red;
  }
`;

export default SimpleInput;
