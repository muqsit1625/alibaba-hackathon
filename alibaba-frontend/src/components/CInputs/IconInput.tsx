import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import styled from 'styled-components';

interface IconInputInterface {
  label: string;
  error?: string;
  formik: any;
  name?: string;
}

const IconInput: React.FC<IconInputInterface> = ({ label, error, formik, name = '' }) => {
  const [toggle, setToggle] = useState(false);
  return (
    <IconInputStyled>
      <label htmlFor={label}>{label}</label>
      <span className="p-input-icon-right">
        <InputText
          name={name}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type={toggle ? 'text' : 'password'}
        />
        {toggle ? (
          <i className="pi pi-eye" onClick={() => setToggle((prev) => !prev)} />
        ) : (
          <i className="pi pi-eye-slash" onClick={() => setToggle((prev) => !prev)} />
        )}
      </span>
      <div className="error-container">
        {formik.touched[name] && formik.errors[name] ? (
          <small id={label} className="text-danger text-right error" style={{ marginBottom: '15px', fontSize: '12px' }}>
            {formik.errors[name]}
          </small>
        ) : null}
      </div>
    </IconInputStyled>
  );
};

const IconInputStyled = styled.span`
  display: flex;
  flex-direction: column;

  i {
    color: #999999 !important;
    font-size: 1rem;
    /* margin-top: 0.1rem !important; */
  }
  .p-inputtext {
    width: 100%;
  }
  .error-container {
    height: 1.5rem;
  }
  .error {
    color: red;
  }
`;

export default IconInput;
