//@ts-nocheck
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { VehicleFormValues } from 'types/commonTypes';
import axios, { AxiosError } from 'axios';
import styled from 'styled-components';

import { Dialog } from 'primereact/dialog';

import { colors } from 'global/colors';
import { vehicleManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { vehicleSelector } from 'redux/vehicle/vehicleSlice';
import { useAddVehicleRequestMutation } from 'redux/endpoints/vehicles';

import IconBtn from 'components/CButtons/IconBtn';
import SimpleInput from 'components/CInputs/SimpleInput';
import FileUploadDrop from 'components/CInputs/FileUploadDrop';
import { ModalFooter } from 'components/Shared/ModalFooter';

const AddNewVehicle = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [reducerState] = useStateValue();

  const { loading } = useSelector(vehicleSelector);

  const [addVehicle, addVehicleRequestQueryState] = useAddVehicleRequestMutation();
  console.log(
    '%caddVehicleRequestQueryState:',
    'background-color:darkgoldenrod;color:white;',
    addVehicleRequestQueryState,
  );

  const [showVehicleRequestDialog, setShowVehicleRequestDialog] = useState(false);
  const [imageData, setImageData] = useState({ key: {}, file: [] });
  const [uploadBase64, setUploadBase64] = useState(true);
  // const [loading, setLoading] = useState(true);

  const onHide = () => {
    setShowVehicleRequestDialog(false);
  };

  const initialValues = {
    // vehicle_id: '',
    vehicle_plate_no: '',
    chassis_no: '',
    color: '',
    weight: '',
    number_of_tires: '',
    engine_no: '',
    make_model: '',
    vehicle_image: '',
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    // validate
  });

  useEffect(() => {
    if (addVehicleRequestQueryState.isSuccess) {
      formik.resetForm();
      onHide();
    }
  }, [addVehicleRequestQueryState.isSuccess, formik]);

  async function onSubmit(values: VehicleFormValues, onSubmitProps: any) {
    let form = new FormData();
    Object.keys(imageData.key).map((d) => form.append(d, imageData.key[d]));
    form.append('file', imageData.file);

    try {
      if (!uploadBase64) {
        await axios.post(
          `${
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:5000/s3api'
              : 'https://new-autilent.s3.amazonaws.com/'
          }`,
          form,
        );
      }

      const dataToSubmit = {
        ...values,
        vehicle_image: imageData.key.key,
        number_of_tires: Number(values.number_of_tires),
      };
      // console.log({ dataToSubmit });
      addVehicle(dataToSubmit);
    } catch (error) {
      console.log({ error });
      const err = error as AxiosError;
      if (err.response) {
        console.log(err.response.status);
        console.log(err.response.data);
      }
    }
  }

  return (
    <div>
      <IconBtn
        btnText={t(`${vehicleManagementPageTranslationsPath}.addVehicleRequestText`)}
        btnPos="left"
        btnIcon="pi pi-plus"
        onClick={() => setShowVehicleRequestDialog(true)}
      />
      <Dialog
        header={
          <div className="header-container">
            <p>{t(`${vehicleManagementPageTranslationsPath}.addVehicleRequestText`)}</p>
          </div>
        }
        visible={showVehicleRequestDialog}
        style={{ width: '90vw', maxWidth: '650px', direction: reducerState.isDirectionRtl ? 'rtl' : 'ltr' }}
        footer={() => (
          <ModalFooter
            primaryBtnText={t(`${vehicleManagementPageTranslationsPath}.formFields.addText`)}
            secondaryBtnText={t(`${vehicleManagementPageTranslationsPath}.formFields.cancelText`)}
            onHide={onHide}
            formik={formik}
            loading={loading}
          />
        )}
        onHide={onHide}
        draggable={false}
        dismissableMask={true}
      >
        <AddNewVehicleStyled>
          <>
            <div className="input-row">
              {/* <SimpleInput placeholder={'128-129-123'} label="Vehicle ID" formik={formik} name="vehicle_id" /> */}
              <SimpleInput
                placeholder={'ABC-123'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.vehiclePlateNo`)}
                formik={formik}
                name="vehicle_plate_no"
              />
              <SimpleInput
                placeholder={'123192919145678'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.chassisNo`)}
                formik={formik}
                name="chassis_no"
              />
            </div>
            <div className="input-row">
              <SimpleInput
                placeholder={'Engine No'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.engineNo`)}
                formik={formik}
                name="engine_no"
              />
              <SimpleInput
                placeholder={'Toyota Corolla'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.make`)}
                formik={formik}
                name="make_model"
              />
            </div>
            <div className="input-row">
              <SimpleInput
                placeholder={'500'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.maxWeight`)}
                formik={formik}
                name="weight"
                type="text"
                notNegative={true}
              />
              <SimpleInput
                placeholder={'6'}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.noOfTyres`)}
                formik={formik}
                name="number_of_tires"
                type="number"
                notNegative={true}
              />
            </div>
            <div className="input-row">
              <SimpleInput
                placeholder={t(`${vehicleManagementPageTranslationsPath}.formFields.colorPlaceholder`)}
                label={t(`${vehicleManagementPageTranslationsPath}.formFields.color`)}
                formik={formik}
                name="color"
              />
            </div>
            <p className="label">{t(`${vehicleManagementPageTranslationsPath}.formFields.uploadPlateImage`)}</p>
            <FileUploadDrop setImageData={setImageData} intent="vehicles" uploadBase64={uploadBase64} />
          </>
        </AddNewVehicleStyled>
      </Dialog>
    </div>
  );
};

const AddNewVehicleStyled = styled.div`
  .p-dropdown {
    margin-top: 0;
    padding: 3px;
  }
  .label {
    color: ${colors.themeBlue};
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
  }

  .input-row > div {
    flex-grow: 1;
  }
`;

export default AddNewVehicle;
