import React, { lazy, useCallback, useEffect, useRef, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  debounce,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import config from "../../../config.json";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
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
import moment from "moment";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes, Regex } from "../../../utils/formvalidation";
import { useUserConnectionStatusTypesGateway } from "../../../hooks/useUserConnectionStatusTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
import { useUserConnectionRequestTypes } from "../../../hooks/useUserConnectionRequestTypes";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { Toast } from "../../../components/common/ToastView";
import { routeNames } from "../../../routes/routes";

const Agents = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();
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
  let formErrors = {};

  const { userConnectionStatusTypes } = useUserConnectionStatusTypesGateway();
  const { userConnectionRequestTypes } = useUserConnectionRequestTypes();

  let formSendInvitaionErrors = {};
  const [sendInvitationErrors, setSendInvitationErrors] = useState({});
  const [sendInviteModalState, setSendInviteModalState] = useState(false);
  const [selectedUsersProfile, setSelectedUsersProfile] = useState(null);
  const [inputProfileValue, setInputProfileValue] = useState("");
  function setInitialSendInvitationFormData() {
    return {
      txtmessage: "",
    };
  }

  const [sendInvitationFormData, setSendInvitationFormData] = useState(
    setInitialSendInvitationFormData()
  );

  //Modal
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteInvitationConfirmationMessage
  );

  //Grid
  const [usersData, setUsersData] = useState([]);
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
      ddlstatus: userConnectionStatusTypes?.[0]?.["Id"],
      ddlrequesttype: userConnectionRequestTypes?.[0]?.["Id"],
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
        inviterid: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        InviterProfileTypeId: loggedinprofiletypeid,
        InviteeProfileTypeId: config.userProfileTypes.Agent,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        status: setSearchInitialFormData.ddlstatus,
        requesttypeid: setSearchInitialFormData.ddlrequesttype,
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
          requesttypeid: parseInt(
            setSelectDefaultVal(searchFormData.ddlrequesttype, -1)
          ),
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getUserConnections}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setUsersData(objResponse.Data.UserConnections);
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
            `"API :: ${ApiUrls.getUserConnections}, Error ::" ${err}`
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
              className="rounded-circle w-50px shadow img-border-white lh-1"
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
            ></LazyImage>
            <div
              className={`property-info ${
                row.original.ProfileId == 0 ? "d-flex" : "d-table"
              }`}
            >
              <div className="d-flex">
                <h6
                  className={`${
                    row.original.RequestTypeId ==
                    config.userConnectionRequestTypes.Sent
                      ? "text-primary"
                      : "text-error"
                  }  font-general font-400 mb-0 pb-0 pr-1`}
                >
                  {row.original.ProfileId != 0
                    ? row.original.FirstName + " " + row.original.LastName
                    : row.original.Email}
                </h6>
                <i
                  className={`mdi font-20 min-w-30px w-30px ctooltip-container gr-badge-pill px-1 ${
                    row.original.RequestTypeId ==
                    config.userConnectionRequestTypes.Sent
                      ? "gr-badge-pill-suc mdi-arrow-right-bold"
                      : "gr-badge-pill-error mdi-arrow-left-bold"
                  } nocnt bo-0 bg-none py-0`}
                >
                  <div
                    className={`ctooltip opa9 shadow ${
                      row.original.RequestTypeId ==
                      config.userConnectionRequestTypes.Sent
                        ? "bg-primary"
                        : "bg-danger"
                    }`}
                  >
                    {row.original.RequestType}
                  </div>
                </i>
              </div>
              {row.original.ProfileId != 0 && (
                <>
                  <div className="py-1">
                    <i className="far fa-envelope font-13 p-r-5" />
                    {row.original.Email}
                  </div>
                  <div className="py-1">
                    <i className="flat-mini flaticon-phone-call font-13 p-r-5" />
                    {row.original.MobileNo}
                  </div>
                </>
              )}
            </div>
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
                row.original.Status == config.userConnectionStatusTypes.Joined
                  ? "gr-badge-pill-suc"
                  : row.original.Status ==
                    config.userConnectionStatusTypes.Pending
                  ? "gr-badge-pill-warning"
                  : row.original.Status ==
                      config.userConnectionStatusTypes.Rejected ||
                    row.original.Status ==
                      config.userConnectionStatusTypes.Terminated
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
        Header: "Invited On",
        accessor: "InvitedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Replied On",
        accessor: "RepliedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Terminated On",
        accessor: "TerminatedDateDisplay",
        className: "w-180px text-left",
      },
      {
        Header: "Actions",
        className: "w-150px",
        isUserConnectionActionMenu: true,
        actions: [
          {
            text: "Send Message",
            onclick: (e, row) => {
              onSendMessageModalShow(e, row.original);
            },
          },
          {
            text: "Delete Invitaion",
            isconditionalshow: (row) => {
              return row?.original?.ProfileId == 0;
            },
            onclick: (e, row) => {
              onDeleteConfirmModalShow(e, row.original);
            },
          },
          {
            text: "Terminate",
            icon: "userterminate",
            onclick: (e, row) => {
              onStatusChange(
                e,
                row.original,
                config.userConnectionStatusTypes.Terminated
              );
            },
          },
          {
            text: "Accept",
            onclick: (e, row) => {
              onStatusChange(
                e,
                row.original,
                config.userConnectionStatusTypes.Joined
              );
            },
          },
          {
            text: "Reject",
            onclick: (e, row) => {
              onStatusChange(
                e,
                row.original,
                config.userConnectionStatusTypes.Rejected
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
      getUsers({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid Actions

  const onStatusChange = (e, selectedRow, statusId) => {
    e.preventDefault();
    apiReqResLoader("x", "", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: profileid,
      AccountId: accountid,
      Id: parseInt(selectedRow?.Id),
      Status: statusId,
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.updateUserConnectionStatus}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          Toast.success(objResponse.Data.Message);
          if (objResponse.Data.Id > 0) {
            getUsers({});
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.updateUserConnectionStatus}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid Actions

  //Delete confirmation Modal actions

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        email: `${row?.Email}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeleteinvitation",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(
      AppMessages.DeleteInvitationConfirmationMessage
    );
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader("btndeleteinvitation", "Deleting", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      Id: parseInt(selectedGridRow?.Id),
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.deleteRegistrationInvitation}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteInvitationSuccess);
            getUsers({});
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
        console.error(
          `"API :: ${ApiUrls.deleteRegistrationInvitation}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader(
          "btndeleteinvitation",
          "Yes",
          API_ACTION_STATUS.COMPLETED
        );
      });
  };

  //Delete confirmation Modal actions

  // Send invite modal

  //Get user profiles
  const getUsersProfiles = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];
    let objParams = {
      AccountId: accountid,
      ProfileId: profileid,
      ProfileTypeId: config.userProfileTypes.Agent,
      Keyword: searchValue,
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlUsersProfiles}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          return objResponse.Data.map((item) => ({
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
                  <span className="small text-light">{item.ProfileType}</span>
                </div>
              </div>
            ),
            value: item.ProfileId,
            customlabel: item.FirstName + " " + item.LastName,
          }));
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlUsersProfiles}, Error ::" ${err}`
        );
        return [];
      });
  };

  const usersProfilesOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getUsersProfiles(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay),
    []
  );

  const handleDdlUsersProfilesChange = () => {
    usersProfilesOptions();
  };

  const handleInputProfileChange = (newValue, actionMeta) => {
    if (
      actionMeta.action !== "menu-close" &&
      actionMeta.action !== "input-blur"
    ) {
      setInputProfileValue(newValue);
    }
  };

  const handleSendInvitationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendInvitationFormData({
      ...sendInvitationFormData,
      [name]: value,
    });
  };

  const onSendInviteModalShow = (e) => {
    e.preventDefault();
    setSendInviteModalState(true);
  };

  const onSendInviteModalHide = (e) => {
    e?.preventDefault();
    setSendInviteModalState(false);
    setSelectedUsersProfile(null);
    setInputProfileValue("");
    setSendInvitationErrors({});
    setSendInvitationFormData(setInitialSendInvitationFormData());
  };

  const onSendInvitation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      checkEmptyVal(selectedUsersProfile) &&
      checkEmptyVal(inputProfileValue)
    ) {
      formSendInvitaionErrors["ddlusersprofiles"] = ValidationMessages.AgentReq;
    } else if (
      !checkEmptyVal(inputProfileValue) &&
      !Regex.email.pattern.test(inputProfileValue)
    ) {
      formSendInvitaionErrors["ddlusersprofiles"] =
        ValidationMessages.EmailInvalid;
    }

    if (Object.keys(formSendInvitaionErrors).length === 0) {
      setSendInvitationErrors({});
      apiReqResLoader("btnsendinvitation", "Sending", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        InviterId: profileid,
        InviteeId: parseInt(setSelectDefaultVal(selectedUsersProfile)),
        ConnectionForProfileTypeId: config.userProfileTypes.Agent,
        Email: inputProfileValue.trim(),
        Message: sendInvitationFormData.txtmessage,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createUserConnection}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              if (objResponse.Data.Status === 200) {
                Toast.success(objResponse.Data.Message);
                getUsers({});
                onSendInviteModalHide();
              } else {
                Toast.info(objResponse.Data.Message);
              }
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.createConnection}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendinvitation",
            "Send",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formSendInvitaionErrors)[0]}]`).focus();
      setSendInvitationErrors(formSendInvitaionErrors);
    }
  };

  // Send invite modal

  // Send message modal

  let formSendMessageErrors = {};
  const [sendMessageErrors, setSendMessageErrors] = useState({});
  const [sendMessageModalState, setSendMessageModalState] = useState(false);
  function setInitialSendMessageFormData() {
    return {
      txtmessage: "",
      toid: 0,
      lbltoname: "",
    };
  }

  const [sendMessageFormData, setSendMessageFormData] = useState(
    setInitialSendMessageFormData()
  );

  const onSendMessageModalShow = (e, row) => {
    e?.preventDefault();
    setSendMessageFormData({
      ...sendMessageFormData,
      lbltoname: `Agent: ${
        row.ProfileId > 0 ? row.FirstName + " " + row.LastName : row.Email
      }`,
      toid:
        parseInt(row.InviterId) ==
        parseInt(GetUserCookieValues(UserCookie.ProfileId, loggedinUser))
          ? row.InviteeId
          : parseInt(row.InviteeId) ==
            parseInt(GetUserCookieValues(UserCookie.ProfileId, loggedinUser))
          ? row.InviterId
          : 0,
    });
    setSendMessageModalState(true);
  };

  const onSendMessageModalHide = (e) => {
    e?.preventDefault();
    setSendMessageModalState(false);
    setSendMessageErrors({});
    setSendMessageFormData(setInitialSendMessageFormData());
  };

  const handleSendMessageInputChange = (e) => {
    const { name, value } = e?.target;
    setSendMessageFormData({
      ...sendMessageFormData,
      [name]: value,
    });
  };

  const onSendMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formSendMessageErrors).length === 0) {
      setSendMessageErrors({});
      apiReqResLoader(
        "btnsendmessage",
        "Sending",
        API_ACTION_STATUS.START,
        false
      );

      let isapimethoderr = false;
      if (sendMessageFormData.toid != 0) {
        let objBodyParams = {
          FromId: parseInt(
            GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
          ),
          ToId: parseInt(sendMessageFormData.toid),
          NotificationTypeId: NotificationTypes.Message,
          Message: sendMessageFormData.txtmessage,
        };

        axiosPost(
          `${config.apiBaseUrl}${ApiUrls.createNotification}`,
          objBodyParams
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (objResponse.Data.Id > 0) {
                Toast.success(objResponse.Data.Message);
                onSendMessageModalHide();
              }
            } else {
              isapimethoderr = true;
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            console.error(
              `"API :: ${ApiUrls.createNotification}, Error ::" ${err}`
            );
          })
          .finally(() => {
            if (isapimethoderr == true) {
              Toast.error(AppMessages.SomeProblem);
            }
            apiReqResLoader(
              "btnsendmessage",
              "Send",
              API_ACTION_STATUS.COMPLETED,
              false
            );
          });
      } else {
        let objBodyParams = {
          InviterId: profileid,
          InviteeId: 0,
          ConnectionForProfileTypeId: config.userProfileTypes.Owner,
          Email: document
            .getElementById("lbltoname")
            .innerText.split(":")[1]
            .trim(),
          Message: sendMessageFormData.txtmessage,
        };

        axiosPost(
          `${config.apiBaseUrl}${ApiUrls.createUserConnection}`,
          objBodyParams
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (objResponse.Data.Id > 0) {
                if (objResponse.Data.Status === 200) {
                  Toast.success(objResponse.Data.Message);
                  onSendMessageModalHide();
                } else {
                  Toast.info(objResponse.Data.Message);
                }
              }
            } else {
              isapimethoderr = true;
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            console.error(
              `"API :: ${ApiUrls.createConnection}, Error ::" ${err}`
            );
          })
          .finally(() => {
            if (isapimethoderr == true) {
              Toast.error(AppMessages.SomeProblem);
            }
            apiReqResLoader(
              "btnsendmessage",
              "Send",
              API_ACTION_STATUS.COMPLETED,
              false
            );
          });
      }
    } else {
      $(`[name=${Object.keys(formSendMessageErrors)[0]}]`).focus();
      setSendMessageErrors(formSendMessageErrors);
    }
  };

  // Send message modal

  const navigateToOwners = () => {
    navigate(routeNames.connectionsowners.path);
  };

  const navigateToAgents = () => {
    navigate(routeNames.connectionsagents.path);
  };

  const navigateToTenants = () => {
    navigate(routeNames.connectionstenants.path);
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
                      <h6 className="mb-3 down-line pb-10">Connections</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <label className="font-general font-500 cur-default">
                        Agents
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnsendinvite"
                    id="btnsendinvite"
                    type="button"
                    onClick={onSendInviteModalShow}
                  >
                    <i className="flaticon-envelope flat-mini position-relative me-1 t-1"></i>{" "}
                    Send Invite
                  </button>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  {loggedinprofiletypeid == config.userProfileTypes.Owner ? (
                    <>
                      <li onClick={navigateToOwners}>Owners</li>
                      <li className="active">Agents</li>
                      <li onClick={navigateToTenants}>Tenants</li>
                    </>
                  ) : loggedinprofiletypeid == config.userProfileTypes.Agent ? (
                    <>
                      <li className="active">Agents</li>
                      <li onClick={navigateToOwners}>Owners</li>
                      <li onClick={navigateToTenants}>Tenants</li>
                    </>
                  ) : (
                    <>
                      <li onClick={navigateToTenants}>Tenants</li>
                      <li onClick={navigateToOwners}>Owners</li>
                      <li className="active">Agents</li>
                    </>
                  )}
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <div className="woo-filter-bar full-row p-3 grid-search bo-0">
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
                                  placeHolder={
                                    userConnectionStatusTypes.length <= 0 &&
                                    searchFormData.ddlstatus == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    userConnectionStatusTypes.length <= 0 &&
                                    searchFormData.ddlstatus == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={userConnectionStatusTypes}
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
                              <div className="col-lg-4 col-xl-2 col-md-3">
                                <AsyncSelect
                                  placeHolder={
                                    userConnectionRequestTypes.length <= 0 &&
                                    searchFormData.ddlrequesttype == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    userConnectionRequestTypes.length <= 0 &&
                                    searchFormData.ddlrequesttype == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={userConnectionRequestTypes}
                                  dataKey="Id"
                                  dataVal="Type"
                                  onChange={(e) =>
                                    ddlChange(e, "ddlrequesttype")
                                  }
                                  value={searchFormData.ddlrequesttype}
                                  defualtselected={
                                    searchFormData.ddlrequesttype
                                  }
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
                      <div className="dashboard-panel bo-top bg-white rounded overflow-hidden w-100 box-shadow-top">
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

      {/*============== Send Invite Modal Start ==============*/}
      {sendInviteModalState && (
        <>
          <ModalView
            title={AppMessages.SendInvitaionModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-15">
                    <AsyncRemoteSelect
                      placeHolder={AppMessages.DdlTypetoSearch}
                      noData={AppMessages.NoAgents}
                      loadOptions={usersProfilesOptions}
                      handleInputChange={(e, val) => {
                        handleInputProfileChange(e, val);
                        handleDdlUsersProfilesChange(e, val.prevInputValue);
                      }}
                      onChange={(option) => {
                        setSelectedUsersProfile(option);
                        //setInputProfileValue(option ? option.customlabel : "");
                      }}
                      onBlur={() => {
                        setInputProfileValue(inputProfileValue);
                      }}
                      inputValue={inputProfileValue}
                      value={selectedUsersProfile}
                      name="ddlusersprofiles"
                      lblText="Agents"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={sendInvitationErrors}
                      formErrors={formSendInvitaionErrors}
                      isClearable={true}
                      tabIndex={1}
                    ></AsyncRemoteSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0 lbl-req-field"
                      name={`txtmessage`}
                      ctlType={formCtrlTypes.message}
                      onChange={handleSendInvitationInputChange}
                      value={sendInvitationFormData.txtmessage}
                      required={true}
                      errors={sendInvitationErrors}
                      formErrors={formSendInvitaionErrors}
                      rows={3}
                      tabIndex={2}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onSendInviteModalHide}
            actions={[
              {
                id: "btnsendinvitation",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendInvitation(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendInviteModalHide(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Invite Modal End ==============*/}

      {/*============== Send Message Modal Start ==============*/}
      {sendMessageModalState && (
        <>
          <ModalView
            title={AppMessages.SendMessageModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-10">
                    <span
                      name="lbltoname"
                      className="font-general font-500"
                      id="lbltoname"
                    >
                      {sendMessageFormData.lbltoname}
                    </span>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0 lbl-req-field"
                      name={`txtmessage`}
                      ctlType={formCtrlTypes.message}
                      onChange={handleSendMessageInputChange}
                      value={sendMessageFormData.txtmessage}
                      required={true}
                      errors={sendMessageErrors}
                      formErrors={formSendMessageErrors}
                      rows={3}
                      tabIndex={1}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onSendMessageModalHide}
            actions={[
              {
                id: "btnsendmessage",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendMessage(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendMessageModalHide(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Message Modal End ==============*/}

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndeleteinvitation",
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

export default Agents;
