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
  API_ACTION_STATUS,
  html2PdfSettings,
  pdfHFWMSettings,
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
import html2pdf from "html2pdf.js";

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

  const generatePDF = async (pdfDetails, invoiceDetails) => {
    const watermarkImage = pdfDetails.BrandingDetails.WatermarkUrl;
    const base64Watermark = await convertImageToBase64(watermarkImage);

    const pdf = await html2pdf()
      .from(pdfDetails.PdfHtml)
      .set(
        { ...html2PdfSettings },
        {
          filename: `${invoiceDetails?.InvoiceNumner}.pdf`,
        }
      )
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageHeight = pdf.internal.pageSize.height;
        const pageWidth = pdf.internal.pageSize.width;

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          pdf.setDrawColor(pdfHFWMSettings.fLineColor);
          pdf.line(
            pdfHFWMSettings.fLinex1OffSet,
            pageHeight - pdfHFWMSettings.fLiney1OffSet,
            pageWidth - pdfHFWMSettings.fLinex1OffSet,
            pageHeight - pdfHFWMSettings.fLiney1OffSet
          );

          pdf.setFontSize(pdfHFWMSettings.fFontSize);
          pdf.setFont(...pdfHFWMSettings.fFontFamily);
          pdf.setTextColor(pdfHFWMSettings.fFontColor);
          pdf.text(
            pdfDetails?.BrandingDetails?.Footer,
            pageWidth / pdfHFWMSettings.pageHalf,
            pageHeight - pdfHFWMSettings.fTextyOffSet,
            pdfHFWMSettings.fCenter
          );

          pdf.text(
            `Page ${i} of ${totalPages}`,
            pageWidth - pdfHFWMSettings.fPixOffSet,
            pageHeight - pdfHFWMSettings.fPiyOffSet,
            pdfHFWMSettings.fRight
          );

          pdf.setGState(new pdf.GState(pdfHFWMSettings.wmOpacity));
          pdf.addImage(
            base64Watermark,
            "PNG",
            (pageWidth - pdfHFWMSettings.wmWidth) / pdfHFWMSettings.pageHalf,
            (pageHeight -
              (pdfHFWMSettings.wmHeight - pdfHFWMSettings.wmyOffSet)) /
              pdfHFWMSettings.pageHalf,
            pdfHFWMSettings.wmWidth,
            pdfHFWMSettings.wmHeight,
            "",
            "FAST"
          );
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        }

        pdf.internal.scaleFactor = pdfHFWMSettings.scaleFactor;
      })
      .outputPdf("blob")
      .then((pdf) => {
        const pdfBlobUrl = URL.createObjectURL(pdf);
        setFileUrl(pdfBlobUrl);

        // pdf.save("StyledPDF.pdf");
      });
  };

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
                generatePDF(objPResponse.Data, objResponse.Data);
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
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-md-12 col-lg-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-md-6 mb-15">
                  <h6 className="mb-2 down-line pb-10">
                    Invoice#: {invoiceDetails?.InvoiceNumber}
                  </h6>
                </div>
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
      {/*============== Sent Invoice users grid ==============*/}
    </>
  );
};

export default ViewReceipt;
