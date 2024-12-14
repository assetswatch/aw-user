import React, { memo, useCallback, useRef, useState } from "react";
import { Grid } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { useNavigate } from "react-router-dom";
import { useDocSharedTypesGateway } from "../../../hooks/useDocSharedTypesGateway";

const SharedDocuments = memo(() => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let { docSharedTypes } = useDocSharedTypesGateway(true);

  //Grid
  const [documentsData, setDocumentsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
      ddlsharedtype: docSharedTypes?.[0]?.["Id"],
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
    getDocuments({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getDocuments({ isShowall: true });
  };

  // Search events

  //Get documents list
  const getDocuments = ({
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
        accountid: accountid,
        profileid: profileid,
        sharedtypeid: parseInt(
          setSelectDefaultVal(searchFormData.ddlsharedtype)
        ),
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
        `${config.apiBaseUrl}${ApiUrls.getSharedDocuments}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setDocumentsData(objResponse.Data.Folders);
          } else {
            isapimethoderr = true;
            setDocumentsData([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setDocumentsData([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getSharedDocuments}, Error ::" ${err}`
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
        Header: "Name / Title",
        accessor: "",
        className: "w-300px",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div
              style={{ paddingLeft: `${row.depth * 30}px` }}
              className="gr-link"
            >
              {row.original.IsFolder === 1 ? (
                <span
                  className="gr-txt-14-b"
                  onClick={() => row.toggleRowExpanded(!row.isExpanded)}
                >
                  <i
                    className={`${
                      !row.isExpanded ? "fa fa-folder" : "far fa-folder-open"
                    } gr-icon`}
                  ></i>
                  {row.original.Title}
                </span>
              ) : (
                <span className="gr-txt-14-b">
                  <i className={`far fa-file-lines gr-icon`}></i>
                  {row.original.Title}
                </span>
              )}
            </div>
          );
        },
      },
      {
        Header: "Share Type",
        accessor: "SharedType",
        disableSortBy: true,
        className: "w-180px",
        Cell: ({ row }) => (
          <>
            {row.depth === 0 && (
              <span
                className={`badge badge-pill gr-badge-pill nocnt text-center w-80px ${
                  row.original.SharedTypeId == config.sharedTypes.Sent
                    ? "gr-badge-pill-suc"
                    : row.original.SharedTypeId == config.sharedTypes.Received
                    ? "gr-badge-pill-error"
                    : ""
                }`}
              >
                {row.original.SharedType}
              </span>
            )}
          </>
        ),
      },
      {
        Header: "Document Type",
        accessor: "DocumentType",
        className: "w-250px",
      },
      {
        Header: "Shared On",
        accessor: "ModifiedDateDisplay",
        className: "w-200px",
      },
      {
        Header: "Actions",
        className: "w-150px",
        isDocActionMenu: true,
        actions: [
          {
            text: "View",
          },
          {
            text: "Delete",
            //onclick: (e, row) => onDeleteConfirmModalShow(e, row),
          },
          {
            text: "Reject",
            //onclick: (e, row) => onDeleteConfirmModalShow(e, row),
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
      getDocuments({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  //Grid actions

  return (
    <>
      <div className="woo-filter-bar full-row p-3 grid-search bo-0">
        <div className="container-fluid v-center">
          <div className="row">
            <div className="col px-0">
              <form noValidate>
                <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                  <div className="col-lg-3 col-xl-3 col-md-4">
                    <InputControl
                      lblClass="mb-0"
                      lblText="Search by Name / Title"
                      name="txtkeyword"
                      ctlType={formCtrlTypes.searchkeyword}
                      value={searchFormData.txtkeyword}
                      onChange={handleChange}
                      formErrors={formErrors}
                    ></InputControl>
                  </div>
                  <div className="col-lg-3 col-xl-2 col-md-4">
                    <AsyncSelect
                      placeHolder={
                        docSharedTypes.length <= 0 &&
                        searchFormData.ddlsharedtype == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        docSharedTypes.length <= 0 &&
                        searchFormData.ddlsharedtype == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlNoData
                      }
                      options={docSharedTypes}
                      dataKey="Id"
                      dataVal="Type"
                      onChange={(e) => ddlChange(e, "ddlsharedtype")}
                      value={searchFormData.ddlsharedtype}
                      name="ddlsharedtype"
                      lbl={formCtrlTypes.sharedtype}
                      lblClass="mb-0"
                      lblText="Share type"
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
                  <div className="col-lg-4 col-xl-3 col-md-6 grid-search-action">
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

      {/*============== Grid Start ==============*/}
      <div className="row rounded">
        <div className="col">
          <div className="dashboard-panel bo-top bg-white rounded overflow-hidden w-100 box-shadow-top">
            <Grid
              columns={columns}
              data={documentsData}
              loading={isDataLoading}
              fetchData={fetchData}
              pageCount={pageCount}
              totalInfo={{
                text: "Total Documents",
                count: totalCount,
              }}
              noData={AppMessages.NoDocuments}
              getSubRows={(row) => {
                return row.Documents || [];
              }}
            />
          </div>
        </div>
      </div>
      {/*============== Grid End ==============*/}
    </>
  );
});

export default SharedDocuments;
