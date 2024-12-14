import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  checkEmptyVal,
  checkObjNullorEmpty,
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
import {
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { DataLoader, NoData } from "../../../components/common/LazyComponents";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { themePlugin } from "@react-pdf-viewer/theme";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/common/ToastView";

const AgreementPreview = () => {
  let $ = window.$;
  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});

  const { loggedinUser } = useAuth();

  let agreementId = parseInt(
    getsessionStorageItem(SessionStorageKeys.SendAgreementId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [agreementDetails, setAgreementDetails] = useState({});

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const thumbnailPluginInstance = thumbnailPlugin({
    renderSpinner: () => <div className="square-spinner" />,
    thumbnailWidth: 150,
  });

  const handleDocumentLoad = (DocumentLoadEvent) => {
    const { activateTab } = defaultLayoutPluginInstance;

    // Activate the bookmark tab
    activateTab(0);
  };

  useEffect(() => {
    fetchPdf();
  }, []);

  const fetchPdf = async () => {
    if (agreementId > 0) {
      let objParams = {
        AgreementId: agreementId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getAgreementDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setAgreementDetails(objResponse.Data);
            const fresponse = await fetchPost(
              `${config.apiBaseUrl}${ApiUrls.getAgreementFile}`,
              {
                ...objParams,
                FileId: objResponse.Data.FileId,
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
            `"API :: ${ApiUrls.getAgreementDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    }
  };

  //PdfViewer

  const onSend = (e) => {
    e.preventDefault();

    apiReqResLoader("btnsend", "Sending", API_ACTION_STATUS.START, false);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: profileid,
      AccountId: accountid,
      AgreementId: agreementId,
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.deleteNotification}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteNotificationSuccess);
            navigateToTemplates();
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
          `"API :: ${ApiUrls.deleteNotification}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED, false);
      });
  };

  const navigateToTemplates = () => {
    deletesessionStorageItem(SessionStorageKeys.SendAgreementId);
    deletesessionStorageItem(SessionStorageKeys.ObjSendAgreement);
    navigate(routeNames.owneragreementtemplates.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToTemplates();
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
                  <h6 className="mb-4 down-line pb-10">Send Agreement</h6>
                </li>
                {!checkObjNullorEmpty(agreementDetails) && (
                  <li
                    className="breadcrumb-item active text-primary"
                    aria-current="page"
                  >
                    <span className="higlight-font text-primary font-700 font-15">
                      {agreementDetails?.Title}
                    </span>
                  </li>
                )}
              </ol>
              {/*============== Preview Agreement Start ==============*/}
              {isDataLoading && <DataLoader />}
              {!isDataLoading &&
                (checkEmptyVal(fileUrl) || fileUrl.length == 0) && <NoData />}
              {!isDataLoading && !checkEmptyVal(fileUrl) ? (
                <>
                  {/* <h6 class="mb-4 down-line  pb-10">
                    {agreementDetails?.Title}
                  </h6> */}
                  <div
                    style={{ height: "600px" }}
                    className="rounded box-shadow pb-20"
                  >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={fileUrl}
                        plugins={[
                          defaultLayoutPluginInstance,
                          thumbnailPluginInstance,
                        ]}
                        defaultScale={1.5}
                        onDocumentLoad={handleDocumentLoad}
                      />
                    </Worker>
                  </div>
                  <hr className="w-100 text-primary my-20"></hr>
                  <div className="row form-action flex-end">
                    <div
                      className="col-md-6 px-0 form-error"
                      id="form-error"
                    ></div>
                    <div className="col-md-6 px-0">
                      <button
                        className="btn btn-secondary"
                        id="btncancel"
                        onClick={onCancel}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        id="btnsend"
                        onClick={onSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="row form-action flex-end min-h-300">
                  <div
                    className="col-md-6 px-0 form-error"
                    id="form-error"
                  ></div>
                  <div className="col-md-6 px-0">
                    <button
                      className="btn btn-secondary"
                      id="btncancel"
                      onClick={onCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {/*============== Preview Agreement End ==============*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementPreview;
