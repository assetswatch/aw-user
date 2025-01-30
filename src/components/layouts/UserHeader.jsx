import { React, startTransition, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiUrls,
  AppDetails,
  AppMessages,
  UserCookie,
} from "../../utils/constants";
import { routeNames } from "../../routes/routes";
import {
  checkEmptyVal,
  checkObjNullorEmpty,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
  SetUserMenu,
} from "../../utils/common";
import UserProfileMenu from "../common/UserProfileMenu";
import { GetCookieValues } from "../../utils/common";
import config from "../../config.json";
import { Toast } from "../common/ToastView";
import { axiosPost } from "../../helpers/axiosHelper";
import { useAuth } from "../../contexts/AuthContext";
import { DataLoader, NoData } from "../common/LazyComponents";

const UserHeader = () => {
  let $ = window.$;

  const navigate = useNavigate();
  const { loggedinUser } = useAuth();
  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const [topNotifications, setTopNotifications] = useState([]);
  const [topNotificationsLoader, setTopNotificationsLoader] = useState("init");
  const [notificationsIsOpen, setnotificationsIsOpen] = useState(false);

  var collapseElement = document.getElementById(
    "collpase-widget-notifications"
  );

  collapseElement?.addEventListener("hidden.bs.collapse", function () {
    setnotificationsIsOpen(false);
    setTopNotificationsLoader(false);
    setTopNotifications([]);
  });

  collapseElement?.addEventListener("shown.bs.collapse", function () {
    setnotificationsIsOpen(true);
  });

  const getTopNotifications = (e, isNotificationDeleted = false) => {
    e?.preventDefault();
    e?.stopPropagation();
    startTransition(() => {
      if (
        (!isNotificationDeleted && !notificationsIsOpen) ||
        isNotificationDeleted
      ) {
        setTopNotificationsLoader(true);
        setTopNotifications([]);
        let isapimethoderr = false;
        let objBodyParams = {
          ProfileId: parseInt(
            GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
          ),
          AccountId: parseInt(
            GetUserCookieValues(UserCookie.AccountId, loggedinUser)
          ),
          IsRead: 0,
          Count: 10,
        };
        setTimeout(
          () => {
            axiosPost(
              `${config.apiBaseUrl}${ApiUrls.getTopNotifications}`,
              objBodyParams
            )
              .then((response) => {
                let objResponse = response.data;
                if (objResponse.StatusCode === 200) {
                  setTopNotifications(objResponse.Data);
                } else {
                  isapimethoderr = true;
                }
              })
              .catch((err) => {
                isapimethoderr = true;
                console.error(
                  `"API :: ${ApiUrls.getTopNotifications}, Error ::" ${err}`
                );
              })
              .finally(() => {
                if (isapimethoderr == true) {
                  Toast.error(AppMessages.SomeProblem);
                  setTopNotifications([]);
                }
                setTopNotificationsLoader(false);
              });
          },
          isNotificationDeleted ? 300 : 500
        );
      }
    });
  };

  const updateReadStatus = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      Id: parseInt(id),
      IsRead: 1,
      IsUpdateAll: parseInt(id) == 0 ? true : false,
    };

    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.updateNotificationRead}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            getTopNotifications(null, true, id);
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.updateNotificationRead}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
      });
  };

  const onNotifications = () => {
    navigate(
      getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "notifications")
    );
  };

  const onPayments = () => {
    return getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "payments");
  };

  const onProfile = () => {
    return getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "profile");
  };

  return (
    <>
      {/*============== Header Section Start ==============*/}
      <header className="header-style header-fixed nav-on-top">
        <div className="top-header hide">
          <div className="container">
            <div className="row">
              <div className="col">
                <ul className="nav-bar-top text-primary">
                  <li>
                    <i className="fa fa-phone" aria-hidden="true" />
                    <span className="xs-mx-none">Need Support ?</span>{" "}
                    {AppDetails.phone}
                  </li>
                </ul>
              </div>
              <div className="col">
                <ul className="nav-bar-top right d-flex">
                  <li>
                    <a href="#"></a>
                  </li>
                  <li>
                    <a href="#"></a>
                  </li>
                  <li>
                    <a href="#"></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="main-nav">
          <div className="container">
            <div className="row">
              <div className="col">
                <nav className="navbar navbar-expand-lg nav-secondary nav-primary-hover nav-line-active">
                  <Link className="navbar-brand" to={routeNames.home.path}>
                    <img
                      className="nav-logo"
                      src="/assets/images/logo-dark.png"
                    />
                  </Link>
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collpase-widget-usernavlinks"
                    aria-controls="collpase-widget-usernavlinks"
                    aria-expanded="false"
                  >
                    <span className="navbar-toggler-icon flaticon-menu flat-small text-primary" />
                  </button>
                  <div className="collpase navbar-collapse user-navbar">
                    <ul className="navbar-nav ms-auto">
                      {/* <li className="nav-item position-relative">
                        <span
                          className="nav-link icon-wrapper icon-wrapper-alt rounded-circle shadow"
                          data-bs-toggle="collapse"
                          data-bs-target="#collpase-widget-messages"
                          aria-controls="collpase-widget-messages"
                          aria-expanded="false"
                          data-bs-placement="right"
                          data-bs-boundary="window"
                        >
                          <span className="icon-wrapper-bg" />
                          <i className="fa fa-envelope text-primary" />
                          <span className="badge badge-dot badge-dot-sm badge-danger icon-anim-pulse">
                            Messages
                          </span>
                        </span>
                        <ul
                          id="collpase-widget-messages"
                          className="collapse in collpase-widget bg-white shadow"
                        >
                          <div>
                            <div className="widget-header">
                              <div className="row">
                                <div className="col">
                                  <span className="text-primary title">
                                    Messages
                                  </span>
                                </div>
                                <div className="col-auto">
                                  <a
                                    href="#"
                                    className="font-small text-light-dark"
                                  >
                                    <u>Clear All</u>
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="widget-cnt-body lh-1 cscrollbar">
                              <span className="date">Today</span>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                              <span className="date">Yesterday</span>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                              <span className="date">Dec 30, 2024</span>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                              <div className="row box-shadow">
                                <div className="col-auto">
                                  <img
                                    src={GetCookieValues(UserCookie.ProfilePic)}
                                    alt=""
                                    className="shadow profile"
                                  ></img>
                                </div>
                                <div className="col minfo">
                                  <div className="name">Admin</div>
                                  <div className="message">
                                    Got new message ...
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="time">
                                  <i className="fa fa-clock"></i>
                                  <span className="pl-5">1 min ago</span>
                                </div>
                              </div>
                            </div>
                            <div className="widget-footer row">
                              <div className="col">
                                <a href="#!">
                                  <u>View All ...</u>
                                </a>
                              </div>
                            </div>
                          </div>
                        </ul>
                      </li> */}
                      <li className="nav-item mr-20 position-relative">
                        <span
                          className="nav-link icon-wrapper icon-wrapper-alt rounded-circle shadow bscollapsemenu"
                          data-bs-toggle="collapse"
                          data-bs-target="#collpase-widget-notifications"
                          aria-controls="collpase-widget-notifications"
                          aria-expanded="false"
                          data-bs-placement="right"
                          data-bs-boundary="window"
                          onClick={(e) => getTopNotifications(e)}
                        >
                          <span className="icon-wrapper-bg" />
                          <i className="fa fa-bell text-primary" />
                          <span className="badge badge-dot badge-dot-sm badge-danger icon-anim-pulse">
                            Notifications
                          </span>
                        </span>
                        <ul
                          id="collpase-widget-notifications"
                          className="collapse in collpase-widget cwn bg-white shadow"
                        >
                          <div>
                            <div className="widget-header">
                              <div className="row">
                                <div className="col">
                                  <span className="text-primary title">
                                    Notifications
                                  </span>
                                </div>
                                <div className="col-auto">
                                  <a
                                    href="#"
                                    className="font-small text-light-dark"
                                    onClick={(e) => {
                                      updateReadStatus(e, 0);
                                    }}
                                  >
                                    <u>Clear All</u>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="widget-cnt-body lh-1 cscrollbar">
                              {topNotificationsLoader != "init" &&
                                topNotificationsLoader && (
                                  <DataLoader></DataLoader>
                                )}
                              {!topNotificationsLoader &&
                                (topNotifications &&
                                topNotifications?.length > 0 ? (
                                  <>
                                    {topNotifications.map((n, i) => {
                                      return (
                                        <div className="nlist" key={`tno-${i}`}>
                                          {n["Notifications"].map(
                                            (ndata, idx) => {
                                              return (
                                                <div
                                                  className="row box-shadow"
                                                  key={`tnom-${idx}`}
                                                >
                                                  <div className="col-auto">
                                                    <img
                                                      src={ndata.PicPath}
                                                      alt=""
                                                      className="shadow profile"
                                                    ></img>
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
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn-close"
                                                      aria-label="Close"
                                                      onClick={(e) => {
                                                        updateReadStatus(
                                                          e,
                                                          ndata.Id
                                                        );
                                                      }}
                                                    ></button>
                                                  </div>
                                                  <div className="time">
                                                    <i className="fa fa-clock"></i>
                                                    <span className="pl-5">
                                                      {
                                                        ndata.NotificationDateDaysDiff
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
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
                            <div className="widget-footer row">
                              <div className="col">
                                <a onClick={onNotifications}>
                                  <u>View All ...</u>
                                </a>
                              </div>
                            </div>
                          </div>
                        </ul>
                      </li>
                      <UserProfileMenu></UserProfileMenu>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/*============== Header Section End ==============*/}

      {/*============== Menu Section End ==============*/}
      {SetUserMenu()}
      <nav className="navbar navbar-expand-lg user-menu div-page-title">
        <div className="container">
          <div
            className="collapse navbar-collapse bscollapsemenu"
            id="collpase-widget-usernavlinks"
          >
            <ul className="navbar-nav">
              {/* Owner Menu */}
              {GetCookieValues(UserCookie.ProfileTypeId) ==
                config.userProfileTypes.Owner && (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link-user-profile"
                      id="nav-user-profile"
                      to={onProfile()}
                    >
                      <i className="fa fa-user pe-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      id="nav-myproperties"
                    >
                      <i className="fa fa-home pe-2"></i>
                      Properties
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-myproperties"
                          to={routeNames.ownerproperties.path}
                        >
                          <i className="fa fa-house pe-1"></i> My Properties
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-addresidentialproperty"
                          to={routeNames.addresidentialproperty.path}
                        >
                          <i className="fa fa-house-medical pe-1"></i> Add
                          Residential Property
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-addcommercialproperty"
                          to={routeNames.addcommercialproperty.path}
                        >
                          <i className="fa fa-house-medical pe-1"></i> Add
                          Commercial Property
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="nav-agreements">
                      <i className="fa fa-handshake pe-2"></i>
                      Agreements
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-owner-send-agreement"
                          to={routeNames.comingup.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Agreements
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-documents"
                          to={routeNames.mydocuments.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Documents
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          className="nav-link-owner-agreement-templates"
                          id="nav-lnk-owner-agreement-templates"
                          to={routeNames.owneragreementtemplates.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i>{" "}
                          Agreement Templates
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-services"
                      to={routeNames.services.path}
                    >
                      <i className="fa fa-screwdriver-wrench pe-2"></i>
                      Services
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-home"
                      to={routeNames.comingup.path}
                    >
                      <i className="fa fa-credit-card flat-mini pe-2"></i>
                      Payments
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-reports"
                      to={routeNames.propertyreport.path}
                    >
                      <i className="fa fa-chart-pie flat-mini pe-2"></i>
                      Reports
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-myconnections"
                      to={routeNames.connectionsowners.path}
                    >
                      <i className="fa fa-users flat-mini pe-2"></i>
                      Connections
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-settings"
                      to={routeNames.settings.path}
                    >
                      <i className="fa fa-gear flat-mini pe-2"></i>
                      Settings
                    </Link>
                  </li>
                </>
              )}
              {/* Owner Menu */}

              {/* Agent Menu */}
              {GetCookieValues(UserCookie.ProfileTypeId) ==
                config.userProfileTypes.Agent && (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link-user-profile"
                      id="nav-user-profile"
                      to={onProfile()}
                    >
                      <i className="fa fa-user pe-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      id="nav-myproperties"
                    >
                      <i className="fa fa-home pe-2"></i>
                      Properties
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-myproperties"
                          to={routeNames.agentproperties.path}
                        >
                          <i className="fa fa-house pe-1"></i> My Properties
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-assignedproperties"
                          to={routeNames.agentassignedproperties.path}
                        >
                          <i className="fa fa-house-circle-check pe-1"></i>{" "}
                          Assigned Properties
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="nav-agreements">
                      <i className="fa fa-handshake pe-2"></i>
                      Agreements
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-myagreement"
                          to={routeNames.comingup.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Agreements
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-documents"
                          to={routeNames.mydocuments.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Documents
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-agreementtemplates"
                          to={routeNames.comingup.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i>{" "}
                          Agreement Templates
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-services"
                      to={routeNames.services.path}
                    >
                      <i className="fa fa-screwdriver-wrench pe-2"></i>
                      Services
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-home"
                      to={routeNames.comingup.path}
                    >
                      <i className="fa fa-credit-card flat-mini pe-2"></i>
                      Payments
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-reports"
                      to={routeNames.propertyreport.path}
                    >
                      <i className="fa fa-chart-pie flat-mini pe-2"></i>
                      Reports
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-myconnections"
                      to={routeNames.connectionsagents.path}
                    >
                      <i className="fa fa-users flat-mini pe-2"></i>
                      Connections
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-settings"
                      to={routeNames.settings.path}
                    >
                      <i className="fa fa-gear flat-mini pe-2"></i>
                      Settings
                    </Link>
                  </li>
                </>
              )}
              {/* Agent Menu */}

              {/* Tenant Menu */}
              {GetCookieValues(UserCookie.ProfileTypeId) ==
                config.userProfileTypes.Tenant && (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link-user-profile"
                      id="nav-user-profile"
                      to={onProfile()}
                    >
                      <i className="fa fa-user pe-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      id="nav-myproperties"
                    >
                      <i className="fa fa-home pe-2"></i>
                      Properties
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-connectedproperties"
                          to={routeNames.tenantconnectedproperties.path}
                        >
                          <i className="fa fa-house-circle-check pe-1"></i>{" "}
                          Connected Properties
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="nav-agreements">
                      <i className="fa fa-handshake pe-2"></i>
                      Agreements
                    </a>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-myagreement"
                          to={routeNames.comingup.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Agreements
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link
                          id="nav-lnk-documents"
                          to={routeNames.mydocuments.path}
                        >
                          <i className="fa-regular fa-file-lines pe-1"></i> My
                          Documents
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-services"
                      to={routeNames.services.path}
                    >
                      <i className="fa fa-screwdriver-wrench pe-2"></i>
                      Services
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link-tenant-payments"
                      id="nav-tenant-payments"
                      to={onPayments()}
                    >
                      <i className="fa fa-credit-card flat-mini pe-2"></i>
                      Payments
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-reports"
                      to={routeNames.propertyreport.path}
                    >
                      <i className="fa fa-chart-pie flat-mini pe-2"></i>
                      Reports
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-myconnections"
                      to={routeNames.connectionstenants.path}
                    >
                      <i className="fa fa-users flat-mini pe-2"></i>
                      Connections
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      id="nav-settings"
                      to={routeNames.settings.path}
                    >
                      <i className="fa fa-gear flat-mini pe-2"></i>
                      Settings
                    </Link>
                  </li>
                </>
              )}
              {/* Tenant Menu */}
            </ul>
          </div>
        </div>
      </nav>

      {/*============== Menu Section End ==============*/}
    </>
  );
};

export default UserHeader;
