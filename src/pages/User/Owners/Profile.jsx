import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  AppMessages,
  GridDefaultValues,
  UserConnectionTabIds,
  UserCookie,
} from "../../../utils/constants";
import {
  DataLoader,
  Grid,
  LazyImage,
  NoData,
} from "../../../components/common/LazyComponents";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import { useNavigate } from "react-router-dom";
import UserProfileCard from "../../../components/common/UserProfileCard";
import { routeNames } from "../../../routes/routes";

const Profile = () => {
  let $ = window.$;

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();
  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);
  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [joinedAgentsTotalCount, setJoinedAgentsTotalCount] = useState(0);
  const [joinedTenantsTotalCount, setJoinedTenantsTotalCount] = useState(0);
  const [joinedOwnersTotalCount, setJoinedOwnersTotalCount] = useState(0);

  useEffect(() => {
    //Joined agents
    let objParams = {
      keyword: "",
      inviterid: profileId,
      InviterProfileTypeId: config.userProfileTypes.Owner,
      InviteeProfileTypeId: config.userProfileTypes.Agent,
      pi: 1,
      ps: 0,
    };
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getJoinedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setJoinedAgentsTotalCount(objResponse.Data.TotalCount);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getJoinedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {});

    //Joined owners
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getJoinedUserConnections}`, {
      ...objParams,
      InviteeProfileTypeId: config.userProfileTypes.Owner,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setJoinedOwnersTotalCount(objResponse.Data.TotalCount);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getJoinedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {});

    //Joined tenants
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getJoinedUserConnections}`, {
      ...objParams,
      InviteeProfileTypeId: config.userProfileTypes.Tenant,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setJoinedTenantsTotalCount(objResponse.Data.TotalCount);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getJoinedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {});
  }, []);

  //Owners Grid
  const [ownersData, setownersData] = useState([]);
  const [ownersTotalCount, setOwnersTotalCount] = useState(0);
  const [isOwnersDataLoading, setIsOwnersDataLoading] = useState(true);

  const getOwners = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps5,
  }) => {
    setIsOwnersDataLoading(true);
    let objParams = {};
    objParams = {
      keyword: "",
      inviteeid: profileId,
      InviteeProfileTypeId: config.userProfileTypes.Owner,
      InviterProfileTypeId: config.userProfileTypes.Owner,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getRequestedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setOwnersTotalCount(objResponse.Data.TotalCount);
          setownersData(objResponse.Data.UserConnections);
        } else {
          setownersData([]);
        }
      })
      .catch((err) => {
        setownersData([]);
        console.error(
          `"API :: ${ApiUrls.getRequestedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {
        setIsOwnersDataLoading(false);
      });
  };

  //Setup Owners Grid.

  const ownercolumns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "",
        className: "w-250px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded-circle cur-pointer w-40px shadow mr-10"
              onClick={(e) => {}}
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-40px min-h-40 fl-l"
            ></LazyImage>
            <div className="property-info d-flex flex-start">
              <a href="#" onClick={(e) => {}}>
                <h5 className="text-secondary">
                  {row.original.FirstName + " " + row.original.LastName}
                </h5>
              </a>
            </div>
          </>
        ),
      },
      {
        Header: "Location",
        accessor: "AddressOne",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Email Id",
        accessor: "Email",
        disableSortBy: true,
        className: "w-200px",
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
        className: "w-200px",
      },
    ],
    []
  );

  let fetchOwnersData = useCallback(() => {
    getOwners({
      pi: GridDefaultValues.pi,
      ps: GridDefaultValues.ps5,
    });
  }, []);

  //Setup Owners Grid.

  //Agents Grid
  const [agentsData, setAgentsData] = useState([]);
  const [agentsTotalCount, setAgentsTotalCount] = useState(0);
  const [isAgentsDataLoading, setIsAgentsDataLoading] = useState(true);

  const getAgents = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps5,
  }) => {
    setIsAgentsDataLoading(true);
    let objParams = {};
    objParams = {
      keyword: "",
      inviteeid: profileId,
      InviteeProfileTypeId: config.userProfileTypes.Owner,
      InviterProfileTypeId: config.userProfileTypes.Agent,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getRequestedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setAgentsTotalCount(objResponse.Data.TotalCount);
          setAgentsData(objResponse.Data.UserConnections);
        } else {
          setAgentsData([]);
        }
      })
      .catch((err) => {
        setAgentsData([]);
        console.error(
          `"API :: ${ApiUrls.getRequestedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {
        setIsAgentsDataLoading(false);
      });
  };

  //Setup Agents Grid.

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
              className="rounded-circle cur-pointer w-40px shadow mr-10"
              onClick={(e) => {}}
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-40px min-h-40 fl-l"
            ></LazyImage>
            <div className="property-info d-flex flex-start">
              <a href="#" onClick={(e) => {}}>
                <h5 className="text-secondary">
                  {row.original.FirstName + " " + row.original.LastName}
                </h5>
              </a>
            </div>
          </>
        ),
      },
      {
        Header: "Location",
        accessor: "AddressOne",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Email Id",
        accessor: "Email",
        disableSortBy: true,
        className: "w-200px",
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
        className: "w-200px",
      },
    ],
    []
  );

  let fetchAgentsData = useCallback(() => {
    getAgents({
      pi: GridDefaultValues.pi,
      ps: GridDefaultValues.ps5,
    });
  }, []);

  //Setup Agents Grid.

  //Tenants Grid
  const [tenantsData, setTenantsData] = useState([]);
  const [tenantsTotalCount, setTenantsTotalCount] = useState(0);
  const [isTenantsDataLoading, setIsTenantsDataLoading] = useState(true);

  const getTenants = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps5,
  }) => {
    setIsTenantsDataLoading(true);
    let objParams = {};
    objParams = {
      keyword: "",
      inviteeid: profileId,
      InviteeProfileTypeId: config.userProfileTypes.Owner,
      InviterProfileTypeId: config.userProfileTypes.Tenant,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getRequestedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTenantsTotalCount(objResponse.Data.TotalCount);
          setTenantsData(objResponse.Data.UserConnections);
        } else {
          setTenantsData([]);
        }
      })
      .catch((err) => {
        setTenantsData([]);
        console.error(
          `"API :: ${ApiUrls.getRequestedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {
        setIsTenantsDataLoading(false);
      });
  };

  //Setup Tenants Grid.

  const tenantColumns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "",
        className: "w-250px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded-circle cur-pointer w-40px shadow mr-10"
              onClick={(e) => {}}
              src={row.original.PicPath}
              alt={row.original.FirstName + " " + row.original.LastName}
              placeHolderClass="pos-absolute w-40px min-h-40 fl-l"
            ></LazyImage>
            <div className="property-info d-flex flex-start">
              <a href="#" onClick={(e) => {}}>
                <h5 className="text-secondary">
                  {row.original.FirstName + " " + row.original.LastName}
                </h5>
              </a>
            </div>
          </>
        ),
      },
      {
        Header: "Location",
        accessor: "AddressOne",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Email Id",
        accessor: "Email",
        disableSortBy: true,
        className: "w-200px",
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
        className: "w-200px",
      },
    ],
    []
  );

  const fetchTenantsData = useCallback(() => {
    getTenants({
      pi: GridDefaultValues.pi,
      ps: GridDefaultValues.ps5,
    });
  }, []);

  //Setup Tenants Grid.

  //Setup Assets Grid.
  const [assetsList, setAssetsList] = useState([]);
  const [assetsTotalCount, setAssetsTotalCount] = useState(0);
  const [isAssetsDataLoading, setIsAssetsDataLoading] = useState(true);

  const getAssets = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps3,
  }) => {
    setIsAssetsDataLoading(true);
    let objParams = {};
    objParams = {
      //ProfileId: profileId,
      accountid: accountId,
      keyword: "",
      classificationtypeid: 0,
      assettypeid: 0,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserAssets}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setAssetsTotalCount(objResponse.Data.TotalCount);
          setAssetsList(objResponse.Data.Assets);
        } else {
          setAssetsList([]);
        }
      })
      .catch((err) => {
        setAssetsList([]);
        console.error(`"API :: ${ApiUrls.getUserAssets}, Error ::" ${err}`);
      })
      .finally(() => {
        setIsAssetsDataLoading(false);
      });
  };

  const assetsColumns = React.useMemo(
    () => [
      {
        Header: "Property",
        accessor: "title",
        className: "w-400px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded box-shadow cur-pointer w-80px"
              src={row.original.Images[0]?.ImagePath}
              alt={row.original.Title}
              placeHolderClass="pos-absolute w-80px min-h-80 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <a href="#">
                <h5 className="text-secondary">{row.original.AddressOne}</h5>
              </a>
              <div className="price py-0">
                <span className="text-primary">
                  {row.original.PriceDisplay}
                </span>
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Property Type",
        accessor: "AssetType",
        disableSortBy: true,
        className: "w-250px",
      },
      {
        Header: "Contract Type",
        accessor: "ContractType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Last Modified On",
        accessor: "ModifiedDateDisplay",
        className: "w-250px",
      },
    ],
    []
  );

  const fetchAssetsData = useCallback(() => {
    getAssets({
      pi: GridDefaultValues.pi,
      ps: GridDefaultValues.ps3,
    });
  }, []);

  const onAssets = () => {
    navigate(routeNames.ownerproperties.path);
  };

  const onJoinedOwners = () => {
    navigate(routeNames.connectionsowners.path);
  };

  const onJoinedAgents = () => {
    navigate(routeNames.connectionsagents.path);
  };

  const onJoinedTenants = () => {
    navigate(routeNames.connectionstenants.path);
  };

  const onRequestedOwners = () => {
    navigate(routeNames.connectionsowners.path);
  };

  const onRequestedAgents = () => {
    // navigate(routeNames.owneragents.path, {
    //   state: { tab: UserConnectionTabIds.requested },
    // });
    navigate(routeNames.connectionsagents.path);
  };

  const onRequestedTenants = () => {
    // navigate(routeNames.ownertenants.path, {
    //   state: { tab: UserConnectionTabIds.requested },
    // });
    navigate(routeNames.connectionstenants.path);
  };

  //Setup Assets Grid.

  //Notifications.
  const [topNotifications, setTopNotifications] = useState([]);
  const [topNotificationsLoader, setTopNotificationsLoader] = useState(true);
  useEffect(() => {
    setTopNotificationsLoader(true);
    setTopNotifications([]);
    let objBodyParams = {
      ProfileId: profileId,
      AccountId: accountId,
      IsRead: 0,
      Count: 4,
    };
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getTopNotifications}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTopNotifications(objResponse.Data);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getTopNotifications}, Error ::" ${err}`
        );
      })
      .finally(() => {
        setTopNotificationsLoader(false);
      });
  }, []);

  const onNotifications = () => {
    navigate(
      getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "notifications")
    );
  };

  //Notifications.

  return (
    <>
      {SetPageLoaderNavLinks()}

      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line pb-10">My Profile</h5>
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  {/*============== Profile Start ==============*/}
                  <UserProfileCard cssClass="" />
                  {/*============== Profile End ==============*/}

                  {/*============== Notifications Start ==============*/}
                  <div className="bg-white box-shadow rounded px-0 mb-20 py-20">
                    <div className="row mx-0 px-0">
                      <h6 className="col down-line pb-1 px-0 mx-20">
                        New Notifications
                      </h6>
                      <div className="col-auto mx-0 pr-20">
                        <button
                          type="button"
                          className="btn btn-glow px-0 rounded-circle lh-1"
                          onClick={onNotifications}
                        >
                          <i className="icons font-18 icon-arrow-right-circle text-primary"></i>
                        </button>
                      </div>
                    </div>
                    <div className="widget-cnt-body lh-1 cscrollbar mt-0 bg-white max-h-400">
                      {topNotificationsLoader && <DataLoader></DataLoader>}
                      {!topNotificationsLoader &&
                        (topNotifications && topNotifications?.length > 0 ? (
                          <>
                            {topNotifications.map((n, i) => {
                              return (
                                <div className="nlist" key={`tdno-${i}`}>
                                  {n["Notifications"].map((ndata, idx) => {
                                    return (
                                      <div className="row" key={`tdnom-${idx}`}>
                                        <div className="col-auto px-0">
                                          <img
                                            src={ndata.PicPath}
                                            alt=""
                                            className="shadow profile"
                                          />
                                        </div>
                                        <div className="col minfo">
                                          <div className="name">
                                            {ndata.FirstName +
                                              " " +
                                              ndata.LastName}
                                          </div>
                                          <div className="message">
                                            {ndata.Message}
                                          </div>
                                        </div>
                                        <div className="time">
                                          <i className="fa fa-clock"></i>
                                          <span className="pl-5">
                                            {ndata.NotificationDateDaysDiff}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <NoData
                            message={AppMessages.NoNewNotifications}
                            className="mt-25 mb-40"
                          ></NoData>
                        ))}
                    </div>
                  </div>
                  {/*============== Notifications End ==============*/}
                </div>
                <div className="col-xl-9 col-lg-8">
                  {/*============== Stats Start ==============*/}
                  <div className="row row-cols-xxl-4 row-cols-xl-4 row-cols-lg-2 row-cols-sm-2 row-cols-2 g-4 mb-20 dashboard-stats">
                    <div className="col cur-pointer" onClick={onAssets}>
                      <div className="p-3 box-shadow rounded bg-white success">
                        <i className="flaticon-home flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{assetsTotalCount}</div>
                          <div className="title">Properties</div>
                        </div>
                      </div>
                    </div>
                    <div className="col cur-pointer" onClick={onJoinedOwners}>
                      <div className="p-3 box-shadow rounded bg-white info">
                        <i className="flaticon-user flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{joinedOwnersTotalCount}</div>
                          <div className="title">Owners</div>
                        </div>
                      </div>
                    </div>
                    <div className="col cur-pointer" onClick={onJoinedAgents}>
                      <div className="p-3 box-shadow rounded bg-white error">
                        <i className="flaticon-user flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{joinedAgentsTotalCount}</div>
                          <div className="title">Agents</div>
                        </div>
                      </div>
                    </div>
                    <div className="col cur-pointer" onClick={onJoinedTenants}>
                      <div className="p-3 box-shadow rounded bg-white warning">
                        <i className="flaticon-user flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{joinedTenantsTotalCount}</div>
                          <div className="title">Tenants</div>
                        </div>
                      </div>
                    </div>
                    {/* <div className="col">
                      <div className="p-3 box-shadow rounded bg-white warning">
                        <i className="fa-regular fa-file-lines float-start pe-3 lh-45"></i>
                        <div className="text-right text-muted">
                          <div className="count">0</div>
                          <div className="title">Agreements</div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                  {/*============== Stats End ==============*/}

                  {/*============== Recent Owners Start ==============*/}
                  <div className="full-row px-0 py-4 mb-20 bg-white box-shadow rounded min-h-250">
                    <div className="container-fluid px-0">
                      <div className="row">
                        <div className="col">
                          <div className="row mx-0 px-20">
                            <h6 className="col mx-0 px-0 mb-4 down-line pb-1">
                              Recent Owners Contact
                            </h6>
                            <div className="col-auto px-0 mx-0">
                              <button
                                type="button"
                                className="btn btn-glow px-0 rounded-circle lh-1"
                                onClick={onRequestedOwners}
                              >
                                <i className="icons font-18 icon-arrow-right-circle text-primary"></i>
                              </button>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col mb-15">
                              <Grid
                                columns={ownercolumns}
                                data={ownersData}
                                loading={isOwnersDataLoading}
                                fetchData={fetchOwnersData}
                                pageCount={5}
                                totalInfo={{
                                  text: "Owner Requests",
                                  count: ownersTotalCount,
                                }}
                                noData={AppMessages.NoOwnerRequests}
                                showPaging={false}
                                headerClass={`gr-head-bt gr-head-p12 ${
                                  !isOwnersDataLoading && ownersData.length > 0
                                    ? "show"
                                    : "hide"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Recent Owners End ==============*/}

                  {/*============== Recent Agent Start ==============*/}
                  <div className="full-row px-0 py-4 mb-20 bg-white box-shadow rounded min-h-250">
                    <div className="container-fluid px-0">
                      <div className="row">
                        <div className="col">
                          <div className="row mx-0 px-20">
                            <h6 className="col mx-0 px-0 mb-4 down-line pb-1">
                              Recent Agent Contact
                            </h6>
                            <div className="col-auto px-0 mx-0">
                              <button
                                type="button"
                                className="btn btn-glow px-0 rounded-circle lh-1"
                                onClick={onRequestedAgents}
                              >
                                <i className="icons font-18 icon-arrow-right-circle text-primary"></i>
                              </button>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col mb-15">
                              <Grid
                                columns={columns}
                                data={agentsData}
                                loading={isAgentsDataLoading}
                                fetchData={fetchAgentsData}
                                pageCount={5}
                                totalInfo={{
                                  text: "Agent Requests",
                                  count: agentsTotalCount,
                                }}
                                noData={AppMessages.NoAgentRequests}
                                showPaging={false}
                                headerClass={`gr-head-bt gr-head-p12 ${
                                  !isAgentsDataLoading && agentsData.length > 0
                                    ? "show"
                                    : "hide"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Recent Agent End ==============*/}

                  {/*============== Recent Tenant Start ==============*/}
                  <div className="full-row px-0 py-4 mb-20 bg-white box-shadow rounded min-h-250">
                    <div className="container-fluid px-0">
                      <div className="row">
                        <div className="col">
                          <div className="row mx-0 px-20">
                            <h6 className="col mx-0 px-0 mb-4 down-line pb-1">
                              Recent Tenant Contact
                            </h6>
                            <div className="col-auto px-0 mx-0">
                              <button
                                type="button"
                                className="btn btn-glow px-0 rounded-circle lh-1"
                                onClick={onRequestedTenants}
                              >
                                <i className="icons font-18 icon-arrow-right-circle text-primary"></i>
                              </button>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col mb-15">
                              <Grid
                                columns={tenantColumns}
                                data={tenantsData}
                                loading={isTenantsDataLoading}
                                fetchData={fetchTenantsData}
                                pageCount={5}
                                totalInfo={{
                                  text: "Tenant Requests",
                                  count: tenantsTotalCount,
                                }}
                                noData={AppMessages.NoTenantRequests}
                                showPaging={false}
                                headerClass={`gr-head-bt gr-head-p12 ${
                                  !isTenantsDataLoading &&
                                  tenantsData.length > 0
                                    ? "show"
                                    : "hide"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Recent Tenant End ==============*/}

                  {/*============== Recent properties Start ==============*/}
                  <div className="full-row px-0 py-4 mb-20 bg-white box-shadow rounded min-h-250">
                    <div className="container-fluid px-0">
                      <div className="row">
                        <div className="col">
                          <div className="row mx-0 px-20">
                            <h6 className="col mx-0 px-0 mb-4 down-line pb-1">
                              Recently Added Properties
                            </h6>
                            <div className="col-auto px-0 mx-0">
                              <button
                                type="button"
                                className="btn btn-glow px-0 rounded-circle lh-1"
                                onClick={onAssets}
                              >
                                <i className="icons font-18 icon-arrow-right-circle text-primary"></i>
                              </button>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col mb-15">
                              <Grid
                                columns={assetsColumns}
                                data={assetsList}
                                loading={isAssetsDataLoading}
                                fetchData={fetchAssetsData}
                                pageCount={5}
                                totalInfo={{
                                  text: "Total Properties",
                                  count: assetsTotalCount,
                                }}
                                noData={AppMessages.NoProperties}
                                showPaging={false}
                                headerClass={`gr-head-bt gr-head-p12 ${
                                  !isAssetsDataLoading && assetsList.length > 0
                                    ? "show"
                                    : "hide"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Recent properties End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
