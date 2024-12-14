import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
  API_ACTION_STATUS,
  AppMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { DataLoader } from "../../../components/common/LazyComponents";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/common/ToastView";
import InputControl from "../../../components/common/InputControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import PdfViewer from "../../../components/common/PdfViewer";

const EditDocument = () => {
  let $ = window.$;
  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());

  const { loggedinUser } = useAuth();

  let documentid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewEditDocumentId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [documentDetails, setDocumentDetails] = useState({});

  function setInitFormData(documentDetails) {
    let initFormData = {
      txttitle: documentDetails ? documentDetails.Title : "",
      txtdescription: documentDetails ? documentDetails.Description : "",
    };

    return initFormData;
  }

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getDocumentDetails();
  }, []);

  const getDocumentDetails = async () => {
    if (documentid > 0) {
      let objParams = {
        DocumentId: documentid,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getDocumentDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setDocumentDetails(objResponse.Data);
            setFormData(setInitFormData(objResponse.Data));
            const fresponse = await fetchPost(
              `${config.apiBaseUrl}${ApiUrls.getDocumentFile}`,
              {
                StorageDocumentId: objResponse.Data.StorageDocumentId,
              }
            );
            if (fresponse.ok) {
              const blob = await fresponse.blob();
              const url = URL.createObjectURL(blob);
              setFileUrl(url);
            }
          } else {
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getDocumentDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    } else {
      navigateToDocuments();
    }
  };

  //PdfViewer

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnsave", "Saving", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        DocumentId: documentid,
        Title: formData.txttitle,
        Description: formData.txtdescription,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.editDocument}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              navigateToDocuments();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.editDocument}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnsave", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToDocuments = () => {
    navigate(routeNames.agentdocuments.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToDocuments();
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
                  <h6 className="mb-4 down-line pb-10">Edit Document</h6>
                </li>
              </ol>
              <form noValidate>
                <div className="container-fluid">
                  <div className="row">
                    <div className="col px-0">
                      <div className="row">
                        <div className="col-md-6 mb-15">
                          <span className="font-13 font-500">
                            Document Type : {documentDetails.DocumentType}
                          </span>
                        </div>
                        <div className="col-md-6 mb-15">
                          <span className="font-13 font-500">
                            Modified On : {documentDetails.ModifiedDateDisplay}
                          </span>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txttitle"
                            ctlType={formCtrlTypes.title}
                            isFocus={true}
                            required={true}
                            onChange={handleChange}
                            value={formData.txttitle}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={1}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <TextAreaControl
                            lblClass="mb-0"
                            name={`txtdescription`}
                            ctlType={formCtrlTypes.description500}
                            onChange={handleChange}
                            value={formData.txtdescription}
                            required={false}
                            errors={errors}
                            formErrors={formErrors}
                            rows={3}
                            tabIndex={2}
                          ></TextAreaControl>
                        </div>
                      </div>
                      {fileUrl ? (
                        <div>
                          {documentDetails.Extension === "pdf" ? (
                            <PdfViewer file={fileUrl}></PdfViewer>
                          ) : (
                            <img
                              src={fileUrl}
                              className="bg-light border rounded max-h-600"
                            ></img>
                          )}
                        </div>
                      ) : (
                        <DataLoader />
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
                            id="btnsave"
                            onClick={onSave}
                          >
                            Save
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

export default EditDocument;
