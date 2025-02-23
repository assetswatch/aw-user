import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { Grid } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
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
} from "../../../utils/constants";
import { Toast } from "../../../components/common/ToastView";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { addSessionStorageItem } from "../../../helpers/sessionStorageHelper";

const Invoices = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let formErrors = {};
  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let loggedinprofiletypeid = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  //Grid
  const [invoicesList, setInvoicesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  const [isDataLoading, setIsDataLoading] = useState(false);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(6, "month"),
      txttodate: moment(),
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
      let dateCheck = checkStartEndDateGreater(
        searchFormData.txtfromdate,
        searchFormData.txttodate
      );

      if (!checkEmptyVal(dateCheck)) {
        formErrors["date"] = dateCheck;
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
        IsSent: 0,
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

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getSentInvoices}`,
        objParams
      )
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
          console.error(`"API :: ${ApiUrls.getSentInvoices}, Error ::" ${err}`);
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

  const columns = React.useMemo(
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
            </a>
          );
        },
      },
      {
        Header: "Total Amount",
        accessor: "TotalAmountDisplay",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Payment Status",
        accessor: "PaymentId",
        disableSortBy: true,
        className: "w-180px",
        Cell: ({ row }) => (
          <>
            <span
              className={`badge badge-pill gr-badge-pill ${
                row.original.PaymentId == 0
                  ? "gr-badge-pill-warning"
                  : "gr-badge-pill-suc"
              }`}
            >
              {row.original.UserPaymentStatus}
            </span>
          </>
        ),
      },
      {
        Header: "Date",
        accessor: "BillDateDisplay",
        className: "w-200px",
      },
      {
        Header: "Due On",
        accessor: "DueDateDisplay",
        className: "w-200px",
      },
      {
        Header: "Recieved On",
        accessor: "SentDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Paid On",
        accessor: "PaidDateDisplay",
        className: "w-250px",
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
            text: "Invoice Download",
            onclick: (e, row) => {
              downloadPdf(e, row);
            },
            icssclass: "pr-10 pl-2px",
          },
          {
            text: "Pay Now",
            onclick: (e, row) => onPayNow(e, row),
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return row?.original?.PaymentId == 0;
            },
          },
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
    navigate(routeNames.tenantviewinvoice.path);
  };

  const onPayNow = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.TenantCheckoutInvoiceId,
      row.original.InvoiceId
    );
    navigate(routeNames.tenantinvoicecheckout.path);
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
          const fresponse = await fetchPost(
            `${config.apiBaseUrl}${ApiUrls.getInvoicePdf}`,
            {
              InvoiceId: parseInt(row.original.InvoiceId),
            }
          );
          if (fresponse.ok) {
            const blob = await fresponse.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${objResponse.Data?.InvoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            isapimethoderr = true;
          }
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
                <div className="col-md-12 col-lg-6 d-flex justify-content-end align-items-end pb-10"></div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
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
    </>
  );
};

export default Invoices;
