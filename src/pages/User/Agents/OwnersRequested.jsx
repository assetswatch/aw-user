import React, { memo, useCallback, useRef, useState } from "react";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
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
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";

const OwnersRequested = memo(() => {
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
        inviteeid: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        InviteeProfileTypeId: config.userProfileTypes.Agent,
        InviterProfileTypeId: config.userProfileTypes.Owner,
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
        `${config.apiBaseUrl}${ApiUrls.getRequestedUserConnections}`,
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
            `"API :: ${ApiUrls.getRequestedUserConnections}, Error ::" ${err}`
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
        Header: "Requested On",
        accessor: "InvitedDateDisplay",
        className: "w-180px",
      },
      {
        Header: "Actions",
        className: "w-150px",
        actions: [
          {
            text: "Accept",
            onclick: (e, row) => {
              onStatusChange(
                e,
                row.original,
                config.userConnectionStatusTypes.Accepted
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
                text: "Owner Requests",
                count: totalCount,
              }}
              noData={AppMessages.NoOwnerRequests}
            />
          </div>
        </div>
      </div>
      {/*============== Grid End ==============*/}
    </>
  );
});

export default OwnersRequested;
