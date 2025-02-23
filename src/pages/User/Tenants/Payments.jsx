import React, { memo, useCallback, useRef, useState } from "react";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  setSelectDefaultVal,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { usePaymentStatusTypesGateway } from "../../../hooks/usePaymentStatusTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { addSessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";

const Payments = () => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  const { paymentStatusTypes } = usePaymentStatusTypesGateway();

  //Grid
  const [paymentsData, setPaymentsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
      ddlstatus: paymentStatusTypes?.[0]?.["Id"],
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
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
    getPayments({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getPayments({ isShowall: true });
  };

  // Search events

  //Get payments list
  const getPayments = ({
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
        ProfileId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        ProfileTypeId: config.userProfileTypes.Tenant,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        status: setSearchInitialFormData.ddlstatus,
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
        `${config.apiBaseUrl}${ApiUrls.getAssetPayments}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setPaymentsData(objResponse.Data.Payments);
          } else {
            isapimethoderr = true;
            setPaymentsData([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setPaymentsData([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getAssetPayments}, Error ::" ${err}`
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
        Header: "Property",
        accessor: "title",
        className: "w-400px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded box-shadow"
              src={row.original.AssetImagePath}
              alt={row.original.AddressOne}
              placeHolderClass="pos-absolute w-140px min-h-100 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <h5 className="text-secondary">{row.original.AddressOne}</h5>

              <div>
                <i className="fas fa-map-marker-alt text-primary font-13 p-r-5" />
                {row.original.City} {row.original.State} {row.original.Country}
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Amount",
        className: "w-180px",
        Cell: ({ row }) => (
          <>
            <span>
              {row.original.Status == config.paymentStatusTypes.Paid
                ? row.original.PaidAmountDisplay
                : row.original.Status == config.paymentStatusTypes.Pending
                ? row.original.TotalAmountDisplay
                : ""}
            </span>
          </>
        ),
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
                row.original.Status == config.paymentStatusTypes.Paid
                  ? "gr-badge-pill-suc"
                  : row.original.Status == config.paymentStatusTypes.Pending
                  ? "gr-badge-pill-warning"
                  : ""
              }`}
            >
              {row.original.StatusDisplay}
            </span>
          </>
        ),
      },
      {
        Header: "Paid On",
        accessor: "PaidDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Action",
        showActionMenu: false,
        className: "w-150px gr-action",
        Cell: ({ row }) =>
          row.original.Status == config.paymentStatusTypes.Pending ? (
            <button
              className="btn btn-primary btn-xs btn-glow shadow rounded"
              name="btnsendnotificationmodal"
              id="btnsendnotificationmodal"
              type="button"
              onClick={(e) => {
                onPaynow(e, row);
              }}
            >
              <i className="fa fa-credit-card position-relative me-1 t-1 text-white"></i>{" "}
              Pay now
            </button>
          ) : (
            ""
          ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getPayments({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  const onPaynow = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.TenantCheckoutPaymentId,
      row.original.PaymentId
    );
    navigate(routeNames.tenantinvoicecheckout.path);
  };

  //Setup Grid.

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Payments</h5>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-3 col-xl-3 col-md-6">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search Property"
                              name="txtkeyword"
                              ctlType={formCtrlTypes.searchkeyword}
                              value={searchFormData.txtkeyword}
                              onChange={handleChange}
                              formErrors={formErrors}
                            ></InputControl>
                          </div>
                          <div className="col-lg-3 col-xl-2 col-md-6">
                            <AsyncSelect
                              placeHolder={
                                paymentStatusTypes.length <= 0 &&
                                searchFormData.ddlstatus == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                paymentStatusTypes.length <= 0 &&
                                searchFormData.ddlstatus == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={paymentStatusTypes}
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
                          <div className="col-lg-3 col-xl-2 col-md-4">
                            <DateControl
                              lblClass="mb-0"
                              lblText="Start date"
                              name="txtfromdate"
                              required={false}
                              onChange={(dt) => onDateChange(dt, "txtfromdate")}
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
                              onChange={(dt) => onDateChange(dt, "txttodate")}
                              value={searchFormData.txttodate}
                              isTime={false}
                              objProps={{
                                checkVal: searchFormData.txtfromdate,
                              }}
                            ></DateControl>
                          </div>
                          <div className="col-lg-3 col-xl-3 col-md-4 grid-search-action">
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
                  <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                    <Grid
                      columns={columns}
                      data={paymentsData}
                      loading={isDataLoading}
                      fetchData={fetchData}
                      pageCount={pageCount}
                      totalInfo={{
                        text: "Total Payments",
                        count: totalCount,
                      }}
                      noData={AppMessages.NoPayments}
                    />
                  </div>
                </div>
              </div>
              {/*============== Grid End ==============*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payments;
