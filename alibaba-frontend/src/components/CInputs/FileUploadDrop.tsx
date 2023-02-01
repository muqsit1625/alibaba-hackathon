import axios, { AxiosError } from 'axios';
import { apiRoute, fetchToken } from 'global/apiRoute';
import { colors } from 'global/colors';
import { convertToBase64 } from 'global/utils';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

interface IFileUpload {
  setImageData: React.Dispatch<
    React.SetStateAction<{
      key: object;
      file: never[];
    }>
  >;
  intent: string;
  uploadBase64?: boolean;
  initSrc?: string;
  imageData?: {
    key: any;
    file: File;
  };
}

const FileUploadDrop = ({ setImageData, intent, uploadBase64 = false, initSrc, imageData }: IFileUpload) => {
  let config = fetchToken();
  const [file, setFile] = useState({ preview: '', name: '' });
  const getImageS3PostURL = async () => await axios.get(`${apiRoute}/api/v1/${intent}/create_image_url`, config);
  const getImageS3GetURL = async () => await axios.get(`${apiRoute}/api/v1/${intent}/get_image//${initSrc}`, config);
  const setBase64ImageData = (file: never[], base64: string) => {
    setImageData({ key: { key: base64 }, file: file });
  };

  const onDrop = useCallback(async (acceptedFiles: any) => {
    // Do something with the files
    try {
      setFile({ name: acceptedFiles[0].name, preview: URL.createObjectURL(acceptedFiles[0]) });
      if (uploadBase64) {
        convertToBase64(acceptedFiles[0], setBase64ImageData);
        return;
      }
      const { data } = await getImageS3PostURL();
      setImageData({ key: data.result.result.fields, file: acceptedFiles[0] });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.log(err.response.status);
        console.log(err.response.data);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop
  });

  const removeImage = (e: any) => {
    e.stopPropagation();
    setFile({ preview: '', name: '' });
    setImageData({ key: {}, file: [] });
  };

  useEffect(() => {
    if (initSrc) {
      const getURL = async () => {
        var { data } = await getImageS3GetURL();
        setFile({ preview: data?.result?.result, name: '' });
      };
      getURL();
    }
  }, [initSrc]);

  useEffect(() => {
    if (imageData?.key?.key && uploadBase64) {
      setFile({ name: imageData.file.name, preview: URL.createObjectURL(imageData.file) });
    }
  }, [imageData]);

  const ImgPreview = (
    <StyledImagePreview>
      <CloseBtn className="no-btn-style" onClick={removeImage}>
        <i className="pi pi-times"></i>
      </CloseBtn>

      <img
        src={file.preview}
        // Revoke data uri after image is loaded
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
        alt={file.name}
        width={100}
      />
    </StyledImagePreview>
  );

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => URL.revokeObjectURL(file.preview);
  }, [file]);

  return (
    <FileUploadStyled {...getRootProps()}>
      <div className="empty-template">
        <input {...getInputProps()} />
        <i className="pi pi-upload"></i>
        <span>Upload</span>
      </div>

      <div>{file.preview && ImgPreview}</div>
    </FileUploadStyled>
  );
};

const FileUploadStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .empty-template {
    width: 50%;
    height: 100px;
    background: #ffffff;
    border: 1px dashed ${colors.themeBlue};
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.themeBlue};
    flex-direction: column;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 2px;
  top: 2px;
  background-color: #ffffff;
  color: ${colors.themeBlue};
  border-radius: 50%;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  .pi {
    font-size: 0.75rem !important;
    font-weight: bold;
  }
`;

const StyledImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;

export default FileUploadDrop;
