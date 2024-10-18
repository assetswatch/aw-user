import React, { useCallback, useRef, useState } from "react";
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
  debounce,
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
  API_ACTION_STATUS,
  GridDefaultValues,
  AppConstants,
  NotificationTypes,
  ValidationMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { Toast } from "../../../components/common/ToastView";
import { useGetNotificationTypesGateway } from "../../../hooks/useGetNotificationTypesGateway";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";

const Notifications = () => {
  let $ = window.$;

  let formErrors = {};

  const { loggedinUser } = useAuth();

  //Search data.
  const { notificationTypesList } = useGetNotificationTypesGateway("", 1);

  //Grid
  const [notificationsList, setNotificationsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  //Modal
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteNotificationConfirmationMessage
  );

  const navigate = useNavigate();

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

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getNotifications({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getNotifications({ isShowall: true });
  };

  // Search events

  //Get notifications list
  const getNotifications = ({
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
        ProfileId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        accountid: parseInt(
          GetUserCookieValues(UserCookie.AccountId, loggedinUser)
        ),
        keyword: "",
        notificationtypeid: 0,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          notificationtypeid: parseInt(
            setSelectDefaultVal(searchFormData.ddlnotificationtype)
          ),
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getNotifications}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setNotificationsList(objResponse.Data.Notifications);
          } else {
            isapimethoderr = true;
            setNotificationsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setNotificationsList([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getNotifications}, Error ::" ${err}`
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
        className: "w-250px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded w-40px mr-10"
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-40px min-h-40 fl-l"
            ></LazyImage>
            <div className="property-info d-table mt-10">
              <h5 className="text-secondary font-general">
                {row.original.FirstName + " " + row.original.LastName}
              </h5>
            </div>
          </>
        ),
      },
      {
        Header: "Notification Type",
        accessor: "NotificationType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Message",
        accessor: "Message",
        disableSortBy: true,
        className: "w-450px",
      },
      {
        Header: "Notification On",
        accessor: "NotificationDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        showActionMenu: false,
        className: "w-100px gr-action",
        Cell: ({ row }) => (
          <a
            onClick={(e) => {
              onDeleteConfirmModalShow(e, row);
            }}
          >
            <i className="fas fa-trash pe-2 form-error" />
          </a>
        ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getNotifications({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader(
      "btndeletenotification",
      "Deleting",
      API_ACTION_STATUS.START,
      false
    );

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      Id: parseInt(selectedGridRow?.original?.Id),
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.deleteNotification}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteNotificationSuccess);
            getNotifications({});
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
          `"API :: ${ApiUrls.deleteNotification}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader(
          "btndeletenotification",
          "Yes",
          API_ACTION_STATUS.COMPLETED,
          false
        );
      });
  };

  //Grid actions

  //Delete confirmation Modal actions

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeletenotification",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(
      AppMessages.DeleteNotificationConfirmationMessage
    );
  };

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        notificationmessage: `${row?.original?.Message}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  //Delete confirmation Modal actions

  // Send notification modal

  let formSendNotificationErrors = {};
  const [sendNotificationErrors, setSendNotificationErrors] = useState({});
  const [sendNotificationModalState, setSendNotificationModalState] =
    useState(false);
  let { profileTypesList } = useProfileTypesGateway();
  profileTypesList = profileTypesList?.filter(
    (item) =>
      item.ProfileTypeId !==
      parseInt(GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser))
  );
  const [selectedProfileType, setSelectedProfileType] = useState(null);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);
  function setInitialSendNotificationFormData() {
    return {
      txtmessage: "",
    };
  }
  const [sendNotificationFormData, setSendNotificationFormData] = useState(
    setInitialSendNotificationFormData()
  );

  const joinedUserOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getJoinedUsers(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay), // 500ms debounce delay
    [selectedProfileType]
  );

  //Get joined users.
  const getJoinedUsers = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];

    let objParams = {
      keyword: searchValue,
      inviterid: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      InviterProfileTypeId: config.userProfileTypes.Owner,
      InviteeProfileTypeId: parseInt(selectedProfileType),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlJoinedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          return objResponse.Data.map((item) => ({
            label: item.FirstName + " " + item.LastName,
            value: item.ProfileId,
          }));
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        return [];
      });
  };

  const handleProfileTypeChange = (e) => {
    setSelectedProfileType(e?.value);
    setSelectedJoinedUser(null);
  };

  const handleDdlJoinedUsersChange = () => {
    joinedUserOptions();
  };

  const handleSendNotificationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendNotificationFormData({
      ...sendNotificationFormData,
      [name]: value,
    });
  };

  const onSendNotificationModalShow = (e) => {
    e?.preventDefault();
    setSendNotificationModalState(true);
  };

  const onSendNotificationModalHide = (e) => {
    e?.preventDefault();
    setSendNotificationModalState(false);
    setSelectedProfileType(null);
    setSelectedJoinedUser(null);
    setSendNotificationErrors({});
    setSendNotificationFormData(setInitialSendNotificationFormData());
  };

  const onSendNotification = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formSendNotificationErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (checkEmptyVal(selectedProfileType)) {
      formSendNotificationErrors["ddlprofiletype"] =
        ValidationMessages.ProfiletypeReq;
    }

    if (Object.keys(formSendNotificationErrors).length === 0) {
      setSendNotificationErrors({});
      apiReqResLoader(
        "btnsendnotification",
        "Sending",
        API_ACTION_STATUS.START,
        false
      );

      let isapimethoderr = false;
      let objBodyParams = {
        FromId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        ToId: parseInt(setSelectDefaultVal(selectedJoinedUser)),
        NotificationTypeId: NotificationTypes.Notification,
        Message: sendNotificationFormData.txtmessage,
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
              onSendNotificationModalHide();
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
            "btnsendnotification",
            "Send",
            API_ACTION_STATUS.COMPLETED,
            false
          );
        });
    } else {
      $(`[name=${Object.keys(formSendNotificationErrors)[0]}]`).focus();
      setSendNotificationErrors(formSendNotificationErrors);
    }
  };

  // Send notification modal

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">Notifications</h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnsendnotificationmodal"
                    id="btnsendnotificationmodal"
                    type="button"
                    onClick={onSendNotificationModalShow}
                  >
                    <i className="flaticon-envelope flat-mini position-relative me-1 t-1"></i>{" "}
                    Send Notification
                  </button>
                </div>
              </div>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-3 col-xl-2 col-md-3">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search by Name"
                              name="txtkeyword"
                              ctlType={formCtrlTypes.searchkeyword}
                              value={searchFormData.txtkeyword}
                              onChange={handleChange}
                              formErrors={formErrors}
                            ></InputControl>
                          </div>
                          <div className="col-lg-3 col-xl-2 col-md-3">
                            <AsyncSelect
                              placeHolder={
                                notificationTypesList.length <= 0 &&
                                searchFormData.ddlnotificationtype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                notificationTypesList.length <= 0 &&
                                searchFormData.ddlnotificationtype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={notificationTypesList}
                              dataKey="Id"
                              dataVal="Text"
                              onChange={(e) =>
                                ddlChange(e, "ddlnotificationtype")
                              }
                              value={searchFormData.ddlnotificationtype}
                              name="ddlnotificationtype"
                              lbl={formCtrlTypes.Notificationtype}
                              lblClass="mb-0"
                              lblText="Notification type"
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
                              onChange={(dt) => onDateChange(dt, "txtfromdate")}
                              value={searchFormData.txtfromdate}
                              isTime={false}
                            ></DateControl>
                          </div>
                          <div className="col-lg-3 col-xl-2 col-md-3">
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
                                days: 7,
                              }}
                            ></DateControl>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-7 grid-search-action">
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
                      data={notificationsList}
                      loading={isDataLoading}
                      fetchData={fetchData}
                      pageCount={pageCount}
                      totalInfo={{
                        text: "Total Notifications",
                        count: totalCount,
                      }}
                      noData={AppMessages.NoNotifications}
                    />
                  </div>
                </div>
              </div>
              {/*============== Grid End ==============*/}
            </div>
          </div>
        </div>
      </div>

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndeletenotification",
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

      {/*============== Send Notification Modal Start ==============*/}
      {sendNotificationModalState && (
        <>
          <ModalView
            title={AppMessages.SendNotificationModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoProfileTypes
                      }
                      options={profileTypesList}
                      onChange={(e) => {
                        handleProfileTypeChange(e);
                      }}
                      dataKey="ProfileTypeId"
                      dataVal="ProfileType"
                      value={selectedProfileType}
                      name="ddlprofiletype"
                      lbl={formCtrlTypes.profiletype}
                      lblText="Profile type"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={sendNotificationErrors}
                      formErrors={formSendNotificationErrors}
                      tabIndex={1}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-15">
                    <AsyncRemoteSelect
                      placeHolder={AppMessages.DdlTypetoSearch}
                      noData={AppMessages.NoUsers}
                      loadOptions={joinedUserOptions}
                      handleInputChange={(e, val) => {
                        handleDdlJoinedUsersChange(e, val.prevInputValue);
                      }}
                      onChange={(option) => setSelectedJoinedUser(option)}
                      value={selectedJoinedUser}
                      name="ddljoinedusers"
                      lblText="User"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={sendNotificationErrors}
                      formErrors={formSendNotificationErrors}
                      isClearable={true}
                      cacheOptions={false}
                      tabIndex={2}
                    ></AsyncRemoteSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0 lbl-req-field"
                      name={`txtmessage`}
                      ctlType={formCtrlTypes.message}
                      onChange={handleSendNotificationInputChange}
                      value={sendNotificationFormData.txtmessage}
                      required={true}
                      errors={sendNotificationErrors}
                      formErrors={formSendNotificationErrors}
                      rows={3}
                      tabIndex={3}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onSendNotificationModalHide}
            actions={[
              {
                id: "btnsendnotification",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendNotification(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendNotificationModalHide(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Notification Modal End ==============*/}
    </>
  );
};

export default Notifications;
