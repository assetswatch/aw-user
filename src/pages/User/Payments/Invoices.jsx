import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  convertImageToBase64,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  GridDefaultValues,
  API_ACTION_STATUS,
  SessionStorageKeys,
  ValidationMessages,
  pdfHFWMSettings,
  html2PdfSettings,
} from "../../../utils/constants";
import { Toast } from "../../../components/common/ToastView";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import TextAreaControl from "../../../components/common/TextAreaControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import html2pdf from "html2pdf.js";
import {
  generateInvoiceDownloadPDF,
  checkUserBranding,
} from "../../../utils/pdfhelper";

const Invoices = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let formErrors = {};
  const { loggedinUser } = useAuth();

  let tempInvoiceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.PreviewInvoiceId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  //check any temp invoice id exists in session storage and delete it.
  if (tempInvoiceId > 0) {
    deletesessionStorageItem(SessionStorageKeys.PreviewInvoiceId);
    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteInvoice}`, {
      ProfileId: profileid,
      AccountId: accountid,
      InvoiceId: tempInvoiceId,
    });
  }

  //Delete any checkout invoiceid
  deletesessionStorageItem(SessionStorageKeys.CheckoutInvoiceId);

  let loggedinprofiletypeid = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  //Grid
  const [invoicesList, setInvoicesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteInvoiceConfirmationMessage
  );

  const [modalMarkasPaidConfirmShow, setModalMarkasPaidConfirmShow] =
    useState(false);
  const [modalMarkasPaidConfirmContent, setModalMarkasPaidConfirmContent] =
    useState(AppMessages.MarkasPaidConfirmationMessage);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [sendInvoiceModalShow, setSendInvoiceModalShow] = useState(false);
  const [modalPayWarningShow, setModalPayWarningShow] = useState(false);

  function setInitialSendInvoiceFormData() {
    return {
      txtcomments: "",
      lblinvoicenumber: "",
      ddljoinedusers: "",
    };
  }

  const [sendInvoiceFormData, setSendInvoiceFormData] = useState(
    setInitialSendInvoiceFormData()
  );

  let formSendInvoiceErrors = {};
  const [sendInvoiceErrors, setSendInvoiceErrors] = useState({});
  const [selectedProfileType, setSelectedProfileType] = useState(
    parseInt(config.userProfileTypes.Tenant)
  );
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);
  const [invoiceSentUsers, setInvoiceSentUsers] = useState([]);
  const [selectedInvoiceSentUser, setSelectedInvoiceSentUser] = useState(null);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: "", //moment().subtract(6, "month"),
      txttodate: "", //moment(),
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData()
  );
  //Set search formdata

  //Search Date control change
  const onDateChange = (newDate, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: newDate,
    });
  };

  //Input change
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  //Set search formdata

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getInvoices({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData());
    getInvoices({ isShowall: true });
  };

  // Search events

  //Get invoices list
  const getInvoices = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    let errctl = "#search-val-err-message";
    $(errctl).html("");

    //Add date error to form errors.
    delete formErrors["date"];
    if (!isShowall) {
      if (
        !checkEmptyVal(searchFormData.txtfromdate) &&
        !checkEmptyVal(searchFormData.txttodate)
      ) {
        let dateCheck = checkStartEndDateGreater(
          searchFormData.txtfromdate,
          searchFormData.txttodate
        );

        if (!checkEmptyVal(dateCheck)) {
          formErrors["date"] = dateCheck;
        }
      }
    }

    //Validation check
    if (Object.keys(formErrors).length > 0) {
      $(errctl).html(formErrors[Object.keys(formErrors)[0]]);
    } else {
      //show loader if search actions.
      if (isSearch || isShowall) {
        apiReqResLoader("x");
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        keyword: "",
        AccountId: accountid,
        ProfileId: profileid,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
        };
      }

      return axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoices}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setInvoicesList(objResponse.Data.Invoices);
          } else {
            isapimethoderr = true;
            setInvoicesList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setInvoicesList([]);
          setPageCount(0);
          console.error(`"API :: ${ApiUrls.getInvoices}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.

  const columns = useMemo(
    () => [
      {
        Header: "Invoice #",
        accessor: "",
        className: "w-250px",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <a
              onClick={(e) => {
                onView(e, row);
              }}
            >
              <span className="gr-txt-14-b">{row.original.InvoiceNumber}</span>
              {row.original.InvoiceDirection !=
                config.directionTypes.Created && (
                <>
                  <i
                    className={`mdi font-20 min-w-30px w-30px ctooltip-container gr-badge-pill px-1 ${
                      row.original.InvoiceDirection ==
                      config.directionTypes.Sent
                        ? "gr-badge-pill-suc mdi-arrow-right"
                        : "gr-badge-pill-error mdi-arrow-left"
                    } nocnt bo-0 bg-none`}
                  >
                    <div
                      className={`ctooltip opa9 shadow ${
                        row.original.InvoiceDirection ==
                        config.directionTypes.Sent
                          ? "bg-primary"
                          : "bg-danger"
                      }`}
                    >
                      {row.original.InvoiceDirectionDisplay}
                    </div>
                  </i>
                </>
              )}
            </a>
          );
        },
      },
      {
        Header: "Bill To",
        accessor: "",
        disableSortBy: true,
        className: "w-300px",
        Cell: ({ row }) => (
          <div className="row">
            {row.original.BillToProfileId > 0 ? (
              <div
                className="cur-pointer"
                onClick={(e) => {
                  onView(e, row);
                }}
              >
                <div className="col-auto px-0">
                  <LazyImage
                    className="rounded cur-pointer w-50px mx-1"
                    src={row.original.BillToPicPath}
                    placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
                  ></LazyImage>
                </div>
                <div className="col property-info flex v-center pb-0 min-h-50 px-5 pt-0">
                  <h5 className="text-secondary">
                    {checkEmptyVal(row.original.BillToCompanyName)
                      ? row.original.BillToFirstName +
                        " " +
                        row.original.BillToLastName
                      : row.original.BillToCompanyName}

                    <div className="mt-0 py-0 small text-light">
                      {row.original.BillToProfileType}
                    </div>
                  </h5>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        ),
      },
      {
        Header: "Sent To / From",
        accessor: "",
        disableSortBy: true,
        className: "w-400px",
        Cell: ({ row }) => (
          <>
            {row.original.InvoiceDirection == config.directionTypes.Received ? (
              <div>
                <div className="col-auto px-0">
                  <LazyImage
                    className="rounded cur-pointer w-50px mx-1"
                    src={row.original.FromPicPath}
                    placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
                  ></LazyImage>
                </div>
                <div className="col property-info flex v-center pb-0 min-h-50 px-5 pt-0">
                  <h5 className="text-secondary">
                    {checkEmptyVal(row.original.FromCompanyName)
                      ? row.original.FromFirstName +
                        " " +
                        row.original.FromLastName
                      : row.original.FromCompanyName}

                    <div className="mt-0 py-0 small text-light">
                      {row.original.FromProfileType}
                    </div>
                  </h5>
                </div>
              </div>
            ) : row.original.SentProfiles.length == 1 ? (
              <div
                className="cur-pointer"
                onClick={(e) => {
                  onView(e, row);
                }}
              >
                <div className="col-auto px-0">
                  <LazyImage
                    className="rounded cur-pointer w-50px mx-1"
                    src={row.original.SentProfiles[0].PicPath}
                    placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
                  ></LazyImage>
                </div>
                <div className="col property-info flex v-center pb-0 min-h-50 px-5 pt-0">
                  <h5 className="text-secondary">
                    {checkEmptyVal(row.original.SentProfiles[0].CompanyName)
                      ? row.original.SentProfiles[0].FirstName +
                        " " +
                        row.original.SentProfiles[0].LastName
                      : row.original.SentProfiles[0].CompanyName}

                    <div className="mt-0 py-0 small text-light">
                      {row.original.SentProfiles[0].ProfileType}
                    </div>
                  </h5>
                </div>
              </div>
            ) : (
              <div className="imgs-ol-container">
                {row.original.SentProfiles.slice(0, 6).map((sp, idx) => {
                  return (
                    <div
                      className="div-img"
                      key={`${"sp-" + idx}`}
                      style={{ zIndex: 100 - idx }}
                      onClick={(e) => {
                        onView(e, row);
                      }}
                    >
                      {idx <= 5 ? (
                        <>
                          <LazyImage
                            className={`rounded-circle cur-pointer w-50px img`}
                            src={sp.PicPath}
                            placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
                          ></LazyImage>
                          <span className="tooltip lh-1">
                            {" "}
                            {checkEmptyVal(sp.CompanyName)
                              ? sp.FirstName + " " + sp.LastName
                              : sp.CompanyName}
                            <br />
                            <span className="mt-0 font-mini">
                              {sp.ProfileType}
                            </span>
                          </span>
                        </>
                      ) : (
                        <div className="more">
                          +{row.original.SentProfiles.length - 5}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ),
      },
      {
        Header: "Payment Info",
        className: "w-220px",
        Cell: ({ row }) => (
          <>
            <div className="property-info d-table">
              {/* <div>Amount: {row.original.TotalAmountDisplay}</div> */}
              {/* <div>Date: {row.original.BillDateDisplay}</div> */}
              {/* <div>Due On: {row.original.DueDateDisplay}</div> */}
              {row.original.InvoiceDirection != config.directionTypes.Created &&
                (row.original.InvoiceDirection ==
                  config.directionTypes.Received &&
                row.original.PaymentStatus ==
                  config.paymentStatusTypes.UnPaid ? (
                  <div>Due Amount: {row.original.TotalAmountDisplay}</div>
                ) : (
                  <>
                    {row.original.InvoiceDirection !=
                    config.directionTypes.Received ? (
                      <>
                        {row.original.PaymentStatus ==
                          config.paymentStatusTypes.UnPaid && (
                          <div>
                            Due Amount: {row.original.TotalAmountDisplay}
                          </div>
                        )}
                        {(row.original.PaymentStatus ==
                          config.paymentStatusTypes.PartiallyPaid ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes.Insufficientfunds ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes
                              .PayerBankNotAuthorized) && (
                          <div>
                            Due Amount: {row.original.TotalBalanceDisplay}
                          </div>
                        )}
                        {(row.original.PaymentStatus ==
                          config.paymentStatusTypes.Paid ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes.Processed) && (
                          <div>
                            Paid Amount: {row.original.TotalPaidAmountDisplay}
                          </div>
                        )}
                        <span>
                          <span
                            className={`badge badge-pill gr-badge-pill mt-2 ${
                              row.original.PaymentStatus ==
                                config.paymentStatusTypes.UnPaid &&
                              row.original.InvoiceDirection !=
                                config.directionTypes.Received
                                ? "gr-badge-pill-warning w-100px"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes.PartiallyPaid
                                ? "gr-badge-pill-info w-100px"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes.Paid
                                ? "gr-badge-pill-suc"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes.Insufficientfunds
                                ? "gr-badge-pill-error w-125px"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes
                                    .PayerBankNotAuthorized
                                ? "gr-badge-pill-error w-170px"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes.Processed
                                ? "gr-badge-pill-info w-100px"
                                : ""
                            }`}
                          >
                            {row.original.PaymentStatusDisplay}
                          </span>
                        </span>
                      </>
                    ) : row.original.PaymentStatus ==
                        config.paymentStatusTypes.Paid ||
                      row.original.PaymentStatus ==
                        config.paymentStatusTypes.Processed ? (
                      <>
                        {row.original.PaymentStatus ==
                          config.paymentStatusTypes.UnPaid && (
                          <div>
                            Due Amount: {row.original.TotalAmountDisplay}
                          </div>
                        )}
                        {(row.original.PaymentStatus ==
                          config.paymentStatusTypes.PartiallyPaid ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes.Insufficientfunds ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes
                              .PayerBankNotAuthorized) && (
                          <div>
                            Due Amount: {row.original.TotalBalanceDisplay}
                          </div>
                        )}
                        {(row.original.PaymentStatus ==
                          config.paymentStatusTypes.Paid ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes.Processed) && (
                          <div>
                            Paid Amount: {row.original.TotalPaidAmountDisplay}
                          </div>
                        )}
                        <span>
                          <span
                            className={`badge badge-pill gr-badge-pill mt-2 ${
                              row.original.PaymentStatus ==
                              config.paymentStatusTypes.Paid
                                ? "gr-badge-pill-suc"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes.Processed
                                ? "gr-badge-pill-info w-100px"
                                : ""
                            }`}
                          >
                            {row.original.PaymentStatusDisplay}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          <span
                            className={`badge badge-pill gr-badge-pill mt-2 ${
                              row.original.PaymentStatus ==
                              config.paymentStatusTypes.Insufficientfunds
                                ? "gr-badge-pill-error w-125px"
                                : row.original.PaymentStatus ==
                                  config.paymentStatusTypes
                                    .PayerBankNotAuthorized
                                ? "gr-badge-pill-error w-170px"
                                : ""
                            }`}
                          >
                            {row.original.PaymentStatusDisplay}
                          </span>
                        </span>
                        {row.original.PaymentStatus ==
                          config.paymentStatusTypes.UnPaid && (
                          <div className="mt-1">
                            Due Amount: {row.original.TotalAmountDisplay}
                          </div>
                        )}
                        {(row.original.PaymentStatus ==
                          config.paymentStatusTypes.PartiallyPaid ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes.Insufficientfunds ||
                          row.original.PaymentStatus ==
                            config.paymentStatusTypes
                              .PayerBankNotAuthorized) && (
                          <div className="mt-1">
                            Due Amount: {row.original.TotalBalanceDisplay}
                          </div>
                        )}
                        {row.original.PaymentStatus ==
                          config.paymentStatusTypes.Paid && (
                          <div className="mt-1">
                            Paid Amount: {row.original.TotalPaidAmountDisplay}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ))}

              {row.original.InvoiceDirection ==
                config.directionTypes.Received &&
                row.original.PaymentStatus != config.paymentStatusTypes.Paid &&
                row.original.PaymentStatus !=
                  config.paymentStatusTypes.Processed && (
                  <div className="mt-0">
                    <button
                      className="btn btn-primary btn-xs btn-glow shadow rounded lh-30 px-15"
                      name="btnpaynow"
                      id="btnpaynow"
                      type="button"
                      onClick={(e) => onPayNow(e, row)}
                    >
                      <i className="fa fa-credit-card position-relative me-1 t-1 text-white"></i>{" "}
                      Pay Now{" "}
                    </button>
                  </div>
                )}
            </div>
          </>
        ),
      },
      {
        Header: "Actions",
        className: "w-130px",
        actions: [
          {
            text: "View Invoice",
            onclick: (e, row) => onView(e, row),
          },
          {
            text: "Download Invoice",
            onclick: (e, row) => {
              downloadPdf(e, row);
            },
            icssclass: "pr-10 pl-2px",
          },
          {
            text: "Mark as Paid",
            onclick: (e, row) => onMarkasPaidModalShow(e, row),
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row?.original?.PaymentStatus != 1 &&
                row?.original?.SentProfiles?.length > 0
              );
            },
          },
          {
            text: "Download Receipt",
            onclick: (e, row) => {
              downloadReceiptPdf(e, row);
            },
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row?.original?.PaymentStatus == 1 ||
                row?.original?.PaymentStatus == 2
              );
            },
          },
          {
            text: "Send",
            onclick: (e, row) => onSendInvoiceModalShow(e, row),
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row.original.InvoiceDirection != config.directionTypes.Received
              );
            },
          },
          {
            text: "Delete Invoice",
            onclick: (e, row) => {
              onDeleteConfirmModalShow(e, row);
            },
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row?.original?.SentProfiles.length == 0 &&
                row?.original?.InvoiceDirection !=
                  config.directionTypes.Received
              );
            },
          },
          // {
          //   text: "Pay Now",
          //   onclick: (e, row) => onPayNow(e, row),
          //   icssclass: "pr-10 pl-2px",
          //   isconditionalshow: (row) => {
          //     return (
          //       row?.original?.PaymentId == 0 &&
          //       row?.original?.InvoiceDirection == 2
          //     );
          //   },
          // },
        ],
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getInvoices({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewInvoiceId,
      row.original.InvoiceId
    );
    navigate(routeNames.viewinvoice.path);
  };

  const downloadPdf = async (e, row) => {
    e.preventDefault();
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    let isapimethoderr = false;
    let objParams = {
      InvoiceId: parseInt(row.original.InvoiceId),
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
      .then(async (response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoicePdfDetails}`, {
            InvoiceId: parseInt(row.original.InvoiceId),
          }).then(async (presponse) => {
            let objPResponse = presponse.data;
            if (objPResponse.StatusCode === 200) {
              generateInvoiceDownloadPDF(
                objPResponse.Data,
                objResponse.Data,
                "Invoice"
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
        console.error(`"API :: ${ApiUrls.getInvoiceDetails}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
      });
  };

  const onSendInvoiceModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setSendInvoiceFormData({
      ...sendInvoiceFormData,
      lblinvoicenumber: `Invoice#: ${row.original.InvoiceNumber}`,
    });
    setSendInvoiceModalShow(true);
  };

  const onSendInvoiceModalClose = () => {
    setSendInvoiceModalShow(false);
    setSelectedGridRow(null);
    setSelectedJoinedUser(null);
    setSendInvoiceFormData(setInitialSendInvoiceFormData());
    setSendInvoiceErrors({});
    apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED, false);
  };

  const onSendInvoice = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formSendInvoiceErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formSendInvoiceErrors).length === 0) {
      setSendInvoiceErrors({});
      apiReqResLoader("btnsend", "Sending", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = new FormData();

      let selectedUsers = selectedJoinedUser
        .toString()
        .split(",")
        .map((u) => u.trim());
      for (let i = 0; i <= selectedUsers.length - 1; i++) {
        let idx = i;
        objBodyParams.append(
          `Profiles[${i}].ProfileId`,
          parseInt(selectedUsers[idx])
        );
      }
      objBodyParams.append(
        "InvoiceId",
        parseInt(selectedGridRow?.original?.InvoiceId)
      );
      objBodyParams.append("Comments", sendInvoiceFormData.txtcomments);

      axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoicePdfDetails}`, {
        InvoiceId: parseInt(selectedGridRow?.original?.InvoiceId),
      }).then(async (presponse) => {
        let objPResponse = presponse.data;
        if (objPResponse.StatusCode === 200) {
          let pdfDetails = objPResponse.Data;
          const watermarkImage = pdfDetails.BrandingDetails.WatermarkUrl;
          const base64Watermark = checkEmptyVal(watermarkImage)
            ? ""
            : await convertImageToBase64(watermarkImage);

          const pdf = await html2pdf()
            .from(pdfDetails.PdfHtml)
            .set(
              { ...html2PdfSettings },
              {
                filename: `${selectedGridRow?.original?.InvoiceNumner}.pdf`,
              }
            )
            .toPdf()
            .get("pdf")
            .then((pdf) => {
              const userBranding = checkUserBranding(
                pdfDetails?.BrandingDetails
              );
              const totalPages = pdf.internal.getNumberOfPages();
              const pageHeight = pdf.internal.pageSize.height;
              const pageWidth = pdf.internal.pageSize.width;

              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setDrawColor(
                  pdfHFWMSettings.fLineColor.r,
                  pdfHFWMSettings.fLineColor.g,
                  pdfHFWMSettings.fLineColor.b
                );
                pdf.line(
                  pdfHFWMSettings.fLinex1OffSet,
                  pageHeight - pdfHFWMSettings.fLiney1OffSet,
                  pageWidth - pdfHFWMSettings.fLinex1OffSet,
                  pageHeight - pdfHFWMSettings.fLiney1OffSet
                );

                pdf.setFontSize(pdfHFWMSettings.fFontSize);
                pdf.setFont(...pdfHFWMSettings.fFontFamily);
                pdf.setTextColor(
                  pdfHFWMSettings.fFontColor.r,
                  pdfHFWMSettings.fFontColor.g,
                  pdfHFWMSettings.fFontColor.b
                );

                if (userBranding) {
                  pdf.text(
                    pdfDetails?.BrandingDetails?.Header,
                    pageWidth / pdfHFWMSettings.pageHalf,
                    pdfHFWMSettings.hTextyOffSet,
                    pdfHFWMSettings.fCenter
                  );

                  pdf.text(
                    pdfDetails?.BrandingDetails?.Footer,
                    pageWidth / pdfHFWMSettings.pageHalf,
                    pageHeight - pdfHFWMSettings.fTextyOffSet,
                    pdfHFWMSettings.fCenter
                  );
                }

                pdf.text(
                  `Page ${i} of ${totalPages}`,
                  pageWidth - pdfHFWMSettings.fPixOffSet,
                  pageHeight - pdfHFWMSettings.fPiyOffSet,
                  pdfHFWMSettings.fRight
                );
                if (!checkEmptyVal(base64Watermark) && userBranding) {
                  pdf.setGState(new pdf.GState(pdfHFWMSettings.wmOpacity));
                  pdf.addImage(
                    base64Watermark,
                    "PNG",
                    (pageWidth - pdfHFWMSettings.wmWidth) /
                      pdfHFWMSettings.pageHalf,
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
              }

              pdf.internal.scaleFactor = pdfHFWMSettings.scaleFactor;
            })
            .outputPdf("blob")
            .then((pdf) => {
              objBodyParams.append(
                "PdfBytes",
                new Blob([pdf], { type: "application/pdf" }),
                `${selectedGridRow?.original?.InvoiceNumber}.pdf`
              );
              axiosPost(
                `${config.apiBaseUrl}${ApiUrls.sendInvoice}`,
                objBodyParams,
                {
                  "Content-Type": "multipart/form-data",
                }
              )
                .then((response) => {
                  let objResponse = response.data;
                  if (objResponse.StatusCode === 200) {
                    if (objResponse.Data.Status === 1) {
                      Toast.success(objResponse.Data.Message);
                      onSendInvoiceModalClose();
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
                    `"API :: ${ApiUrls.sendInvoice}, Error ::" ${err}`
                  );
                })
                .finally(() => {
                  if (isapimethoderr == true) {
                    Toast.error(AppMessages.SomeProblem);
                  }
                  apiReqResLoader(
                    "btnsend",
                    "Send",
                    API_ACTION_STATUS.COMPLETED
                  );
                });
            });
        }
      });
    } else {
      $(`[name=${Object.keys(formSendInvoiceErrors)[0]}]`).focus();
      setSendInvoiceErrors(formSendInvoiceErrors);
    }
  };

  const downloadReceiptPdf = async (e, row) => {
    e.preventDefault();
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    let isapimethoderr = false;
    let objParams = {
      InvoiceId: parseInt(row.original.InvoiceId),
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
      .then(async (response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          axiosPost(`${config.apiBaseUrl}${ApiUrls.getReceiptPdfDetails}`, {
            InvoiceId: row.original.InvoiceId,
          }).then(async (presponse) => {
            let objPResponse = presponse.data;
            if (objPResponse.StatusCode === 200) {
              generateInvoiceDownloadPDF(
                objPResponse.Data,
                objResponse.Data,
                "Receipt"
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
        console.error(`"API :: ${ApiUrls.getInvoiceDetails}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  //Send invoice modal actions

  const handleSendInvoiceInputChange = (e) => {
    const { name, value } = e?.target;
    setSendInvoiceFormData({
      ...sendInvoiceFormData,
      [name]: value,
    });
  };

  const handleJoinedUserChange = (e) => {
    setSelectedJoinedUser(
      e.reduce((acc, curr, index) => {
        return index === 0 ? curr.value : acc + "," + curr.value;
      }, "")
    );
  };

  useEffect(() => {
    if (sendInvoiceModalShow && joinedUsersData.length == 0) {
      const getData = () => {
        apiReqResLoader("x", "", API_ACTION_STATUS.START);
        let objParams = {
          keyword: "",
          inviterid: profileid,
          InviterProfileTypeId: 0, //loggedinprofiletypeid
          InviteeProfileTypeId: 0, //parseInt(config.userProfileTypes.Tenant)
        };

        return axiosPost(
          `${config.apiBaseUrl}${ApiUrls.getDdlJoinedUserConnections}`,
          objParams
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode == 200) {
              let data = objResponse.Data.map((item) => ({
                label: (
                  <div className="flex items-center">
                    <div className="w-40px h-40px mr-10 flex-shrink-0">
                      <img
                        alt=""
                        src={item.PicPath}
                        className="rounded cur-pointer w-40px"
                      />
                    </div>
                    <div>
                      <span className="text-primary lh-1 d-block">
                        {item.FirstName + " " + item.LastName}
                      </span>
                      <span className="small text-light">
                        {item.ProfileType}
                      </span>
                    </div>
                  </div>
                ),
                value: item.ProfileId,
                customlabel: item.FirstName + " " + item.LastName,
              }));
              setJoinedUsersData(data);
            } else {
              setJoinedUsersData([]);
            }
          })
          .catch((err) => {
            console.error(
              `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
            );
            setJoinedUsersData([]);
          })
          .finally(() => {
            setSelectedJoinedUser(null);
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          });
      };

      getData();
    }
  }, [sendInvoiceModalShow]);

  //Send invoice modal actions

  const navigateToPayments = (e) => {
    e.preventDefault();
    navigate(routeNames.paymentsaccounts.path);
  };

  const navigateToInvoiceItems = (e) => {
    e.preventDefault();
    navigate(routeNames.invoiceitems.path);
  };

  const navigateToGenerateInvoice = (e) => {
    e.preventDefault();
    navigate(routeNames.createinvoice.path);
  };

  const onPayNow = (e, row) => {
    e.preventDefault();

    let isapimethoderr = false;
    let objSubAccountsParams = {
      AccountId: parseInt(row?.original?.AccountId),
      ProfileId: parseInt(row?.original?.ProfileId),
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
            addSessionStorageItem(
              SessionStorageKeys.CheckoutInvoiceId,
              row.original.InvoiceId
            );
            navigate(routeNames.usercheckout.path);
          } else {
            setModalPayWarningShow(true);
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
        }
      });
  };

  const onPayWarningModalClose = () => {
    setModalPayWarningShow(false);
  };

  //Mark as paid Modal actions

  let formMarkasPaidErrors = {};
  const [markasPaidErrors, setMarkasPaidErrors] = useState({});
  function setInitialMarkasPaidFormData() {
    return {
      txtpaidamount: 0,
    };
  }
  const [markasPaidFormData, setMarkasPaidFormData] = useState(
    setInitialMarkasPaidFormData()
  );

  const onMarkasPaidModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalMarkasPaidConfirmContent(
      replacePlaceHolders(modalMarkasPaidConfirmContent, {
        invoicenumber: `${row?.original?.InvoiceNumber}`,
      })
    );

    let data = row?.original?.SentProfiles?.map((item) => ({
      label: (
        <div className="flex items-center">
          <div className="w-40px h-40px mr-10 flex-shrink-0">
            <img
              alt=""
              src={item.PicPath}
              className="rounded cur-pointer w-40px"
            />
          </div>
          <div>
            <span className="text-primary lh-1 d-block">
              {item.FirstName + " " + item.LastName}
            </span>
            <span className="small text-light">{item.ProfileType}</span>
          </div>
        </div>
      ),
      value: item.ProfileId,
      customlabel: item.FirstName + " " + item.LastName,
    }));

    setInvoiceSentUsers(data);

    setMarkasPaidFormData({
      ...markasPaidFormData,
      txtpaidamount:
        row.original.PaymentStatus == config.paymentStatusTypes.UnPaid
          ? row.original.TotalAmount
          : row.original.TotalBalance,
    });

    setModalMarkasPaidConfirmShow(true);
  };

  const onMarkasPaidModalClose = () => {
    setModalMarkasPaidConfirmShow(false);
    setSelectedGridRow(null);
    setInvoiceSentUsers([]);
    setSelectedInvoiceSentUser(null);
    setMarkasPaidFormData(setInitialMarkasPaidFormData());
    setMarkasPaidErrors({});
    apiReqResLoader("btnmarkaspaid", "Yes", API_ACTION_STATUS.COMPLETED, false);
    setModalMarkasPaidConfirmContent(AppMessages.MarkasPaidConfirmationMessage);
  };

  const handleMarkasPaidInputChange = (e) => {
    const { name, value } = e?.target;
    setMarkasPaidFormData({
      ...markasPaidFormData,
      [name]: value,
    });
  };

  const handleSelectedInvoiceSentUserChange = (e) => {
    setSelectedInvoiceSentUser(e?.value);
  };

  const onMarkasPaid = (e) => {
    e.preventDefault();

    if (checkEmptyVal(selectedInvoiceSentUser)) {
      formMarkasPaidErrors["ddlinvoicesentusers"] = ValidationMessages.UserReq;
    } else {
      delete formErrors["ddlinvoicesentusers"];
    }

    if (Object.keys(formMarkasPaidErrors).length === 0) {
      apiReqResLoader("btnmarkaspaid", "Yes", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        InvoiceId: parseInt(selectedGridRow?.original?.InvoiceId),
        InvoiceNumber: selectedGridRow?.original?.InvoiceNumber,
        FromId: parseInt(setSelectDefaultVal(selectedInvoiceSentUser)),
        PaidAmount: markasPaidFormData.txtpaidamount,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.markInvoiceAsPaid}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              Toast.success(objResponse.Data.Message);
              getInvoices({});
              onMarkasPaidModalClose();
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
            `"API :: ${ApiUrls.markInvoiceAsPaid}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnmarkaspaid", "Yes", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formMarkasPaidErrors)[0]}]`).focus();
      setMarkasPaidErrors(formMarkasPaidErrors);
    }
  };

  //Mark as paid Modal actions

  //Delete confirmation Modal actions

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        invoicenumber: `${row?.original?.InvoiceNumber}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeleteinvoice",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(AppMessages.DeleteInvoiceConfirmationMessage);
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader("btndeleteinvoice", "Deleting", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      InvoiceId: parseInt(selectedGridRow?.original?.InvoiceId),
      AccountId: accountid,
      ProfileId: profileid,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteInvoice}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteInvoiceSuccess);
            getInvoices({});
            onDeleteConfirmModalClose();
          } else {
            Toast.error(objResponse.Data.Message);
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.deleteInvoice}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndeleteinvoice", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Delete confirmation Modal actions

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-md-12 col-lg-6">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">Payments</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Invoices
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-lg-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded mr-10"
                    name="btnitems"
                    id="btnitems"
                    type="button"
                    onClick={navigateToInvoiceItems}
                  >
                    <i className="fa fa-file-invoice position-relative me-2 t-1"></i>{" "}
                    Items
                  </button>
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnitems"
                    id="btnitems"
                    type="button"
                    onClick={navigateToGenerateInvoice}
                  >
                    <i className="icons icon-plus position-relative me-2 t-2"></i>{" "}
                    Generate Invoice
                  </button>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToPayments}>Accounts</li>
                  <li className="active">Invoices</li>
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <div className="woo-filter-bar full-row p-3 grid-search bo-0">
                    <div className="container-fluid v-center">
                      <div className="row">
                        <div className="col px-0">
                          <form noValidate>
                            <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                              <div className="col-lg-3 col-xl-3 col-md-4">
                                <InputControl
                                  lblClass="mb-0"
                                  lblText="Search by Invoice #"
                                  name="txtkeyword"
                                  ctlType={formCtrlTypes.searchkeyword}
                                  value={searchFormData.txtkeyword}
                                  onChange={handleChange}
                                  formErrors={formErrors}
                                ></InputControl>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-4">
                                <DateControl
                                  lblClass="mb-0"
                                  lblText="Start date"
                                  name="txtfromdate"
                                  required={false}
                                  onChange={(dt) =>
                                    onDateChange(dt, "txtfromdate")
                                  }
                                  value={searchFormData.txtfromdate}
                                  isTime={false}
                                ></DateControl>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-4">
                                <DateControl
                                  lblClass="mb-0"
                                  lblText="End date"
                                  name="txttodate"
                                  required={false}
                                  onChange={(dt) =>
                                    onDateChange(dt, "txttodate")
                                  }
                                  value={searchFormData.txttodate}
                                  isTime={false}
                                  objProps={{
                                    checkVal: searchFormData.txtfromdate,
                                    days: 7,
                                  }}
                                ></DateControl>
                              </div>
                              <div className="col-lg-3 col-xl-3 col-md-6 grid-search-action">
                                <label
                                  className="mb-0 form-error w-100"
                                  id="search-val-err-message"
                                ></label>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Search"
                                  name="btnsearch"
                                  type="button"
                                  onClick={onSearch}
                                >
                                  Search
                                </button>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Show all"
                                  name="btnshowall"
                                  type="button"
                                  onClick={onShowAll}
                                >
                                  Show All
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Search End ==============*/}

                  {/*============== Grid Start ==============*/}
                  <div className="row rounded">
                    <div className="col">
                      <div className="dashboard-panel bo-top br-r-0 br-l-0 bg-white rounded overflow-hidden w-100 box-shadow-top">
                        <Grid
                          columns={columns}
                          data={invoicesList}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Invoices",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoInvoices}
                        />
                      </div>
                    </div>
                  </div>
                  {/*============== Grid End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*============== MarkasPaid Confirmation Modal Start ==============*/}
      {modalMarkasPaidConfirmShow && (
        <>
          <ModalView
            title={AppMessages.MarkasPaidConfirmationTitle}
            content={
              <>
                <span className="font-general font-400">
                  {modalMarkasPaidConfirmContent}
                </span>
                <div className="row">
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={AppMessages.DdlDefaultSelect}
                      noData={
                        selectedInvoiceSentUser == null ||
                        Object.keys(selectedInvoiceSentUser).length === 0
                          ? AppMessages.NoUsers
                          : invoiceSentUsers.length <= 0
                          ? AppMessages.DdLLoading
                          : AppMessages.NoUsers
                      }
                      options={invoiceSentUsers}
                      onChange={(e) => {
                        handleSelectedInvoiceSentUserChange(e);
                      }}
                      value={selectedInvoiceSentUser}
                      name="ddlinvoicesentusers"
                      lblText="Paid by: "
                      lbl={formCtrlTypes.users}
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={markasPaidErrors}
                      formErrors={formMarkasPaidErrors}
                      isRenderOptions={false}
                      tabIndex={1}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Paid amount ($): "
                      name="txtpaidamount"
                      ctlType={formCtrlTypes.amount}
                      required={true}
                      onChange={handleMarkasPaidInputChange}
                      value={markasPaidFormData.txtpaidamount}
                      errors={markasPaidErrors}
                      formErrors={formMarkasPaidErrors}
                      tabIndex={2}
                    ></InputControl>
                  </div>
                </div>
              </>
            }
            onClose={onMarkasPaidModalClose}
            actions={[
              {
                id: "btnmarkaspaid",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onMarkasPaid(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onMarkasPaidModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== MarkasPaid Confirmation Modal End ==============*/}

      {/*============== Send Invoice Modal Start ==============*/}
      {sendInvoiceModalShow && (
        <>
          <ModalView
            title={AppMessages.SendInvoiceModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-10">
                    <span
                      name="lblinvoicenumber"
                      className="font-general font-500"
                    >
                      {sendInvoiceFormData.lblinvoicenumber}
                    </span>
                  </div>
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={
                        selectedJoinedUser == null ||
                        Object.keys(selectedJoinedUser).length === 0
                          ? AppMessages.DdlDefaultSelect
                          : joinedUsersData.length <= 0 &&
                            selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        selectedJoinedUser == null ||
                        Object.keys(selectedJoinedUser).length === 0
                          ? AppMessages.NoUsers
                          : joinedUsersData.length <= 0 &&
                            selectedProfileType == null &&
                            selectedProfileType != null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoUsers
                      }
                      options={joinedUsersData}
                      onChange={(e) => {
                        handleJoinedUserChange(e);
                      }}
                      value={selectedJoinedUser}
                      name="ddljoinedusers"
                      lblText="Users"
                      lbl={formCtrlTypes.users}
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={sendInvoiceErrors}
                      formErrors={formSendInvoiceErrors}
                      isMulti={true}
                      isRenderOptions={false}
                      tabIndex={1}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0"
                      name={`txtcomments`}
                      ctlType={formCtrlTypes.comments}
                      onChange={handleSendInvoiceInputChange}
                      value={sendInvoiceFormData.txtcomments}
                      required={false}
                      errors={sendInvoiceErrors}
                      formErrors={formSendInvoiceErrors}
                      rows={3}
                      tabIndex={2}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onSendInvoiceModalClose}
            actions={[
              {
                id: "btnsendinvoice",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendInvoice(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendInvoiceModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Invoice Modal End ==============*/}

      {/*============== Pay Warning Modal Start ==============*/}
      {modalPayWarningShow && (
        <>
          <ModalView
            title={AppMessages.CheckoutNoSubAccountAlertTitle}
            content={
              <>
                <span className="font-general font-400">
                  {AppMessages.CheckoutNoSubAccountMessage}
                </span>
              </>
            }
            onClose={onPayWarningModalClose}
            actions={[
              {
                text: "Close",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onPayWarningModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Pay Warning Modal End ==============*/}

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndeleteinvoice",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onDelete(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onDeleteConfirmModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Delete Confirmation Modal End ==============*/}
    </>
  );
};

export default Invoices;
