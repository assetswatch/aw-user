import React, { useState } from "react";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  checkEmptyVal,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  API_ACTION_STATUS,
  AppMessages,
  ValidationMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/common/ToastView";
import InputControl from "../../../components/common/InputControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useGetDdlDocumentFoldersGateway } from "../../../hooks/useGetDdlDocumentFoldersGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import FileControl from "../../../components/common/FileControl";
import PdfViewer from "../../../components/common/PdfViewer";
import { useGetDocumentTypesGateway } from "../../../hooks/useGetDocumentTypesGateway";

const AddDocument = () => {
  let $ = window.$;
  const navigate = useNavigate();

  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());

  function setInitFormData(documentDetails) {
    let initFormData = {
      txttile: "",
      ddlfolder: null,
      ddldocumenttype: null,
      txtdescription: "",
    };

    return initFormData;
  }

  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  // const { documentTypesList } = useGetDocumentTypesGateway("");
  const { documentFoldersList } = useGetDdlDocumentFoldersGateway({
    Keyword: "",
    AccountId: accountid,
    ProfileId: profileid,
  });

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [file, setFile] = useState({ url: null, type: "", uploadedFile: null });
  const [inputFolderValue, setInputFolderValue] = useState("");

  const handleFileChange = (event) => {
    setFile({ url: null, type: "", file: null });
    const uploadedFile = event.target.files[0];
    let fileUrl = null;
    if (
      uploadedFile &&
      (uploadedFile.type === "application/pdf" ||
        uploadedFile.type.startsWith("image/"))
    ) {
      fileUrl = URL.createObjectURL(uploadedFile);
      setFile({
        url: fileUrl,
        type: uploadedFile.type,
        uploadedFile: uploadedFile,
      });
    }
  };

  const handleInputFolderChange = (newValue, { action }) => {
    if (action !== "menu-close" && action !== "input-blur") {
      setInputFolderValue(newValue);
    }
  };

  //Search ddl controls changes
  const ddlChange = (e, name) => {
    setFormData({
      ...formData,
      [name]: e?.value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onAdd = (e) => {
    e.preventDefault();

    // if (checkEmptyVal(formData.ddldocumenttype)) {
    //   formErrors["ddldocumenttype"] = ValidationMessages.DocumentTypeReq;
    // }

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnadd", "Adding", API_ACTION_STATUS.START);
      let isapimethoderr = false;

      let objBodyParams = new FormData();

      objBodyParams.append("ProfileId", profileid);
      objBodyParams.append("AccountId", accountid);
      objBodyParams.append(
        "FolderId",
        parseInt(setSelectDefaultVal(formData.ddlfolder))
      );
      objBodyParams.append("FolderName", inputFolderValue);
      objBodyParams.append(
        "DocumentTypeId",
        0 //parseInt(setSelectDefaultVal(formData.ddldocumenttype))
      );
      objBodyParams.append("Title", formData.txttitle);
      objBodyParams.append("Description", formData.txtdescription);
      if (file) objBodyParams.append("File", file?.uploadedFile);

      axiosPost(`${config.apiBaseUrl}${ApiUrls.addDocument}`, objBodyParams, {
        "Content-Type": "multipart/form-data",
      })
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            Toast.success(objResponse.Data.Message);
            if (objResponse.Data.Status == 1) {
              setFormData(setInitFormData());
              navigate(routeNames.ownerdocuments.path);
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
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnadd", "Add", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigate(routeNames.ownerdocuments.path);
  };

  const [files, setFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-12 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <ol className="breadcrumb mb-0 bg-transparent p-0">
                <li className="breadcrumb-item" aria-current="page">
                  <h6 className="mb-4 down-line pb-10">Add Document</h6>
                </li>
              </ol>
              <form noValidate>
                <div className="container-fluid">
                  <div className="row">
                    <div className="col px-0">
                      <div className="row">
                        <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={AppMessages.DdlDefaultSelect}
                            noData={
                              documentFoldersList.length <= 0 &&
                              AppMessages.DdlNoFolders
                            }
                            options={documentFoldersList}
                            dataKey="FolderId"
                            dataVal="Name"
                            handleInputChange={handleInputFolderChange}
                            onChange={(e) => ddlChange(e, "ddlfolder")}
                            onBlur={() => {
                              setInputFolderValue(inputFolderValue);
                            }}
                            inputValue={inputFolderValue}
                            value={formData.ddlfolder}
                            name="ddlfolder"
                            lbl={formCtrlTypes.folder}
                            lblText="Create / Select Folder:"
                            lblClass="mb-0"
                            className="ddlborder"
                            isClearable={true}
                            formErrors={formErrors}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        {/* <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={
                              documentTypesList.length <= 0 &&
                              formData.ddldocumenttype == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              documentTypesList.length <= 0 &&
                              formData.ddldocumenttype == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlNoData
                            }
                            options={documentTypesList}
                            dataKey="DocumentTypeId"
                            dataVal="DocumentType"
                            onChange={(e) => ddlChange(e, "ddldocumenttype")}
                            value={formData.ddldocumenttype}
                            name="ddldocumenttype"
                            lbl={formCtrlTypes.documenttype}
                            lblClass="mb-0 lbl-req-field"
                            lblText="Document type"
                            className="ddlborder"
                            isClearable={true}
                            isSearchCtl={true}
                            required={true}
                            errors={errors}
                            formErrors={formErrors}
                          ></AsyncSelect>
                        </div> */}
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txttitle"
                            ctlType={formCtrlTypes.title}
                            required={true}
                            onChange={handleChange}
                            value={formData.txttitle}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={2}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <FileControl
                            lblClass="mb-0 lbl-req-field"
                            name="uploadimage"
                            ctlType={formCtrlTypes.file}
                            onChange={handleFileChange}
                            file={file}
                            required={true}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={3}
                          />
                          <span className="font-mini err-invalid">
                            Note : Only image or pdf is allowed.
                          </span>
                        </div>
                        <div className="col-md-12 mb-15">
                          <div
                            style={{
                              border: "2px dashed #ccc",
                              borderRadius: "10px",
                              padding: "20px",
                              textAlign: "center",
                              color: "#888",
                              width: "300px",
                              margin: "50px auto",
                            }}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <p>Drag and drop files here</p>
                            <p>or</p>
                            <button
                              onClick={() =>
                                document.getElementById("fileInput").click()
                              }
                              style={{
                                padding: "10px 20px",
                                border: "none",
                                background: "#007bff",
                                color: "#fff",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              Browse Files
                            </button>
                            <input
                              id="fileInput"
                              type="file"
                              multiple
                              style={{ display: "none" }}
                              onChange={handleFileSelect}
                            />
                            {files.length > 0 && (
                              <div>
                                <h4>Selected Files:</h4>
                                <ul>
                                  {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                  ))}
                                </ul>
                                <button
                                  onClick={handleFileUpload}
                                  style={{
                                    padding: "10px 20px",
                                    border: "none",
                                    background: "#28a745",
                                    color: "#fff",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                  }}
                                >
                                  Upload Files
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* <div className="col-md-6 mb-15">
                          <TextAreaControl
                            lblClass="mb-0"
                            name="txtdescription"
                            ctlType={formCtrlTypes.description500}
                            required={false}
                            onChange={handleChange}
                            value={formData.txtdescription}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={4}
                            rows={3}
                          ></TextAreaControl>
                        </div> */}
                      </div>
                      {file && file.url && (
                        <div>
                          <h6 className="mb-4 down-line  pb-10">Preview</h6>
                          {file.type === "application/pdf" ? (
                            <PdfViewer file={file.url}></PdfViewer>
                          ) : (
                            <img
                              src={file.url}
                              className="bg-light border rounded max-h-600"
                            ></img>
                          )}
                        </div>
                      )}
                      <hr className="w-100 text-primary my-20"></hr>
                      <div className="row form-action d-flex flex-end">
                        <div
                          className="col-md-6 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-6">
                          <button
                            className="btn btn-secondary"
                            id="btncancel"
                            onClick={onCancel}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            id="btnadd"
                            onClick={onAdd}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDocument;
