import React, { lazy, useEffect, useState } from "react";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  DocumentsTabIds,
  UploadProgressState,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  formatBytes,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import { routeNames } from "../../../routes/routes";
import {
  FilesUploadProgressView,
  ModalView,
} from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { axiosPost } from "../../../helpers/axiosHelper";
import { Toast } from "../../../components/common/ToastView";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import { useDropzone } from "react-dropzone";

const MyDocuments = lazy(() => import("./MyDocuments"));
const SharedDocuments = lazy(() => import("./SharedDocuments"));

const Documents = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const Tabs = [DocumentsTabIds.mydocuments, DocumentsTabIds.shareddocuments];
  let defaultTab = Tabs[0];

  const [activeTab, setActiveTab] = useState("");
  const [tabMyDocumentsKey, setTabMyDocumentsKey] = useState(0);
  const [tabSharedDocumentsKey, setTabSharedDocumentsKey] = useState(0);

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

  useEffect(() => {
    let checkStateTab = location.state || {};
    if (!checkObjNullorEmpty(checkStateTab)) {
      if (!checkObjNullorEmpty(checkStateTab.tab)) {
        defaultTab = checkStateTab?.tab?.toString().toLowerCase();
      }
    }

    $(".nav-tab-line").children("li").removeClass("active");
    document
      .querySelector(`[data-target="${defaultTab}"]`)
      ?.classList.add("active");

    handleTabClick(defaultTab);
  }, []);

  const handleTabClick = (tabselected) => {
    setActiveTab(tabselected);
  };

  useEffect(() => {
    // default action
    //$(".tab-element .tab-pane").hide();
    // $(".tab-action > ul li:first-child").addClass("active");
    // $(".tab-element .tab-pane:first-child").show();

    // on click event

    $(".tab-action ul li").on("click", function (e) {
      apiReqResLoader("x");
      $(this).parent("ul").children("li").removeClass("active");
      $(this).addClass("active");
      $(this).parent("ul").next(".tab-element").children(".tab-pane").hide();
      var activeTab = $(this).attr("data-target");
      $(activeTab).fadeIn();

      const parentElement = e.target;
      const parentAttribute = parentElement.getAttribute("data-target");
      setActiveTab(parentAttribute);
      apiReqResLoader("x", "", "completed");
    });
  }, []);

  const reloadMyDocumentsTab = () => {
    apiReqResLoader("x");
    let $this = $(".tab-action ul li").eq(0);
    $this.parent("ul").children("li").removeClass("active");
    $this.addClass("active");
    $this.parent("ul").next(".tab-element").children(".tab-pane").hide();
    var activeTab = $this.attr("data-target");
    $(activeTab).fadeIn();
    setTabMyDocumentsKey((prevKey) => prevKey + 1);
    setActiveTab(defaultTab);
    apiReqResLoader("x", "", "completed");
    //return false;
  };

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
        ParentFolderId: 0,
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
              reloadMyDocumentsTab();
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
        objBodyParams.append("FolderId", 0);
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
          reloadMyDocumentsTab();
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

  // useEffect(() => {
  //   if (files.length === 0) {
  //     formAddFileErrors["filesupload"] = ValidationMessages.UploadFileReq;
  //   }
  //   setAddFileErrors(formAddFileErrors);
  // }, [files]);

  const onDrop = (acceptedFiles) => {
    // setFiles((prevFiles) => [...acceptedFiles, ...prevFiles]);
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
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">My Documents</h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <div className="dropdown">
                    <div
                      className="btn btn-primary btn-mini btn-glow shadow rounded"
                      data-bs-toggle="collapse"
                      data-bs-target="#dropdownMenuButton"
                      aria-controls="dropdownMenuButton"
                      aria-expanded="false"
                    >
                      <i className="icons icon-plus position-relative me-2 t-2"></i>{" "}
                      New
                    </div>
                    <ul
                      className={`ddmenu arrow collapse in bg-white py-0 px-0 lh-1 shadow rounded text-primary`}
                      id="dropdownMenuButton"
                    >
                      <li>
                        <a className="dropdown-item" onClick={onAdd}>
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
                      {/* <div className="dropdown-divider" />
                      <li>
                        <a className="dropdown-item">
                          <i className="mdi mdi-folder-upload font-22 position-relative me-1 t-3"></i>{" "}
                          Folder Upload
                        </a>
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li
                    className="ac tive"
                    data-target={Tabs[0]}
                    onClick={() => {
                      handleTabClick(Tabs[0]);
                    }}
                  >
                    My Documents
                  </li>
                  <li
                    className=""
                    data-target={Tabs[1]}
                    onClick={() => {
                      handleTabClick(Tabs[1]);
                    }}
                  >
                    Shared Documents
                  </li>
                </ul>
                <div className="tab-element">
                  {activeTab == Tabs[0] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[0].toString().substring(1)}
                    >
                      <MyDocuments
                        key={tabMyDocumentsKey}
                        tabkey={tabMyDocumentsKey}
                      />
                    </div>
                  )}
                  {activeTab == Tabs[1] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[1].toString().substring(1)}
                    >
                      <SharedDocuments key={tabSharedDocumentsKey} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
};

export default Documents;
