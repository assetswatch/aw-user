import React, { memo, useCallback, useRef, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
  NotificationTypes,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import moment from "moment";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { Toast } from "../../../components/common/ToastView";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";

const PropertyReport = () => {
  let $ = window.$;

  const location = useLocation();

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();
  let formErrors = {};

  //Grid
  const [usersData, setUsersData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
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

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Transaction Id",
        accessor: "",
        className: "w-350px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded cur-pointer w-80px"
              onClick={(e) => {}}
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-80px min-h-80 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <a href="#" onClick={(e) => {}}>
                <h5 className="text-secondary">
                  {row.original.FirstName + " " + row.original.LastName}
                </h5>
              </a>
              <div>
                <i className="fas fa-map-marker-alt text-primary font-13 p-r-5" />
                {row.original.City},{" "}
                {row.original.StateShortName || row.original.State},{" "}
                {row.original.CountryShortName || row.original.Country}
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Property",
        accessor: "",
        disableSortBy: true,
        className: "w-250px",
      },
      {
        Header: "Amount Paid",
        accessor: "Email",
        disableSortBy: true,
        className: "w-250px",
      },
      {
        Header: "Transaction On",
        accessor: "RepliedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Actions",
        className: "w-150px",
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
  }, []);

  //Setup Grid.

  const navigateToTransactionReport = () => {
    navigate(routeNames.transactionreport.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">Reports</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <label className="font-general font-500 cur-default">
                        Property Report
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <>
                    <li className="active">Property Report</li>
                    <li onClick={navigateToTransactionReport}>
                      Transaction Report
                    </li>
                  </>
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
                                  lblText="Search by transaction"
                                  name="txtkeyword"
                                  ctlType={formCtrlTypes.searchkeyword}
                                  value={searchFormData.txtkeyword}
                                  onChange={handleChange}
                                  formErrors={formErrors}
                                ></InputControl>
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
                                ></DateControl>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-3">
                                <DateControl
                                  lblClass="mb-0"
                                  lblText=" End date"
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
                                ></DateControl>
                              </div>
                              <div className="col-lg-4 col-xl-4 col-md-4 grid-search-action">
                                <label
                                  className="mb-0 form-error w-100"
                                  id="search-val-err-message"
                                ></label>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Search"
                                  name="btnsearch"
                                  type="button"
                                  onClick={() => {}}
                                >
                                  Search
                                </button>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Show all"
                                  name="btnshowall"
                                  type="button"
                                  onClick={() => {}}
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
                      <div className="dashboard-panel bo-top bg-white rounded overflow-hidden w-100 box-shadow-top">
                        <Grid
                          columns={columns}
                          data={usersData}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Property Report",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoReports}
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

export default PropertyReport;
