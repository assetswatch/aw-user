import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { Grid, ModalView } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  GridDefaultValues,
  API_ACTION_STATUS,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { usePaymentAccountCreateStatusGateway } from "../../../hooks/usePaymentAccountCreateStatusGateway";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { Toast } from "../../../components/common/ToastView";

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

  const { paymentAccountCreateStatusList } =
    usePaymentAccountCreateStatusGateway();

  //Modal
  const [
    modalAccountCreationResitrictedShow,
    setModalAccountCreationResitrictedShow,
  ] = useState(false);

  //Grid
  const [accountsList, setAccountsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [isDataLoading, setIsDataLoading] = useState(false);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: "",
      txttodate: "",
      ddlstatus: -1,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData()
  );
  //Set search formdata

  //Search ddl controls changes
  const ddlChange = (e, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: e?.value,
    });
  };

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
    getAccounts({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData());
    getAccounts({ isShowall: true });
  };

  // Search events

  //Get accounts list
  const getAccounts = ({
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
        ChannelId: 1,
        fromdate: setSearchInitialFormData().txtfromdate,
        todate: setSearchInitialFormData().txttodate,
        status: setSearchInitialFormData().ddlstatus,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
          status: parseInt(setSelectDefaultVal(searchFormData.ddlstatus, -1)),
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getPaymentSubAccounts}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setAccountsList(objResponse.Data.Accounts);
          } else {
            isapimethoderr = true;
            setAccountsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setAccountsList([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getPaymentSubAccounts}, Error ::" ${err}`
          );
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
        Header: "Email",
        accessor: "Email",
        className: "w-250px",
        disableSortBy: true,
      },
      {
        Header: "DBA Name",
        accessor: "DbaName",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Legal Name",
        accessor: "LegalName",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Status",
        accessor: "StatusDisplay",
        disableSortBy: true,
        className: "w-180px",
        Cell: ({ row }) => (
          <>
            <span
              className={`badge badge-pill gr-badge-pill ${
                row.original.Status == config.paymentAccountCreateStatus.Active
                  ? "gr-badge-pill-suc"
                  : row.original.Status ==
                    config.paymentAccountCreateStatus.Pending
                  ? "gr-badge-pill-warning"
                  : row.original.Status ==
                    config.paymentAccountCreateStatus.Processing
                  ? "gr-badge-pill-info"
                  : row.original.Status ==
                    config.paymentAccountCreateStatus.Rejected
                  ? "gr-badge-pill-error"
                  : ""
              }`}
            >
              {row.original.StatusDisplay}
            </span>
          </>
        ),
      },
      {
        Header: "Created On",
        accessor: "CreatedDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        showActionMenu: false,
        className: "w-150px gr-action",
        Cell: ({ row }) => "",
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getAccounts({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewPaymentSubAccountId,
      row.original.SubAccountId
    );
    navigate(routeNames.paymentscreateaccount.path);
  };

  //Grid actions

  const navigateToPayments = (e) => {
    e.preventDefault();
    navigate(routeNames.paymentsaccounts.path);
  };

  //Account Creation Resitricted Modal actions

  const onAccountCreationResitrictedClose = () => {
    setModalAccountCreationResitrictedShow(false);
  };

  //Account Creation Resitricted Modal actions

  const navigateToInvoiceItems = (e) => {
    e.preventDefault();
    navigate(routeNames.invoiceitems.path);
  };

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
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnitems"
                    id="btnitems"
                    type="button"
                    onClick={navigateToInvoiceItems}
                  >
                    <i className="fa fa-list position-relative me-1 t-1"></i>{" "}
                    Items
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
                              <div className="col-lg-4 col-xl-3 col-md-6">
                                <InputControl
                                  lblClass="mb-0"
                                  lblText="Search by Email / Name"
                                  name="txtkeyword"
                                  ctlType={formCtrlTypes.searchkeyword}
                                  value={searchFormData.txtkeyword}
                                  onChange={handleChange}
                                  formErrors={formErrors}
                                ></InputControl>
                              </div>
                              <div className="col-lg-2 col-xl-2 col-md-4">
                                <AsyncSelect
                                  placeHolder={
                                    paymentAccountCreateStatusList.length <=
                                      0 && searchFormData.ddlstatus == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    paymentAccountCreateStatusList.length <=
                                      0 && searchFormData.ddlstatus == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={paymentAccountCreateStatusList}
                                  dataKey="Id"
                                  dataVal="Type"
                                  onChange={(e) => ddlChange(e, "ddlstatus")}
                                  value={searchFormData.ddlstatus}
                                  defualtselected={searchFormData.ddlstatus}
                                  name="ddlstatus"
                                  lbl={formCtrlTypes.status}
                                  lblClass="mb-0"
                                  lblText="Status"
                                  className="ddlborder"
                                  isClearable={false}
                                  isSearchCtl={true}
                                  formErrors={formErrors}
                                ></AsyncSelect>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-3">
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
                                  formErrors={formErrors}
                                ></DateControl>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-3">
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
                                  }}
                                  formErrors={formErrors}
                                ></DateControl>
                              </div>
                              <div className="col-lg-6 col-xl-3 col-md-6 grid-search-action">
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
                          data={accountsList}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Accounts",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoAccounts}
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

      {/*============== Account Creation Restricted Modal Start ==============*/}
      {modalAccountCreationResitrictedShow && (
        <>
          <ModalView
            title={AppMessages.AccountCreationRestrictedTitle}
            content={
              <>
                <span className="font-general font-400">
                  {AppMessages.AccountCreationRestrictedModalMessage}
                </span>
              </>
            }
            onClose={onAccountCreationResitrictedClose}
            actions={[
              {
                text: "Close",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onAccountCreationResitrictedClose(e),
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
