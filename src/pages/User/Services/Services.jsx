import React, { lazy, useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
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
  API_ACTION_STATUS,
  ApiUrls,
  AppConstants,
  AppMessages,
  GridDefaultValues,
  NotificationTypes,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
import DateControl from "../../../components/common/DateControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import InputControl from "../../../components/common/InputControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { Link } from "react-router-dom";
import { routeNames } from "../../../routes/routes";

const Services = () => {
  let $ = window.$;

  let formErrors = {};

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(1, "month"),
      txttodate: moment(),
      ddlnotificationtype: null,
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
                      <h6 className="mb-3 down-line pb-10">Services</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <label className="font-general font-500 cur-default">
                        Services
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <Link
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btncreaterequest"
                    id="btncreaterequest"
                    type="button"
                    to={routeNames.createnewrequest.path}
                  >
                    <i className="flaticon-envelope flat-mini position-relative me-1 t-1"></i>{" "}
                    Create New Request
                  </Link>
                </div>
              </div>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-4 col-xl-2 col-md-6">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search by Name/ Email / Phone"
                              name="txtkeyword"
                              ctlType={formCtrlTypes.searchkeyword}
                              value={searchFormData.txtkeyword}
                              onChange={handleChange}
                              formErrors={formErrors}
                            ></InputControl>
                          </div>
                          <div className="col-lg-4 col-xl-2 col-md-3">
                            <AsyncSelect
                              name="ddlstatus"
                              lbl={formCtrlTypes.requeststatus}
                              lblClass="mb-0"
                              lblText="Request Status"
                              className="ddlborder"
                              isClearable={false}
                              isSearchCtl={true}
                              formErrors={formErrors}
                            ></AsyncSelect>
                          </div>
                          <div className="col-lg-4 col-xl-2 col-md-3">
                            <AsyncSelect
                              name="ddlrequesttype"
                              lbl={formCtrlTypes.requesttype}
                              lblClass="mb-0"
                              lblText="Request type"
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
                          <div className="col-lg-3 col-xl-2 col-md-4 grid-search-action">
                            <label
                              className="mb-0 form-error w-100"
                              id="search-val-err-message"
                            ></label>
                            <button
                              className="btn btn-primary w- 100"
                              value="Search"
                              name="btnsearch"
                              type="button"
                              onClick={null}
                            >
                              Search
                            </button>
                            <button
                              className="btn btn-primary w- 100"
                              value="Show all"
                              name="btnshowall"
                              type="button"
                              onClick={null}
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
                  <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow"></div>
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

export default Services;
