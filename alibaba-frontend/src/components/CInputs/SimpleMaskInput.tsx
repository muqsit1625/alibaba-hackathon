import { InputMask } from 'primereact/inputmask';
import styled from 'styled-components';

interface SimpleMaskInputInterface {
  label?: string;
  error?: string;
  placeholder: string;
  formik?: any;
  name?: string;
  mask?: string;
}

const SimpleMaskInput: React.FC<SimpleMaskInputInterface> = ({
  label,
  error,
  placeholder,
  formik,
  name = '',
  mask
}) => {
  return (
    <SimpleMaskInputStyled>
      <label htmlFor={label} className="label">
        {label}
      </label>
      <InputMask
        placeholder={placeholder}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        mask={mask}
      />
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
    </SimpleMaskInputStyled>
  );
};

const SimpleMaskInputStyled = styled.div`
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

export default SimpleMaskInput;
