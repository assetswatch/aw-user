import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
  UserCookie,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
import moment from "moment";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import { Toast } from "../../../components/common/ToastView";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";

const SharedUsers = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedinUser } = useAuth();

  let sharedid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewSharedDocUsersSharedId, 0)
  );

  let rootfolder = JSON.parse(
    getsessionStorageItem(SessionStorageKeys.ViewSharedDocRootfolder, {})
  );

  let rootfolderid = parseInt(rootfolder?.Id);
  let rootfoldername = rootfolder?.Name;

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
  const [modalRemoveAccessConfirmShow, setModalRemoveAccessConfirmShow] =
    useState(false);
  const [modalRemoveAccessConfirmContent, setModalRemoveAccessConfirmContent] =
    useState(AppMessages.DocumentRemoveAccessMessage);

  useEffect(() => {
    sharedid = parseInt(
      getsessionStorageItem(SessionStorageKeys.ViewSharedDocUsersSharedId, 0)
    );
    rootfolder = JSON.parse(
      getsessionStorageItem(SessionStorageKeys.ViewSharedDocRootfolder, {})
    );
    rootfolderid = parseInt(rootfolder?.Id);
    rootfoldername = rootfolder?.Name;

    //getUsers({});
    setSearchFormData(setSearchInitialFormData);
  }, [reloadKey]);

  useEffect(() => {
    return () => {
      //deletesessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId);
    };
  }, []);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
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
    getUsers({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getUsers({ isShowall: true });
  };

  // Search events

  //Get documents list
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
        sharedid: sharedid,
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
        className: "w-350px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded cur-pointer w-50px"
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
            ></LazyImage>
            <div className="property-info flex v-center pb-0 min-h-50">
              <h5 className="text-secondary">
                {row.original.FirstName + " " + row.original.LastName}
              </h5>
            </div>
          </>
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
          <a
            className="pr-10"
            title="Remove access"
            onClick={(e) => onRemoveAccessConfirmModalShow(e, row)}
          >
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
  const onRemoveAccessConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalRemoveAccessConfirmContent(
      replacePlaceHolders(modalRemoveAccessConfirmContent, {
        name: `${row?.original?.FirstName} ${row?.original?.LastName}`,
      })
    );
    setModalRemoveAccessConfirmShow(true);
  };

  const onRemoveAccessConfirmModalClose = () => {
    setModalRemoveAccessConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED, false);
    setModalRemoveAccessConfirmContent(AppMessages.DocumentRemoveAccessMessage);
  };

  const onRemoveAccess = (e) => {
    e.preventDefault();

    apiReqResLoader("btndelete", "Removing", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ReceiverIds: selectedGridRow?.original?.ProfileId.toString(),
      SharedId: sharedid,
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.removeSharedDocumentAccess}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          Toast.success(objResponse.Data.Message);
          if (objResponse.Data.Status == 1) {
            getUsers({});
            onRemoveAccessConfirmModalClose();
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.removeSharedDocumentAccess}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  const navigateToSharedDocuments = (e) => {
    navigate(routeNames.shareddocuments.path);
  };

  const navigateToMyDocuments = (e) => {
    navigate(routeNames.mydocuments.path);
  };

  return (
    <div key={reloadKey}>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-8">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <a
                        className="dropdown-item pl-0"
                        onClick={navigateToSharedDocuments}
                      >
                        <h6 className="mb-3 down-line pb-10">
                          Shared Documents
                        </h6>
                      </a>
                    </div>
                    <div className="breadcrumb-item bc-fh dropdown">
                      <label className="font-general font-500">
                        {rootfoldername}
                      </label>
                    </div>
                    <div className="breadcrumb-item bc-fh dropdown">
                      <label className="font-general font-500">Users</label>
                    </div>
                  </div>
                </div>
                <div className="col-4 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    onClick={navigateToSharedDocuments}
                  >
                    <i className="icons icon-arrow-left-circle position-relative me-2 t-2"></i>{" "}
                    Back
                  </button>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToMyDocuments}>My Documents</li>
                  <li className="active">Shared Documents</li>
                </ul>
              </div>
              <div className="tab-element">
                {/*============== Search Start ==============*/}
                <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                  <div className="container-fluid v-center">
                    <div className="row">
                      <div className="col px-0">
                        <form noValidate>
                          <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                            <div className="col-lg-3 col-xl-4 col-md-4">
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
                                lblText="Shared On : Start date"
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
                                lblText="Shared On : End date"
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
                            <div className="col-lg-3 col-xl-4 col-md-4 grid-search-action">
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
                        data={usersData}
                        loading={isDataLoading}
                        fetchData={fetchData}
                        pageCount={pageCount}
                        totalInfo={{
                          text: "Total Users",
                          count: totalCount,
                        }}
                        noData={AppMessages.NoUsers}
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
      {/*============== Remove access Confirmation Modal Start ==============*/}
      {modalRemoveAccessConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalRemoveAccessConfirmContent}
            onClose={onRemoveAccessConfirmModalClose}
            actions={[
              {
                id: "btndelete",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onRemoveAccess(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onRemoveAccessConfirmModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Remove access Confirmation Modal End ==============*/}
    </div>
  );
};

export default SharedUsers;