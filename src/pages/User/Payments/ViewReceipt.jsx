import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  convertImageToBase64,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
  AppMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PdfViewer from "../../../components/common/PdfViewer";
import DataLoader from "../../../components/common/DataLoader";
import { generateInvoicePDF } from "../../../utils/pdfhelper";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ViewReceipt = () => {
  let $ = window.$;
  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let inoviceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewInvoiceId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let loggedinprofiletypeid = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [invoiceDetails, setInvoiceDetails] = useState({});

  const [recieverUserDetails, setRecieverUserDetails] = useState({});

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getInvoiceDetails();
  }, []);

  const getInvoiceDetails = async () => {
    if (inoviceId > 0) {
      let isapimethoderr = false;
      let objParams = {
        InvoiceId: inoviceId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setInvoiceDetails(objResponse.Data);
            if (
              objResponse.Data?.SentProfiles !== null &&
              objResponse.Data?.SentProfiles.length > 0
            ) {
              setRecieverUserDetails(
                objResponse.Data?.SentProfiles?.filter(
                  (p) => p.ProfileId == profileid
                )
              );
            }

            axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoicePdfDetails}`, {
              InvoiceId: inoviceId,
            }).then(async (presponse) => {
              let objPResponse = presponse.data;
              if (objPResponse.StatusCode === 200) {
                generateInvoicePDF(
                  objPResponse.Data,
                  objResponse.Data,
                  "Invoice",
                  null,
                  setFileUrl
                );
              } else {
                isapimethoderr = true;
              }
            });
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getInvoiceDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            setFileUrl("File load Error");
            Toast.error(AppMessages.SomeProblem);
          }
          setIsDataLoading(false);
        });
    } else {
      navigateToInvoices();
    }
  };

  //PdfViewer

  const navigateToInvoices = () => {
    navigate(routeNames.paymentsinvoices.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToInvoices();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToInvoices}
                      >
                        Invoices
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        View Receipt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-12 col-lg-10 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row">
                    <div className="d-flex w-100">
                      <div className="flex-grow-1">
                        <h6 className="mb-3 down-line pb-10 px-0 font-16">
                          Invoice#: {invoiceDetails?.InvoiceNumber}
                        </h6>
                      </div>
                      <GoBackPanel
                        clickAction={navigateToInvoices}
                        isformBack={true}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-15 text-md-end">
                      {" "}
                      <span className="font-500 font-general">
                        Received On : {recieverUserDetails[0]?.SentDateDisplay}
                      </span>
                    </div>
                    <div className="col-md-4 col-lg-4 col-xl-4 mb-15">
                      <span className="font-500 font-general">
                        Total Due : {invoiceDetails?.TotalAmountDisplay}
                      </span>
                    </div>
                    <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-md-center">
                      {" "}
                      <span className="font-500 font-general">
                        Date On : {invoiceDetails?.BillDateDisplay}
                      </span>
                    </div>
                    <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-md-end">
                      <span className="font-500 font-general">
                        Due On : {invoiceDetails?.DueDateDisplay}
                      </span>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col px-0">
                        {fileUrl ? (
                          <div className="min-h-300">
                            <PdfViewer
                              file={fileUrl}
                              cssclass="mt-10"
                              pageWidth={config.pdfViewerWidth.PageWidth}
                            ></PdfViewer>
                          </div>
                        ) : (
                          <DataLoader />
                        )}
                        {!checkEmptyVal(invoiceDetails.Message) && (
                          <span className="font-500 font-general">
                            Message : {invoiceDetails?.Message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <hr className="text-primary my-20 row"></hr>
                    <div className="row form-action flex-center">
                      <div
                        className="col-md-6 px-0 form-error"
                        id="form-error"
                      ></div>
                      <div className="col-md-6 px-0">
                        <button
                          className="btn btn-secondary"
                          id="btnCancel"
                          onClick={onCancel}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Sent Invoice users grid ==============*/}
    </>
  );
};

export default ViewReceipt;
