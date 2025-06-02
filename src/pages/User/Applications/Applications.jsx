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
  getCityStateCountryZipFormat,
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

const Applications = () => {
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
  const [applicationsList, setApplicationsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteApplicationConfirmationMessage
  );

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [sendApplicationModalShow, setSendApplicationModalShow] =
    useState(false);

  function setInitialSendApplicationFormData() {
    return {
      txtmessage: "",
      lblapplicationnumber: "",
      ddljoinedusers: "",
    };
  }

  const [sendApplicationFormData, setSendApplicationFormData] = useState(
    setInitialSendApplicationFormData()
  );

  let formSendApplicationErrors = {};
  const [sendApplicationErrors, setSendApplicationErrors] = useState({});
  const [selectedProfileType, setSelectedProfileType] = useState(
    parseInt(config.userProfileTypes.Tenant)
  );
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

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
    getApplications({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData());
    getApplications({ isShowall: true });
  };

  // Search events

  //Get applications list
  const getApplications = ({
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
        AssetId: 0,
        PackageId: 0,
        ApplicationTypeId: 0,
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
        `${config.apiBaseUrl}${ApiUrls.getApplications}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setApplicationsList(objResponse.Data.Applications);
          } else {
            isapimethoderr = true;
            setApplicationsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setApplicationsList([]);
          setPageCount(0);
          console.error(`"API :: ${ApiUrls.getApplications}, Error ::" ${err}`);
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
        Header: "Application Info",
        accessor: "",
        className: "w-250px",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <>
              <a
                onClick={(e) => {
                  onView(e, row);
                }}
              >
                {row.original.ApplicationDirection !=
                config.directionTypes.Received ? (
                  <span className="gr-txt-14-b">
                    {row.original.MasterApplicationNumber}
                  </span>
                ) : (
                  <span className="gr-txt-14-b">
                    {
                      row.original.SentProfiles.find(
                        (s) => s.ProfileId === profileid
                      )?.ApplicationNumber
                    }
                  </span>
                )}
                {row.original.ApplicationDirection !=
                  config.directionTypes.Created && (
                  <>
                    <i
                      className={`mdi font-20 min-w-30px w-30px ctooltip-container gr-badge-pill px-1 ${
                        row.original.ApplicationDirection ==
                        config.directionTypes.Sent
                          ? "gr-badge-pill-suc mdi-arrow-right"
                          : "gr-badge-pill-error mdi-arrow-left"
                      } nocnt bo-0 bg-none`}
                    >
                      <div
                        className={`ctooltip opa9 shadow ${
                          row.original.ApplicationDirection ==
                          config.directionTypes.Sent
                            ? "bg-primary"
                            : "bg-danger"
                        }`}
                      >
                        {row.original.ApplicationDirectionDisplay}
                      </div>
                    </i>
                  </>
                )}
              </a>
              <div className="gr-txt-14-b">{row.original.ApplicationType}</div>
            </>
          );
        },
      },
      {
        Header: "Property",
        accessor: "",
        className: "w-450px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded box-shadow cur-pointer"
              onClick={() => {}}
              src={row.original.AssetImagePath}
              alt={""}
              placeHolderClass="pos-absolute w-50px min-h-100 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <a href="#" onClick={() => {}}>
                <h5 className="text-secondary mb-1">
                  {row.original.AssetAddressOne}
                </h5>
              </a>
              {!checkEmptyVal(row.original.AssetAddressTwo) && (
                <div className="py-0">{row.original.AssetAddressTwo}</div>
              )}
              <div className="py-0">
                {getCityStateCountryZipFormat(row.original, true, [
                  "AssetCity",
                  "AssetStateShortName",
                  "AssetState",
                  "AssetCountryShortName",
                  "AssetCountry",
                  "AssetZip",
                ])}
              </div>
              <div className="price">
                <span className="text-primary">
                  {row.original.AssetPriceDisplay}
                </span>
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Sent To / From",
        accessor: "",
        disableSortBy: true,
        className: "w-400px",
        Cell: ({ row }) => (
          <>
            {row.original.ApplicationDirection ==
            config.directionTypes.Received ? (
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
        Header: "Status",
        className: "w-200px",
        Cell: ({ row }) => (
          <>
            <span
              className={`badge badge-pill gr-badge-pill mt-2 ${
                row.original.Status == config.applicationStatus.Created
                  ? "gr-badge-pill-suc w-100px"
                  : row.original.Status ==
                    config.applicationStatus.PatiallyCompleted
                  ? "gr-badge-pill-info w-140px"
                  : row.original.Status == config.applicationStatus.Pending
                  ? "gr-badge-pill-warning w-100px"
                  : row.original.Status == config.paymentStatusTypes.Completed
                  ? "gr-badge-pill-suc w-100px"
                  : ""
              }`}
            >
              {row.original.StatusDisplay}
            </span>
          </>
        ),
      },
      {
        Header: "Actions",
        className: "w-130px",
        actions: [
          {
            text: "View Application",
            onclick: (e, row) => onView(e, row),
          },
          {
            text: "Send Application",
            onclick: (e, row) => onsendApplicationModalShow(e, row),
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row.original.ApplicationDirection !=
                config.directionTypes.Received
              );
            },
          },
          {
            text: "Delete Application",
            onclick: (e, row) => {
              onDeleteConfirmModalShow(e, row);
            },
            icssclass: "pr-10 pl-2px",
            isconditionalshow: (row) => {
              return (
                row?.original?.SentProfiles.length > 0 &&
                row?.original?.ApplicationDirection !=
                  config.directionTypes.Received
              );
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
      getApplications({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewApplicationId,
      row.original.ApplicationId
    );
    navigate(routeNames.viewapplication.path);
  };

  const onsendApplicationModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setSendApplicationFormData({
      ...sendApplicationFormData,
      lblapplicationnumber: `Application#: ${row.original.MasterApplicationNumber}`,
    });
    setSendApplicationModalShow(true);
  };

  const onSendApplicationModalClose = () => {
    setSendApplicationModalShow(false);
    setSelectedGridRow(null);
    setSelectedJoinedUser(null);
    setSendApplicationFormData(setInitialSendApplicationFormData());
    setSendApplicationErrors({});
    apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED, false);
  };

  const onSendApplication = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formSendApplicationErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formSendApplicationErrors).length === 0) {
      setSendApplicationErrors({});
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
        "ApplicationId",
        parseInt(selectedGridRow?.original?.ApplicationId)
      );
      objBodyParams.append("Message", sendApplicationFormData.txtmessage);

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.sendApplication}`,
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
              getApplications({});
              onSendApplicationModalClose();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.sendApplication}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formSendApplicationErrors)[0]}]`).focus();
      setSendApplicationErrors(formSendApplicationErrors);
    }
  };

  //Grid actions

  //Send application modal actions

  const handleSendApplicationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendApplicationFormData({
      ...sendApplicationFormData,
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
    if (sendApplicationModalShow && joinedUsersData.length == 0) {
      const getData = () => {
        apiReqResLoader("x", "", API_ACTION_STATUS.START);
        let objParams = {
          keyword: "",
          inviterid: profileid,
          InviterProfileTypeId: loggedinprofiletypeid,
          InviteeProfileTypeId: parseInt(config.userProfileTypes.Tenant),
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
  }, [sendApplicationModalShow]);

  //Send application modal actions

  const navigateToGenerateApplication = (e) => {
    e.preventDefault();
    navigate(routeNames.createapplication.path);
  };

  //Delete confirmation Modal actions

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        applicationnumber: `${row?.original?.MasterApplicationNumber}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeleteapplication",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(
      AppMessages.DeleteApplicationConfirmationMessage
    );
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader(
      "btndeleteapplication",
      "Deleting",
      API_ACTION_STATUS.START
    );

    let isapimethoderr = false;
    let objBodyParams = {
      ApplicationId: parseInt(selectedGridRow?.original?.ApplicationId),
      AccountId: accountid,
      ProfileId: profileid,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteApplication}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteApplicationSuccess);
            getApplications({});
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
        console.error(`"API :: ${ApiUrls.deleteApplication}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader(
          "btndeleteapplication",
          "Yes",
          API_ACTION_STATUS.COMPLETED
        );
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
                      <h6 className="mb-3 down-line pb-10">Applications</h6>
                    </div>
                  </div>
                </div>
                {loggedinprofiletypeid != config.userProfileTypes.Tenant && (
                  <div className="col-md-12 col-lg-6 d-flex justify-content-end align-items-end pb-10">
                    <button
                      className="btn btn-primary btn-mini btn-glow shadow rounded"
                      name="btncreateapplication"
                      id="btncreateapplication"
                      type="button"
                      onClick={navigateToGenerateApplication}
                    >
                      <i className="icons icon-plus position-relative me-2 t-2"></i>{" "}
                      Create Application
                    </button>
                  </div>
                )}
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li className="active">Applications</li>
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
                                  lblText="Search by Application #"
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
                          data={applicationsList}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Applications",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoApplications}
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

      {/*============== Send Application Modal Start ==============*/}
      {sendApplicationModalShow && (
        <>
          <ModalView
            title={AppMessages.SendApplicationModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-10">
                    <span
                      name="lblapplicationnumber"
                      className="font-general font-500"
                    >
                      {sendApplicationFormData.lblapplicationnumber}
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
                      errors={sendApplicationErrors}
                      formErrors={formSendApplicationErrors}
                      isMulti={true}
                      isRenderOptions={false}
                      tabIndex={1}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0"
                      name={`txtmessage`}
                      ctlType={formCtrlTypes.message}
                      onChange={handleSendApplicationInputChange}
                      value={sendApplicationFormData.txtmessage}
                      required={false}
                      errors={sendApplicationErrors}
                      formErrors={formSendApplicationErrors}
                      rows={3}
                      tabIndex={2}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onSendApplicationModalClose}
            actions={[
              {
                id: "btnsendapplication",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendApplication(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendApplicationModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Application Modal End ==============*/}

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndeleteapplication",
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

export default Applications;
