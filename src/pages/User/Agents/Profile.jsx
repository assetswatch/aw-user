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

  const [joinedTenantsTotalCount, setJoinedTenantsTotalCount] = useState(0);
  const [joinedOwnersTotalCount, setJoinedOwnersTotalCount] = useState(0);

  useEffect(() => {
    //Joined tenants
    let objParams = {
      keyword: "",
      inviterid: profileId,
      InviterProfileTypeId: config.userProfileTypes.Agent,
      InviteeProfileTypeId: config.userProfileTypes.Tenant,
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
          setJoinedTenantsTotalCount(objResponse.Data.TotalCount);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getJoinedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {});

    //Joined owners
    objParams.InviteeProfileTypeId = config.userProfileTypes.Owner;
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getJoinedUserConnections}`,
      objParams
    )
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
  }, []);

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
      InviteeProfileTypeId: config.userProfileTypes.Agent,
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

  //Owners Grid
  const [ownersData, setOwnersData] = useState([]);
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
      InviteeProfileTypeId: config.userProfileTypes.Agent,
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
          setOwnersData(objResponse.Data.UserConnections);
        } else {
          setOwnersData([]);
        }
      })
      .catch((err) => {
        setOwnersData([]);
        console.error(
          `"API :: ${ApiUrls.getRequestedUserConnections}, Error ::" ${err}`
        );
      })
      .finally(() => {
        setIsOwnersDataLoading(false);
      });
  };

  //Setup Owners Grid.

  const ownerColumns = React.useMemo(
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

  const fetchOwnersData = useCallback(() => {
    getOwners({
      pi: GridDefaultValues.pi,
      ps: GridDefaultValues.ps5,
    });
  }, []);

  //Setup Owners Grid.

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
      keyword: "",
      inviterid: profileId,
      InviterProfileTypeId: config.userProfileTypes.Agent,
      InviteeProfileTypeId: config.userProfileTypes.Owner,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getUserConnectedAssets}`,
      objParams
    )
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
        console.error(
          `"API :: ${ApiUrls.getUserConnectedAssets}, Error ::" ${err}`
        );
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
        Header: "Connected On",
        accessor: "RepliedDateDisplay",
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
    navigate(routeNames.agentconnectedproperties.path);
  };

  const onJoinedTenants = () => {
    navigate(routeNames.agenttenants.path);
  };

  const onJoinedOwners = () => {
    navigate(routeNames.agentowners.path);
  };

  const onRequestedTenants = () => {
    navigate(routeNames.agenttenants.path, {
      state: { tab: "requested" },
    });
  };

  const onRequestedOwners = () => {
    navigate(routeNames.agentowners.path, {
      state: { tab: "requested" },
    });
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
              <h5 className="mb-4 down-line">My Profile</h5>
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
                                        <div className="col-auto">
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
                      <div className="p-3 box-shadow rounded bg-white error">
                        <i className="flaticon-user flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{joinedOwnersTotalCount}</div>
                          <div className="title">Owners</div>
                        </div>
                      </div>
                    </div>
                    <div className="col cur-pointer" onClick={onJoinedTenants}>
                      <div className="p-3 box-shadow rounded bg-white info">
                        <i className="flaticon-user flat-medium float-start pe-3"></i>
                        <div className="text-right text-muted">
                          <div className="count">{joinedTenantsTotalCount}</div>
                          <div className="title">Tenants</div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="p-3 box-shadow rounded bg-white warning">
                        <i className="fa-regular fa-file-lines float-start pe-3 lh-45"></i>
                        <div className="text-right text-muted">
                          <div className="count">0</div>
                          <div className="title">Agreements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Stats End ==============*/}

                  {/*============== Recent Owners Start ==============*/}
                  <div className="full-row px-0 py-4 mb-20 bg-white box-shadow rounded min-h-250">
                    <div className="container-fluid px-0">
                      <div className="row">
                        <div className="col">
                          <div className="row mx-0 px-20">
                            <h6 className="col mx-0 px-0 mb-4 down-line pb-1">
                              Recent Owner Contact
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
                                columns={ownerColumns}
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
                              Recently Connected Properties
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
                                noData={AppMessages.NoConnectedProperties}
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