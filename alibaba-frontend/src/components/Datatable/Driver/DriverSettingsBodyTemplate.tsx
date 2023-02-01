//@ts-nocheck
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Tooltip } from 'primereact/tooltip';

import { BinIcon, EditIcon, VideoIcon } from 'global/image';
import { driverManagementPageTranslationsPath } from 'global/variables';

const SettingsBodyTemplate = (props) => {
  const { rowData, setShowAddEditModal, setShowDeleteModal, setDriverDetails } = props;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className="settings">
      <Tooltip
        target=".live-view"
        content={t(`${driverManagementPageTranslationsPath}.tooltips.liveView`)}
        position="left"
      />
      <button className="no-btn-style btn-icon">
        <VideoIcon
          onClick={
            rowData.vehicle_plate_no
              ? () => {
                  console.log('here', rowData.vehicle_id);
                  navigate(
                    `/driver-management/live-view?plate_no=${rowData.vehicle_plate_no}&id=${rowData.vehicle_id}`,
                  );
                }
              : null
          }
          className={`live-view ${!rowData.vehicle_plate_no && 'disabled'}`}
        />
      </button>

      <Tooltip target=".edit" content={t(`${driverManagementPageTranslationsPath}.tooltips.edit`)} position="left" />
      <button className="no-btn-style btn-icon">
        <EditIcon
          onClick={() => {
            setDriverDetails(rowData);
            setShowAddEditModal(true);
          }}
          className="edit"
        />
      </button>

      <Tooltip
        target=".delete"
        content={t(`${driverManagementPageTranslationsPath}.tooltips.delete`)}
        position="left"
      />
      <button className="no-btn-style btn-icon">
        <BinIcon
          onClick={() => {
            setDriverDetails(rowData);
            setShowDeleteModal(true);
          }}
          className="delete"
        />
      </button>

      {/* below things should be placed somewhere (as it render on every loop of data) */}
      {/* <EditNewDriver displayEdit={displayEdit} setDisplayEdit={setDisplayEdit} initialValues={rowData} /> */}
    </div>
  );
};

export default SettingsBodyTemplate;
