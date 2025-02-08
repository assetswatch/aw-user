import React, { useCallback, useEffect, useRef, useState } from "react";
import { SetPageLoaderNavLinks } from "../../../utils/common";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
import { AppMessages } from "../../../utils/constants";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import TextAreaControl from "../../../components/common/TextAreaControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { Link, useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";

const MyAgreements = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let formErrors = {};

  //Grid
  const [servicesList, setServicesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

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

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "",
        className: "w-250px",
        disableSortBy: true,
      },
      {
        Header: "File Size",
        accessor: "",
        disableSortBy: true,
        className: "w-180px",
      },
      {
        Header: "Last Modified On",
        accessor: "",
        disableSortBy: true,
        className: "w-250px",
      },
      {
        Header: "Actions",
        className: "w-180px",
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
  }, []);

  //Setup Grid.

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
                      <h6 className="mb-3 down-line pb-10">Agreements</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10"></div>
              </div>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-4 col-xl-3 col-md-6">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search Name"
                              name="txtkeyword"
                              ctlType={formCtrlTypes.searchkeyword}
                              value={searchFormData.txtkeyword}
                              onChange={handleChange}
                              formErrors={formErrors}
                            ></InputControl>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 grid-search-action">
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
                  <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                    <Grid
                      columns={columns}
                      data={servicesList}
                      loading={isDataLoading}
                      fetchData={fetchData}
                      pageCount={pageCount}
                      totalInfo={{
                        text: "Total Agreements",
                        count: totalCount,
                      }}
                      noData={AppMessages.NoAgreements}
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

export default MyAgreements;
