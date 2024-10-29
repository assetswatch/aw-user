import React, { memo, useCallback, useRef, useState } from "react";
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
  GetUserCookieValues,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
  NotificationTypes,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import TextAreaControl from "../../../components/common/TextAreaControl";

const JoinedTenants = memo(() => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();

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
        InviterProfileTypeId: config.userProfileTypes.Agent,
        InviteeProfileTypeId: config.userProfileTypes.Tenant,
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
        `${config.apiBaseUrl}${ApiUrls.getJoinedUserConnections}`,
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
            `"API :: ${ApiUrls.getJoinedUserConnections}, Error ::" ${err}`
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
                {row.original.City}, {row.original.State},{" "}
                {row.original.Country}
              </div>
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
        Header: "Joined On",
        accessor: "RepliedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Actions",
        className: "w-150px",
        actions: [
          {
            text: "Send Message",
            onclick: (e, row) => {
              onSendMessageModalShow(e, row.original);
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

  //Grid actions

  const onStatusChange = (e, selectedRow, statusId) => {
    e.preventDefault();
    apiReqResLoader("x", "", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
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

  //Grid actions

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
      lbltoname: `Tenant: ${row.FirstName} ${row.LastName}`,
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
      $(`[name=${Object.keys(formSendMessageErrors)[0]}]`).focus();
      setSendMessageErrors(formSendMessageErrors);
    }
  };

  // Send message modal

  return (
    <>
      <div className="woo-filter-bar full-row p-3 grid-search bo-0">
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
                      lblText="Joined On : Start date"
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
                      lblText="Joined On : End date"
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
                text: "Joined Tenants",
                count: totalCount,
              }}
              noData={AppMessages.NoTenants}
            />
          </div>
        </div>
      </div>
      {/*============== Grid End ==============*/}

      {/*============== Send Message Modal Start ==============*/}
      {sendMessageModalState && (
        <>
          <ModalView
            title={AppMessages.SendMessageModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-10">
                    <span name="lbltoname" className="font-general font-500">
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
    </>
  );
});

export default JoinedTenants;
