import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
  UserCookie,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  trimCommas,
} from "../../../utils/common";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { axiosPost } from "../../../helpers/axiosHelper";
import { Toast } from "../../../components/common/ToastView";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import GridFiltersPanel from "../../../components/common/GridFiltersPanel";
import GoBackPanel from "../../../components/common/GoBackPanel";

const Members = () => {
  let $ = window.$;

  const navigate = useNavigate();
  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let formErrors = {};
  const [reloadKey, setReloadKey] = useState(new Date().toLocaleTimeString());
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [usersData, setUsersData] = useState([]);
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  let selectedReceiverIds = "";
  const [removeAccessReceiverIds, setRemoveAccessReceiverIds] = useState("");
  const checkallusersid = "checkallusers";
  const checkusersrowcssclass = "row-cb-user";
  const btnremoveaccesstoallid = "btnremoveacesstoall";
  const [modalRemoveAccessConfirmShow, setModalRemoveAccessConfirmShow] =
    useState(false);
  const [modalRemoveAccessConfirmContent, setModalRemoveAccessConfirmContent] =
    useState(AppMessages.DocumentRemoveAccessMessage);
  const [
    modalRemoveAccessToAllConfirmShow,
    setModalRemoveAccessToAllConfirmShow,
  ] = useState(false);

  useEffect(() => {
    return () => {
      //deletesessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId);
    };
  }, []);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: "", //moment().subtract(3, "month"),
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
    getUsers({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getUsers({ isShowall: true });
  };

  // Search events

  //Get users list
  const getUsers = ({
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
        sharedid: 0,
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
        `${config.apiBaseUrl}${ApiUrls.getDocumentSharedUsers}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setUsersData(objResponse.Data.Users);
          } else {
            isapimethoderr = true;
            setUsersData([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setUsersData([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getDocumentSharedUsers}, Error ::" ${err}`
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
        Header: "Name",
        accessor: "",
        className: "w-400px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="row px-5">
            <div className="custom-check-box-2 gr-cc d-flex col-auto px-0">
              <input
                className={`d-none ${checkusersrowcssclass}`}
                type="checkbox"
                value="false"
                id={row.original.ProfileId}
                data-profileid={row.original.ProfileId}
              ></input>
              <label htmlFor={row.original.ProfileId} className="pt-0"></label>
            </div>
            <div className="col-auto px-0">
              <LazyImage
                className="rounded cur-pointer w-50px mx-1"
                src={row.original.PicPath}
                alt={row.original.FirstName + " " + row.original.LastName}
                placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
              ></LazyImage>
            </div>
            <div className="col property-info flex v-center pb-0 min-h-50 px-5">
              <h5 className="text-secondary">
                {row.original.FirstName + " " + row.original.LastName}
              </h5>
            </div>
          </div>
        ),
      },
      {
        Header: "Email Id",
        accessor: "Email",
        disableSortBy: true,
        className: "w-250px",
      },
      {
        Header: "Phone Number",
        accessor: "MobileNo",
        disableSortBy: true,
        className: "w-200px",
      },

      {
        Header: "Shared On",
        accessor: "SharedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Actions",
        showActionMenu: false,
        className: "w-150px gr-action",
        Cell: ({ row }) => (
          <a className="pr-10" title="Remove access" onClick={(e) => {}}>
            <i className="fa fa-user-times pe-2 text-general font-small hovertxt-primary" />
          </a>
        ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    ({ pageIndex, pageSize }) => {
      const fetchId = ++fetchIdRef.current;
      if (fetchId === fetchIdRef.current) {
        getUsers({ pi: pageIndex, ps: pageSize });
      }
    },
    [reloadKey]
  );

  //Setup Grid.

  //Grid actions

  //Grid actions

  const navigateToAddMember = () => {
    navigate(routeNames.businessaddmember.path);
  };

  const navigateToSettings = () => {
    navigate(routeNames.settings.path);
  };

  const navigateToBusiness = () => {
    navigate(routeNames.businesses.path);
  };

  return (
    <div key={reloadKey}>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="d-flex w-100">
                  <div className="flex-grow-1">
                    <div className="breadcrumb my-1">
                      <div className="breadcrumb-item bc-fh">
                        <a
                          className="dropdown-item pl-0"
                          onClick={navigateToSettings}
                        >
                          <h6 className="mb-3 down-line pb-10">Settings</h6>
                        </a>
                      </div>
                      <div className="breadcrumb-item bc-fh ctooltip-container">
                        <span
                          className="font-general font-500 cur-pointer"
                          onClick={navigateToBusiness}
                        >
                          Business
                        </span>
                      </div>
                      <div className="breadcrumb-item bc-fh ctooltip-container">
                        <span className="font-general font-500 cur-default">
                          Members
                        </span>
                      </div>
                    </div>
                  </div>
                  <GoBackPanel clickAction={navigateToBusiness} />
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li className="active">Members</li>
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <GridFiltersPanel
                    divFilterControls={
                      <div
                        className="container-fluid v-center"
                        id="div-filters-controls-panel"
                      >
                        <div className="row">
                          <div className="col px-0">
                            <form noValidate>
                              <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                                <div className="col-lg-5 col-xl-3 col-md-4">
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
                                    }}
                                  ></DateControl>
                                </div>
                                <div className="col-lg-5 col-xl-5 col-md-8 grid-search-action">
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
                    }
                    elements={[
                      {
                        label: "Add Member",
                        icon: "icons icon-plus ",
                        onClick: navigateToAddMember,
                      },
                    ]}
                  ></GridFiltersPanel>
                  {/*============== Search End ==============*/}

                  {/*============== Grid Start ==============*/}
                  <div className="row rounded">
                    <div className="col">
                      <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                        <Grid
                          columns={columns}
                          data={usersData}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Members",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoMembers}
                          rowHover={true}
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
    </div>
  );
};

export default Members;
