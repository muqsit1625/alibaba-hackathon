//@ts-nocheck
import { useEffect, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Logo, signInBgPng, signInBgWebp, signInBgAvif, signInBgWebpCompressed } from 'global/image';
import { signInPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useLoginMutation } from 'redux/endpoints/auth';

import IconBtn from 'components/CButtons/IconBtn';
import IconInput from 'components/CInputs/IconInput';
import SimpleInput from 'components/CInputs/SimpleInput';
import Spinner from 'components/Shared/Spinner';

// Shape of form values
interface FormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const [login, loginQueryState] = useLoginMutation();
  console.log('%cloginQueryState:', 'background-color:darkred;color:white;', loginQueryState);

  useEffect(() => {
    if (loginQueryState.isSuccess) {
      window.location.reload();
      setTimeout(() => {
        navigate('/overview');
      }, 1000);
    }
  }, [loginQueryState.isSuccess, navigate]);

  const validate = (values: FormValues) => {
    let errors: FormikErrors<FormValues> = {};
    if (!values.email) {
      errors.email = '⋆Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email format';
    }
    if (!values.password) {
      errors.password = '⋆Required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be 6 characters long';
    }
    return errors;
  };

  const initialValues = {
    email: '',
    password: '',
  };

  const onSubmit = async (values: FormValues) => {
    login(values);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validate,
  });

  return (
    <SignInStyled isDirectionRtl={reducerState.isDirectionRtl}>
      <div className="sign-in__bg-image">
        <img src={signInBgWebpCompressed} alt="Autilent background" />
      </div>

      <div className="sign-in__main-container">
        <div className="sign-in__logo-container">
          <Logo className="autilent-logo" />
        </div>
        <div className="center-portion">
          <div className="container">
            <div className="action-message">
              <h1 className="heading">{t(`${signInPageTranslationsPath}.signInText`)} </h1>
              <h2 className="sub-heading">{t(`${signInPageTranslationsPath}.fleetManagerText`)}</h2>
            </div>

            <form onSubmit={formik.handleSubmit} className="form">
              <div className="inputs">
                <SimpleInput label={'Email'} placeholder="xyz@domain.com" formik={formik} name="email" />

                <IconInput label={'Password'} name="password" formik={formik} />
              </div>

              <div className="center-bottom">
                {!loginQueryState.isLoading && (
                  <IconBtn
                    btnText={t(`${signInPageTranslationsPath}.loginText`)}
                    btnPos="right"
                    btnIcon="pi-arrow-right"
                    type="submit"
                    fontSize="18px"
                    lineHeight="24px"
                    style={{
                      padding: '12px 52px',
                    }}
                  />
                )}
                {loginQueryState.isLoading && <Spinner />}
                <span>
                  <a href="mailto:info@autilent.com" className="info-link">
                    info@autilent.com
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
        <span className="copyright-text">All Rights Reserved. Autilent Inc. &#40;2022&#41;</span>
      </div>
    </SignInStyled>
  );
};

const SignInStyled = styled.div<{ isDirectionRtl: boolean }>`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  opacity: 0;
  animation: fadeIn 0.5s linear 1.5s forwards;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  .sign-in__bg-image {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: var(--app-primary-color);
  }

  .sign-in__bg-image > * {
    height: 100%;
    width: 100%;
  }

  .sign-in__main-container {
    z-index: 1;
    padding-bottom: 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .sign-in__main-container .p-inputtext {
    width: 100%;
  }

  .sign-in__logo-container {
    padding: 12px 50px;
  }

  .mt-40 {
    margin-top: 40px;
  }

  .mt-60 {
    margin-top: 60px;
  }

  .copyright-text {
    color: #ffffff;
    font-size: 18px;
    line-height: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
  }

  .center-portion {
    background: #f9fcff;
    border-radius: 16.9613px;
    padding: 50px 0px;
    max-width: 570px;
    width: 90%;
    margin: 0px auto;
    text-align: left;
    display: flex;
    flex-direction: column;
    margin-top: 3rem;
    height: clamp(450px, 70vh, 500px);
    justify-content: center;
  }

  .container {
    margin: 0 auto;
    padding: 0px 63px;
    display: grid;
    row-gap: 3vh;
  }

  .action-message {
    display: grid;
    row-gap: 8px;
    text-align: ${(props) => (props.isDirectionRtl ? 'right' : 'left')};
  }

  .heading {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: #303030;
    margin: 0;

    @media (max-width: 800px) {
      font-size: 18px;
    }
  }

  .sub-heading {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 700;
    font-size: 32px;
    line-height: 32px;
    color: var(--app-primary-color);
    margin: 0;

    @media (max-width: 800px) {
      font-size: 20px;
    }
  }

  .form {
    display: grid;
    row-gap: 2vh;
  }

  .center-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    row-gap: 4vh;
  }

  .info-link {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 300;
    font-size: 18px;
    line-height: 12px;
    text-decoration-line: underline;
    color: #447abb;
    cursor: pointer;
  }

  .inputs {
    display: grid;
    row-gap: 1vh;
  }

  @media screen and (max-width: 600px) {
    .container {
      padding: 0 40px;
    }

    .sign-in__logo-container {
      text-align: center;
    }
  }
`;

export default SignIn;
