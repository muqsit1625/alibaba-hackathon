import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { profilePageTranslationsPath } from 'global/variables';

import { authSelector } from 'redux/auth/authSlice';

import { S3Image } from 'components/Shared/S3Image';

type Props = {};

export default function ProfileContainer(props: Props) {
  const { t } = useTranslation();

  const authSlice: any = useSelector(authSelector);
  const manager = authSlice?.user?.user || authSlice?.user;
  console.log('%cmanager:', 'background-color:black;color:white;', manager);

  const managerDetails: any = useMemo(() => {
    return {
      [`${t(`${profilePageTranslationsPath}.companyNameText`)}`]: manager?.company_name || '-',
      [`${t(`${profilePageTranslationsPath}.managerNameText`)}`]: `${manager?.first_name || ''} ${
        manager?.last_name || ''
      }`,
      [`${t(`${profilePageTranslationsPath}.managerEmailText`)}`]: manager?.email,
      [`${t(`${profilePageTranslationsPath}.managerDOBText`)}`]: manager?.dob,
      [`${t(`${profilePageTranslationsPath}.managerCNICText`)}`]: manager?.cnic || '-',
      [`${t(`${profilePageTranslationsPath}.managerAddressText`)}`]: manager?.address || '-',
      [`${t(`${profilePageTranslationsPath}.managerPhoneNoText`)}`]: manager?.phone_number,
    };
  }, [
    t,
    manager?.address,
    manager?.cnic,
    manager?.company_name,
    manager?.dob,
    manager?.email,
    manager?.first_name,
    manager?.last_name,
    manager?.phone_number,
  ]);

  return (
    <ProfileContainerStyled>
      <h1 className="profile-container__manager-profile-heading">
        {t(`${profilePageTranslationsPath}.managerProfileText`)}
      </h1>

      <div className="profile-container__manager-profile-container">
        <div className="profile-container__manager-image-container">
          <S3Image url={manager?.image} />
        </div>

        <section className="profile-container__manager-details-container">
          {Object.keys(managerDetails).map((detailType: any) => {
            return (
              <div className="profile-container__manager-detail">
                <h2 className="profile-container__manager-detail-heading">{detailType}</h2>
                <p className="profile-container__manager-detail-value">{managerDetails[detailType]}</p>
              </div>
            );
          })}
        </section>

        <section className="profile-container__manager-images-container">
          <div className="profile-container__manager-cnic-image-container">
            <h2>{t(`${profilePageTranslationsPath}.managerCNICImagesText`)}</h2>

            <div className="profile-container__manager-cnic-images">
              <S3Image url={manager?.cnic_images[0]} />
              <S3Image url={manager?.cnic_images[1]} />
            </div>
          </div>
          <div className="profile-container__manager-face-image-container">
            <h2>{t(`${profilePageTranslationsPath}.managerFaceImagesText`)}</h2>

            <div className="profile-container__manager-face-images">
              <S3Image url={manager?.face_sides[0]} />
              <S3Image url={manager?.face_sides[1]} />
            </div>
          </div>
        </section>
      </div>
    </ProfileContainerStyled>
  );
}

const ProfileContainerStyled = styled.section`
  padding: 28px 32px;
  background-color: var(--app-background-color);
  flex: 1;
  display: flex;
  flex-direction: column;

  .profile-container__manager-profile-heading {
    font-weight: bold;
    text-align: center;
  }

  .profile-container__manager-profile-container {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .profile-container__manager-image-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .profile-container__manager-image-container img {
    height: 290px;
    width: 290px;
  }

  .profile-container__manager-details-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 400px));
    justify-content: center;
    row-gap: 28px;
    column-gap: 28px;
  }

  .profile-container__manager-detail {
    flex: 1 1 30%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .profile-container__manager-detail-heading {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
  }

  .profile-container__manager-detail-value {
    margin: 0;
    font-size: 20px;
    text-align: center;
  }

  .profile-container__manager-images-container h2 {
    font-weight: bold;
    margin-top: 28px;
    text-align: center;
  }

  .profile-container__manager-images-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    column-gap: 80px;
    place-items: center;
  }

  .profile-container__manager-cnic-images,
  .profile-container__manager-face-images {
    display: grid;
    row-gap: 16px;
  }

  .profile-container__manager-cnic-images img,
  .profile-container__manager-face-images img {
    height: 200px;
    width: 200px;
    margin: 0;
  }

  @media screen and (max-width: 500px) {
    .profile-container__manager-detail-heading {
      font-size: 20px;
    }

    .profile-container__manager-detail-value {
      font-size: 16px;
    }
  }
`;
