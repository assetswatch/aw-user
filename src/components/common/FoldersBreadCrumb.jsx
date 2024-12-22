import React, { useState } from "react";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UploadProgressState,
  UserCookie,
  ValidationMessages,
} from "../../utils/constants";
import config from "../../config.json";
import {
  apiReqResLoader,
  formatBytes,
  GetUserCookieValues,
} from "../../utils/common";
import { axiosPost } from "../../helpers/axiosHelper";
import { Toast } from "./ToastView";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../contexts/AuthContext";
import { formCtrlTypes } from "../../utils/formvalidation";
import InputControl from "./InputControl";
import { FilesUploadProgressView, ModalView } from "./LazyComponents";

const FoldersBreadCrumb = React.memo(({ folders, onReloadData }) => {
  let $ = window.$;

  const { loggedinUser } = useAuth();

  const currentFolder = folders[folders.length - 1];

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [addFolderModalShow, setAddFolderModalShow] = useState(false);
  function setInitialAddFolderFormData() {
    return {
      txtname: "",
    };
  }
  const [addFolderFormData, setAddFolderFormData] = useState(
    setInitialAddFolderFormData()
  );
  let formAddFolderErrors = {};
  const [addFolderErrors, setAddFolderErrors] = useState({});

  let formAddFileErrors = {};
  const [addFileErrors, setAddFileErrors] = useState({});
  const [fileUploadModalShow, setFileUploadModalShow] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploadState, setUploadState] = useState(
    UploadProgressState.NotStarted
  );

  const onAdd = (e) => {
    e.preventDefault();
    setAddFolderFormData(setInitialAddFolderFormData());
    formAddFolderErrors = {};
    setAddFolderErrors({});
    setAddFolderModalShow(true);
  };

  const handleAddFolderInputChange = (e) => {
    const { name, value } = e?.target;
    setAddFolderFormData({
      ...addFolderFormData,
      [name]: value,
    });
  };

  const onAddFolder = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formAddFolderErrors).length === 0) {
      setAddFolderErrors({});
      apiReqResLoader("btnaddfolder", "Creating", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        ParentFolderId: currentFolder.FolderId,
        FolderId: 0,
        AccountId: accountid,
        ProfileId: profileid,
        Name: addFolderFormData.txtname,
        StorageTypeId: 1,
        StorageFolderId: "",
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.addDocumentFolder}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              onAddModalClose();
              onReloadData();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.addDocumentFolder}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnaddfolder",
            "Create",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formAddFolderErrors)[0]}]`).focus();
      setAddFolderErrors(formAddFolderErrors);
    }
  };

  const onAddModalClose = () => {
    setAddFolderModalShow(false);
    setAddFolderFormData(setInitialAddFolderFormData());
    setAddFolderErrors({});
    formAddFolderErrors = {};
    apiReqResLoader(
      "btnaddfolder",
      "Create",
      API_ACTION_STATUS.COMPLETED,
      false
    );
  };

  const onFileUpload = (e) => {
    e.preventDefault();
    setFileUploadModalShow(true);
  };

  const onFileUploadModalClose = () => {
    setFileUploadModalShow(false);
    setFiles([]);
    setAddFileErrors({});
    formAddFileErrors = {};
    apiReqResLoader("btnupload", "Upload", API_ACTION_STATUS.COMPLETED, false);
  };

  const onUploadFiles = async () => {
    let notstartedfiles = files.filter(
      (obj) => obj.status == UploadProgressState.NotStarted
    );

    if (notstartedfiles.length === 0) {
      formAddFileErrors["filesupload"] = ValidationMessages.UploadFileReq;
    }

    if (Object.keys(formAddFileErrors).length === 0) {
      setAddFileErrors({});
      setUploadState(UploadProgressState.Started);
      apiReqResLoader("btnupload", "Uploading", API_ACTION_STATUS.START, false);

      let isapimethoderr = false;
      const uploadPromises = notstartedfiles.map((file, i) => {
        setFiles((prevFiles) =>
          prevFiles.map((f, idx) =>
            i === idx ? { ...f, status: UploadProgressState.Started } : f
          )
        );
        let objBodyParams = new FormData();
        objBodyParams.append("ProfileId", profileid);
        objBodyParams.append("AccountId", accountid);
        objBodyParams.append("FolderId", currentFolder.FolderId);
        objBodyParams.append("FolderName", "");
        objBodyParams.append("DocumentTypeId", 0);
        objBodyParams.append("StorageTypeId", 1);
        objBodyParams.append("StorageDocumentId", "");
        if (file) objBodyParams.append("File", file.file);
        return axiosPost(
          `${config.apiBaseUrl}${ApiUrls.addDocument}?r=$`,
          objBodyParams,
          {
            "Content-Type": "multipart/form-data",
          }
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (objResponse.Data.Status === 1) {
                //Toast.success(objResponse.Data.Message);
              } else {
                //Toast.error(objResponse.Data.Message);
              }
            } else {
              isapimethoderr = true;
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            console.error(`"API :: ${ApiUrls.addDocument}, Error ::" ${err}`);
          })
          .finally(() => {
            if (isapimethoderr == true) {
              //Toast.error(AppMessages.SomeProblem);
            }
            setFiles((prevFiles) =>
              prevFiles.map((f, idx) =>
                i === idx ? { ...f, status: UploadProgressState.Completed } : f
              )
            );
          });
      });

      try {
        Promise.all(uploadPromises).then(() => {
          apiReqResLoader(
            "btnupload",
            "Upload",
            API_ACTION_STATUS.COMPLETED,
            false
          );
          Toast.success(AppMessages.UploadDocumentSuccess);
          setUploadStatus(
            files.reduce((acc, file) => {
              acc[file.name] = "Uploaded";
              return acc;
            }, {})
          );
          setUploadState(UploadProgressState.Completed);
          onFileUploadModalClose();
          onReloadData();
        });
      } catch (error) {
        setUploadStatus(
          files.reduce((acc, file) => {
            acc[file.name] = "Failed";
            return acc;
          }, {})
        );
      }
    } else {
      setAddFileErrors(formAddFileErrors);
    }
  };

  const onDrop = (acceptedFiles) => {
    const selectedFiles = acceptedFiles.map((file) => ({
      file,
      status: UploadProgressState.NotStarted,
    }));
    setFiles((prevFiles) => [...selectedFiles, ...prevFiles]);
  };

  const onDropRejected = (rejectedFiles) => {
    Toast.error("Some files were rejected. Please upload valid files.");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  const removeUploadedFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== id));
  };

  return (
    <>
      <div class="breadcrumb w-400px">
        <>
          {folders && folders?.length === 1 ? (
            <>
              <div class="breadcrumb-item bc-fh">
                <a href="#">My Documents</a>
              </div>
              <div class="breadcrumb-item bc-fh dropdown">
                <a
                  data-bs-toggle="collapse"
                  data-bs-target="#ddhierarchyfoldermenu"
                  aria-controls="ddhierarchyfoldermenu"
                  aria-expanded="false"
                >
                  <label>{folders[0].Name}</label>
                  <i className="fa fa-chevron-circle-down font-small"></i>
                </a>
              </div>
            </>
          ) : (
            folders?.map((f, i) => {
              if (i == folders.length - 1) {
                return (
                  <div class="breadcrumb-item bc-fh dropdown">
                    <a
                      data-bs-toggle="collapse"
                      data-bs-target="#ddhierarchyfoldermenu"
                      aria-controls="ddhierarchyfoldermenu"
                      aria-expanded="false"
                    >
                      <label>{f.Name}</label>
                      <i className="fa fa-chevron-circle-down font-small"></i>
                    </a>
                  </div>
                );
              } else if (i >= 1) {
                return (
                  <div class="breadcrumb-item bc-fh">
                    <a href="#">
                      <label> {f.Name}</label>
                    </a>
                  </div>
                );
              } else {
                return (
                  <div class="breadcrumb-item bc-fh">
                    <a href="#" className="flex flex-center">
                      <i class="fa fa-ellipsis"></i>
                    </a>
                  </div>
                );
              }
            })
          )}
        </>
      </div>

      <ul
        className={`ddmenu arrow collapse in bg-white py-0 px-0 mt-2 l-2rem lh-1 shadow rounded text-primary`}
        id="ddhierarchyfoldermenu"
      >
        <li>
          <a className="dropdown-item" onClick={(e) => onAdd(e)}>
            <i className="mdi mdi-folder-plus font-22 position-relative me-1 t-4"></i>{" "}
            New Folder
          </a>
        </li>
        <li>
          <a className="dropdown-item" onClick={onFileUpload}>
            <i className="fa fa-file-arrow-up font-18 position-relative me-2 t-1 pl-5"></i>{" "}
            File Upload
          </a>
        </li>
      </ul>

      {/*============== File Upload Modal Start ==============*/}
      {fileUploadModalShow && (
        <>
          <FilesUploadProgressView
            content={
              <>
                <div
                  className="row"
                  {...getRootProps()}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="col-12 mb-0 flex flex-center">
                    <input
                      type="file"
                      name="filesupload"
                      id="filesupload"
                      className="d-none"
                      multiple
                      //onChange={handleFileChange}
                      {...getInputProps()}
                    />
                    <label
                      className="fileupload_label border-dash border-1x border-light rounded font-16 p-10 w-350px"
                      htmlFor="filesupload"
                    >
                      <i
                        className="fa fa-cloud-upload mb-10 upload-icon d-flex flex-center"
                        aria-hidden="true"
                      ></i>
                      <p className="p-0 m-0">Drag & drop files here</p>
                      <p className="font-general text-light">
                        or click to select files
                      </p>
                    </label>
                  </div>
                  {Object.keys(addFileErrors).length > 0 && (
                    <div className="err-invalid flex flex-center">
                      Please select files to upload.
                    </div>
                  )}
                  {files && files.length > 0 ? (
                    <hr className="w-100 text-primary my-20" />
                  ) : (
                    isDragActive && <div className="row min-h-150"></div>
                  )}
                  <ul
                    className="cscrollbar"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {Array.from(files).map((file, idx) => (
                      <li className="row" key={`${idx}`} name={`f-${idx}`}>
                        <div className="col px-20">
                          <div className="name">{file.file.name}</div>
                          <div className="name">
                            {formatBytes(file.file.size)}
                          </div>
                        </div>
                        <div className="col-auto pt-10">
                          {file.status == UploadProgressState.NotStarted && (
                            <i
                              className="icons icon-close font-16 pt-10 text-error cur-pointer"
                              onClick={() => removeUploadedFile(idx)}
                            ></i>
                          )}
                          {file.status == UploadProgressState.Started && (
                            <i className="icons icon-clock font-16 pt-10 text-primary"></i>
                          )}
                          {file.status == UploadProgressState.Completed && (
                            <i className="icons icon-check font-16 pt-10 text-primary"></i>
                          )}
                        </div>
                        {file.status == UploadProgressState.NotStarted && (
                          <hr className="w-100 text-light my-10 hrl" />
                        )}
                        {file.status == UploadProgressState.Started && (
                          <div className="processing">
                            <div className="continuous"></div>
                          </div>
                        )}
                        {file.status == UploadProgressState.Completed && (
                          <hr className="w-100 text-primary my-10 hrl" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            }
            onClose={
              uploadState == UploadProgressState.Started
                ? ""
                : onFileUploadModalClose
            }
            actions={[
              {
                id: "btnupload",
                text: "Upload",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onUploadFiles(e),
              },
            ]}
          ></FilesUploadProgressView>
        </>
      )}
      {/*============== File Upload Modal End ==============*/}

      {/*============== Add Folder Modal Start ==============*/}
      {addFolderModalShow && (
        <>
          <ModalView
            title={AppMessages.AddFolderModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      name="txtname"
                      ctlType={formCtrlTypes.name}
                      required={true}
                      onChange={handleAddFolderInputChange}
                      value={addFolderFormData.txtname}
                      errors={addFolderErrors}
                      formErrors={formAddFolderErrors}
                      isFocus={true}
                    ></InputControl>
                  </div>
                </div>
              </>
            }
            onClose={onAddModalClose}
            actions={[
              {
                id: "btnaddfolder",
                text: "Create",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onAddFolder(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onAddModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Add Folder Modal End ==============*/}
    </>
  );
});

export default FoldersBreadCrumb;
