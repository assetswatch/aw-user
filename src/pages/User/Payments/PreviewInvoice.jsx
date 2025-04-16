import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
  AppMessages,
  API_ACTION_STATUS,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import {
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PdfViewer from "../../../components/common/PdfViewer";
import DataLoader from "../../../components/common/DataLoader";
import { ModalView } from "../../../components/common/LazyComponents";
import { generateInvoicePDF } from "../../../utils/pdfhelper";

const ViewInvoice = () => {
  let $ = window.$;
  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let invoiceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.PreviewInvoiceId, 0)
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

  //Modal
  const [
    modalInvoiceSendConfirmationShow,
    setModalInvoiceSendConfirmationShow,
  ] = useState(false);

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    getInvoiceDetails();
  }, []);

  const deleteTempInvoice = () => {
    if (invoiceId > 0)
      axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteInvoice}`, {
        ProfileId: profileid,
        AccountId: accountid,
        InvoiceId: invoiceId,
      });
  };

  const getInvoiceDetails = async () => {
    if (invoiceId > 0) {
      let isapimethoderr = false;
      let objParams = {
        InvoiceId: invoiceId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setInvoiceDetails(objResponse.Data);
            axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoicePdfDetails}`, {
              InvoiceId: invoiceId,
            }).then(async (presponse) => {
              let objPResponse = presponse.data;
              if (objPResponse.StatusCode === 200) {
                generateInvoicePDF(
                  objPResponse.Data,
                  objResponse.Data,
                  "Invoice",
                  setPdfBlob,
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

  const onSend = async (isSendInvoice) => {
    apiReqResLoader("btnsend", "Sending...", API_ACTION_STATUS.START);
    apiReqResLoader("btnsave", "Saving...", API_ACTION_STATUS.START);
    apiReqResLoader("btnsendproceed", "Sending...", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = new FormData();
    objBodyParams.append("InvoiceId", invoiceId);
    objBodyParams.append("AccountId", accountid);
    objBodyParams.append("ProfileId", profileid);
    objBodyParams.append("IsSendInvoice", isSendInvoice);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    objBodyParams.append(
      "PdfBytes",
      new Blob([arrayBuffer], { type: "application/pdf" }),
      `${invoiceDetails?.InvoiceNumber}.pdf`
    );
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.setInvoiceTempToActive}`,
      objBodyParams,
      {
        "Content-Type": "multipart/form-data",
      }
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data != null && objResponse.Data?.Status == 1) {
            Toast.success(objResponse.Data.Message);
            deletesessionStorageItem(SessionStorageKeys.PreviewInvoiceId);
            setModalInvoiceSendConfirmationShow(false);
            navigate(routeNames.paymentsinvoices.path);
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
          `"API :: ${ApiUrls.setInvoiceTempToActive}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btnsend", "Save & Send", API_ACTION_STATUS.COMPLETED);
        apiReqResLoader("btnsave", "Save", API_ACTION_STATUS.COMPLETED);
        apiReqResLoader(
          "btnsendproceed",
          "Proceed",
          API_ACTION_STATUS.COMPLETED
        );
      });
  };

  const onSendInvoice = async (e, isSendInvoice) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSendInvoice == 0) {
      onSend(0);
    } else {
      let isapimethoderr = false;
      apiReqResLoader("btnsend", "Sending...", API_ACTION_STATUS.START);
      apiReqResLoader("btnsave", "Saving...", API_ACTION_STATUS.START);
      let objSubAccountsParams = {
        AccountId: accountid,
        ProfileId: profileid,
        Status: `${config.paymentAccountCreateStatus.Active}`,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getPaymentSubAccountsCountByStatus}`,
        objSubAccountsParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.TotalCount > 0) {
              onSend(1);
            } else {
              setModalInvoiceSendConfirmationShow(true);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getPaymentSubAccountsCountByStatus}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
            apiReqResLoader(
              "btnsend",
              "Save & Send",
              API_ACTION_STATUS.COMPLETED
            );
            apiReqResLoader("btnsave", "Save", API_ACTION_STATUS.COMPLETED);
          }
        });
    }
  };

  //Account Creation Resitricted Modal actions

  const onInvoiceSendConfirmationModalClose = () => {
    setModalInvoiceSendConfirmationShow(false);
  };

  const navigateToInvoices = () => {
    deletesessionStorageItem(SessionStorageKeys.PreviewInvoiceId);
    deleteTempInvoice();
    navigate(routeNames.paymentsinvoices.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToInvoices();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-md-12 col-lg-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-md-4 col-lg-4 col-xl-4 mb-15">
                  <h6 className="mb-2 down-line pb-10">
                    Invoice#: {invoiceDetails?.InvoiceNumber}
                  </h6>
                </div>
                <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-md-center">
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
                  </div>
                  <div className="row mt-10 px-0 mx-0 flex fl ex-center">
                    <div className="col-md-6 px-0 col-lg-6 col-xl-6 mb-15">
                      <div className="font-500 font-general d-flex lh-1 v-center">
                        Bill To :
                        <div className="d-flex px-1 lh-1">
                          <img
                            alt=""
                            src={invoiceDetails?.BillToUser?.PicPath}
                            className="rounded img-border-white w-40px mx-1"
                          />
                        </div>
                        <div className="pt-1 px-0">
                          <div className="te xt-secondary">
                            {checkEmptyVal(
                              invoiceDetails?.BillToUser?.CompanyName
                            )
                              ? invoiceDetails?.BillToUser?.FirstName +
                                " " +
                                invoiceDetails?.BillToUser?.LastName
                              : invoiceDetails?.BillToUser?.CompanyName}
                            <div className="mt-0 pt-1 small text-light font-small font-400">
                              {invoiceDetails?.BillToUser?.ProfileType}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!checkEmptyVal(invoiceDetails.Message) && (
                      <div className="col-md-6 px-0 col-lg-6 col-xl-6 mb-15 text-md-end pt-10">
                        <span className="font-500 font-general">
                          Message : {invoiceDetails?.Message}
                        </span>
                      </div>
                    )}
                  </div>
                  <hr className="w-100 text-primary mb-20 px-0 mx-0 mt-10"></hr>
                  <div className="row form-action d-flex flex-center px-0 mx-0 my-15">
                    <div className="col-md-6 form-error" id="form-error"></div>
                    <div className="col-md-6  px-0">
                      <button
                        className="btn btn-secondary"
                        id="btncancel"
                        onClick={(e) => {
                          onCancel(e);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        id="btnsave"
                        onClick={(e) => {
                          onSendInvoice(e, 0);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-primary"
                        id="btnsend"
                        onClick={(e) => {
                          onSendInvoice(e, 1);
                        }}
                      >
                        Save & Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*============== Invoice Send Restricted Modal Start ==============*/}
      {modalInvoiceSendConfirmationShow && (
        <>
          <ModalView
            title={AppMessages.InvoiceSendNoSubAccountAlertTitle}
            content={
              <>
                <span className="font-general font-400">
                  {AppMessages.InvoiceSendNoSubAccountMessage}
                </span>
              </>
            }
            onClose={onInvoiceSendConfirmationModalClose}
            actions={[
              {
                text: "Close",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onInvoiceSendConfirmationModalClose(e),
              },
              {
                text: "Proceed",
                displayOrder: 1,
                id: "btnsendproceed",
                btnClass: "btn-primary",
                onClick: (e) => onSend(1),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Invoice Send Restricted Modal End ==============*/}
    </>
  );
};

export default ViewInvoice;
