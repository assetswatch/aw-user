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
import PdfViewer from "../../../components/common/PdfViewer";

const AgreementPreview = () => {
  let $ = window.$;
  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});

  const { loggedinUser } = useAuth();

  let agreementId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewAgreementId, 0)
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

  const onDownload = async (e, fileId, fileName) => {
    e.preventDefault();
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    let isapimethoderr = false;
    try {
      const fresponse = await fetchPost(
        `${config.apiBaseUrl}${ApiUrls.getAgreementFile}`,
        {
          AgreementId: agreementId,
          FileId: fileId,
        }
      );
      if (fresponse.ok) {
        const blob = await fresponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        isapimethoderr = true;
      }
    } catch (err) {
      isapimethoderr = true;
      console.error(`"API :: ${ApiUrls.getAgreementFile}, Error ::" ${err}`);
    } finally {
      if (isapimethoderr == true) {
        Toast.error(AppMessages.SomeProblem);
      }
      apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
    }
  };

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
    navigate(routeNames.agreementtemplates.path);
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
          <div className="row mx-auto col-xl-10 col-md-12 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-md-6 col-lg-6 col-xl-4 mb-15">
                  <h6 className="mb-2 down-line pb-10">
                    {agreementDetails?.Title}
                  </h6>
                </div>
                <div className="col-md-3 col-lg-3 col-xl-4 mb-15 text-md-center">
                  <span className="font-500 font-general">
                    Fee Type: {agreementDetails?.FeeTypeDisplay}
                  </span>
                </div>
                <div className="col-md-3 col-lg-3 col-xl-4 mb-15 text-md-end">
                  <span className="font-500 font-general">
                    Fee: {agreementDetails?.AmountDisplay}
                  </span>
                </div>
              </div>
              {/*============== Preview Agreement Start ==============*/}

              <div className="col px-0">
                {fileUrl ? (
                  <div className="min-h-300">
                    <PdfViewer
                      file={fileUrl}
                      cssclass="mt-10"
                      pageWidth={config.pdfViewerWidth.Actual}
                    ></PdfViewer>
                  </div>
                ) : (
                  <DataLoader />
                )}
              </div>

              <hr className="w-100 text-primary my-20"></hr>
              <div className="row form-action flex-end mx-0">
                <div className="col-md-6 px-0 form-error" id="form-error"></div>
                <div className="col-md-6 px-0">
                  <button
                    className="btn btn-secondary"
                    id="btncancel"
                    onClick={onCancel}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-primary"
                    id="btndownload"
                    onClick={(e) => {
                      onDownload(
                        e,
                        agreementDetails.FileId,
                        agreementDetails.Title
                      );
                    }}
                  >
                    <i className="fas fa-download position-relative me-1 t-1"></i>{" "}
                    Download
                  </button>
                  {/* <button
                        className="btn btn-primary"
                        id="btnsend"
                        onClick={onSend}
                      >
                        Send
                      </button> */}
                </div>
              </div>
              {/*============== Preview Agreement End ==============*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementPreview;
