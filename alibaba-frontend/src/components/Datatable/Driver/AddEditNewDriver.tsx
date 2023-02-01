//@ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { DriverFormValues } from 'types/commonTypes';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { colors } from 'global/colors';

import { Dialog } from 'primereact/dialog';

import { driverManagementPageTranslationsPath } from 'global/variables';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

import { useGetAllVehiclesPlateNoQuery } from 'redux/endpoints/vehicles';
import { useAddDriverMutation, useEditDriverMutation } from 'redux/endpoints/drivers';

import CBasicDropdown from 'components/CDropdowns/CBasicDropdown';
import SimpleInput from 'components/CInputs/SimpleInput';
import FileUploadDrop from 'components/CInputs/FileUploadDrop';
import { ModalFooter } from 'components/Shared/ModalFooter';
import SimpleMaskInput from 'components/CInputs/SimpleMaskInput';

const AddEditNewDriver = ({
  initValues = null,
  showModal,
  setShowModal,
  setInitValues,
  getAllDrivers,
}: {
  initValues?: object | null;
  setInitValues: Function;
  showModal: boolean;
  setShowModal: Function;
  getAllDrivers: Function;
}) => {
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  const allVehiclesQueryState = useGetAllVehiclesPlateNoQuery();
  const [addDriver, addDriverQueryState] = useAddDriverMutation();
  const [editDriver, editDriverQueryState] = useEditDriverMutation();

  console.log('%caddDriverQueryState:', 'background-color:lightcoral;', addDriverQueryState);
  console.log('%ceditDriverQueryState:', 'background-color:greenyellow;', editDriverQueryState);

  const allVehiclePlateNo = useMemo(() => {
    let vehicles = allVehiclesQueryState.data?.result || [];
    vehicles = vehicles.map((vehicle) => ({ name: vehicle.vehicle_plate_no, vehicle_id: vehicle.vehicle_id }));

    return vehicles;
  }, [allVehiclesQueryState.data?.result]);

  const [imageData, setImageData] = useState({ key: {}, file: [] });
  const [selectedVehiclePlateNo, setSelectedVehiclePlateNo] = useState<any>(null);
  const [imageError, setImageError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const [initialValues, setInitialValues] = useState({
    driver_first_name: '',
    driver_last_name: '',
    phone_number: '',
    cnic: '',
    license_number: '',
    address: '',
    vehicle_id: '',
  });

  const validate = (values: DriverFormValues) => {
    let errors: FormikErrors<DriverFormValues> = {};
    setImageError(null);

    const requiredText = t(`${driverManagementPageTranslationsPath}.formFields.requiredText`);

    Object.keys(values)
      .slice(0, -1)
      .map((key) => {
        if (!values[key]) {
          errors[key] = requiredText;
        }
      });
    if (!initValues && !imageData?.key?.key) {
      setImageError(requiredText);
      errors['driver_image'] = requiredText;
    }
    return errors;
  };

  const onSubmit = async (values: DriverFormValues, onSubmitProps: any) => {
    const dataToSubmit = {
      ...(initValues && { driver_id: initValues.driver_id }),
      ...values,
      ...(selectedVehiclePlateNo && { vehicle_id: selectedVehiclePlateNo.vehicle_id }),
      ...(imageData.key.key && { driver_image: imageData.key.key }),
      driver_media_url: '',
    };

    console.log('dataToSubmit:', dataToSubmit);

    if (initValues) {
      editDriver(dataToSubmit);
    } else {
      addDriver(JSON.stringify(dataToSubmit));
    }
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit,
    validate,
  });

  const onHide = useCallback(() => {
    setInitValues(null);

    setShowModal(false);
  }, [setInitValues, setShowModal]);

  useEffect(() => {
    if (
      addDriverQueryState.isSuccess ||
      editDriverQueryState.isSuccess ||
      addDriverQueryState.isError ||
      editDriverQueryState.isError
    ) {
      if (editDriverQueryState.isError) {
        alert(`${t(`someErrorOccurredText`)}:\n\n${editDriverQueryState?.error?.data?.message}`);
      }
      if (addDriverQueryState.isError) {
        alert(`${t(`someErrorOccurredText`)}:\n\n${addDriverQueryState?.error?.data?.message}`);
      }

      if (addDriverQueryState.isSuccess) {
        toast.success('Driver Added Successfully!', { autoClose: 3000 });
      }
      if (editDriverQueryState.isSuccess) {
        toast.success('Driver Updated Successfully!', { autoClose: 3000 });
      }

      getAllDrivers();
      setInitValues(null);
      onHide();
    }
  }, [
    addDriverQueryState?.error?.data?.message,
    addDriverQueryState.isError,
    addDriverQueryState.isSuccess,
    editDriverQueryState?.error?.data?.message,
    editDriverQueryState.isError,
    editDriverQueryState.isSuccess,
    getAllDrivers,
    onHide,
    setInitValues,
  ]);

  const validateAndChangeStep = (newStep) => {
    let errors = validate(formik.values);
    console.log(errors, newStep);
    if (Object.keys(errors).length) {
      formik.handleSubmit();
      return;
    }
    setCurrentStep(newStep);
  };

  const primaryBtnText =
    currentStep < totalSteps
      ? t(`${driverManagementPageTranslationsPath}.formFields.nextText`)
      : initValues
      ? t(`${driverManagementPageTranslationsPath}.formFields.updateText`)
      : t(`${driverManagementPageTranslationsPath}.formFields.addText`);
  const secondaryBtnText =
    currentStep > 1
      ? t(`${driverManagementPageTranslationsPath}.formFields.previousText`)
      : t(`${driverManagementPageTranslationsPath}.formFields.cancelText`);

  useEffect(() => {
    if (initValues) {
      let vals = { ...initValues };
      var selectedPlateNo = allVehiclePlateNo.find((v) => v.vehicle_id === vals?.vehicle_id);
      setSelectedVehiclePlateNo(selectedPlateNo ?? null);
      delete vals?.driver_image_preview;
      delete vals?.embeddings;

      if (!selectedPlateNo) {
        delete vals?.vehicle_id;
        delete vals?.vehicle_plate_no;
      }
      setInitialValues(vals);
    }
  }, [allVehiclePlateNo, initValues]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <Dialog
          header={
            <div className="header-container">
              <p>{`${
                initValues
                  ? t(`${driverManagementPageTranslationsPath}.editDriverText`)
                  : t(`${driverManagementPageTranslationsPath}.addDriverText`)
              }`}</p>
              <p className="gray">{`${t(`${driverManagementPageTranslationsPath}.stepText`)} ${currentStep} ${t(
                `${driverManagementPageTranslationsPath}.ofText`,
              )} ${totalSteps}`}</p>
            </div>
          }
          visible={showModal}
          style={{ width: '90vw', maxWidth: '650px', direction: reducerState.isDirectionRtl ? 'rtl' : 'ltr' }}
          footer={() => (
            <ModalFooter
              onHide={() => onHide()}
              formik={formik}
              primaryBtnText={primaryBtnText}
              secondaryBtnText={secondaryBtnText}
              loading={addDriverQueryState.isLoading || editDriverQueryState.isLoading}
              setStep={validateAndChangeStep}
              step={currentStep}
              totalSteps={totalSteps}
            />
          )}
          onHide={() => (addDriverQueryState.isLoading || editDriverQueryState.isLoading ? null : onHide())}
          draggable={false}
        >
          {currentStep === 1 ? (
            <AddNewDriverStyled isDirectionRtl={reducerState.isDirectionRtl}>
              <div className="input-row">
                <SimpleInput
                  placeholder={'John'}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.firstName`)}
                  formik={formik}
                  name="driver_first_name"
                />
                <SimpleInput
                  placeholder={'Doe'}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.lastName`)}
                  formik={formik}
                  name="driver_last_name"
                />
              </div>
              <div className="input-row">
                <SimpleMaskInput
                  placeholder={'42201-1234567-9'}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.cnicNo`)}
                  formik={formik}
                  name="cnic"
                  mask="99999-9999999-9"
                />
                <SimpleInput
                  placeholder={t(`${driverManagementPageTranslationsPath}.formFields.driverLicenseNo`)}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.licenseNo`)}
                  formik={formik}
                  name="license_number"
                />
              </div>
              <div className="input-row">
                <SimpleInput
                  placeholder={'+97 7217 127181'}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.phoneNo`)}
                  formik={formik}
                  name="phone_number"
                />
                <SimpleInput
                  placeholder={t(`${driverManagementPageTranslationsPath}.formFields.address`)}
                  label={t(`${driverManagementPageTranslationsPath}.formFields.address`)}
                  formik={formik}
                  name="address"
                />
              </div>
              <p>
                {t(`${driverManagementPageTranslationsPath}.formFields.uploadImage`)}:{' '}
                {imageError && <ImageError>{imageError}</ImageError>}
              </p>

              <FileUploadDrop
                setImageData={setImageData}
                intent="drivers"
                initSrc={initValues?.driver_media_url}
                uploadBase64
                imageData={imageData}
              />
            </AddNewDriverStyled>
          ) : (
            <AddNewDriverStyled>
              <div>
                <p>You can optionally assign this driver to a vehicle. Select the vehicle plate no. below:</p>
                <CBasicDropdown
                  placeholder="Plate No."
                  label="Plate No."
                  options={allVehiclePlateNo}
                  selectedOption={selectedVehiclePlateNo}
                  onChangeSelection={({ value }: { value: any }) =>
                    setSelectedVehiclePlateNo({ name: value.name, vehicle_id: value.vehicle_id })
                  }
                />
              </div>
            </AddNewDriverStyled>
          )}
        </Dialog>
      </form>
    </div>
  );
};

const AddNewDriverStyled = styled.div<{ isDirectionRtl: boolean }>`
  direction: ${(props) => (props.isDirectionRtl ? 'rtl' : 'ltr')};

  .p-dropdown {
    margin-top: 0;
    padding: 3px;
  }
  .label {
    color: var(--app-primary-color);
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 16px;
  }

  .input-row > div {
    flex-grow: 1;
  }
`;

const ImageError = styled.p`
  margin: 0;
  margin-top: 0.5rem;
  color: ${colors.dangerRed};
  font-size: 0.75rem;
`;

export default AddEditNewDriver;
