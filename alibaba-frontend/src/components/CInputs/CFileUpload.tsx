//@ts-nocheck
import { colors } from '../../global/colors';
import { FileUpload } from 'primereact/fileupload';
import { useRef, useState } from 'react';
import styled from 'styled-components';

const CFileUpload = () => {
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef(null);

  const onUpload = () => {
    console.log('uploaded');
  };

  const onTemplateSelect = (e) => {
    let _totalSize = totalSize;
    e.files.forEach((file) => {
      _totalSize += file.size;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = (e) => {
    let _totalSize = 0;
    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateRemove = (file: any, callback: any) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const itemTemplate = (file, props) => {
    console.log(file.objectURL);
    return (
      <div style={{ height: '30%' }} onClick={() => fileUploadRef.current.onClick()}>
        <div className="empty-template">
          <i className="pi pi-upload"></i>
          <span>Upload</span>
        </div>
        <div className="" style={{ position: 'relative', left: '100%' }}>
          <div className="" style={{ width: '50%' }}>
            <img src={file.objectURL} alt="serial_number_image" width={100} />
          </div>
        </div>
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="empty-template">
        <i className="pi pi-upload"></i>
        <span>Upload</span>
      </div>
    );
  };

  //   const chooseOptions = {
  //     icon: 'pi pi-fw pi-images',
  //     iconOnly: true,
  //     className: 'custom-choose-btn p-button-rounded p-button-outlined'
  //   };
  //   const uploadOptions = {
  //     icon: 'pi pi-fw pi-cloud-upload',
  //     iconOnly: true,
  //     className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'
  //   };
  //   const cancelOptions = {
  //     icon: 'pi pi-fw pi-times',
  //     iconOnly: true,
  //     className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'
  //   };

  return (
    <FileUploadStyled>
      <FileUpload
        ref={fileUploadRef}
        name="demo[]"
        url="https://primefaces.org/primereact/showcase/upload.php"
        accept="image/*"
        maxFileSize={1000000}
        onUpload={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={() => <></>}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        // chooseOptions={chooseOptions}
        // uploadOptions={uploadOptions}
        // cancelOptions={cancelOptions}
        uploadHandler={onUpload}
      />
    </FileUploadStyled>
  );
};

export default CFileUpload;

const FileUploadStyled = styled.div`
  width: 50%;
  .empty-template {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: ${colors.themeBlue};
  }
  .p-fileupload .p-fileupload-content {
    background: #ffffff;
    border: 1px dashed ${colors.themeBlue};
    border-radius: 10px;
  }
`;
