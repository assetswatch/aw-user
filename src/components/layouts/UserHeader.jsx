import { React } from "react";
import { Link } from "react-router-dom";
import { AppDetails, UserCookie } from "../../utils/constants";
import { routeNames } from "../../routes/routes";
import { SetUserMenu } from "../../utils/common";
import UserProfileMenu from "../common/UserProfileMenu";
import { GetCookieValues } from "../../utils/common";

const UserHeader = () => {
  let $ = window.$;
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
                      <li className="nav-item position-relative">
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
                      </li>
                      <li className="nav-item mr-20 position-relative">
                        <span
                          className="nav-link icon-wrapper icon-wrapper-alt rounded-circle shadow bscollapsemenu"
                          data-bs-toggle="collapse"
                          data-bs-target="#collpase-widget-notifications"
                          aria-controls="collpase-widget-notifications"
                          aria-expanded="false"
                          data-bs-placement="right"
                          data-bs-boundary="window"
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
                                <a href="http://www.google.com">
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
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-dashboard"
                  to={routeNames.dashboard.path}
                >
                  <i className="fa fa-user pe-2"></i>
                  My Profile
                </Link>
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
                      to={routeNames.MyAgreement.path}
                    >
                      <i className="fa-regular fa-file pe-1"></i> My Agreement
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link id="nav-lnk-documents" to={routeNames.Documents.path}>
                      <i className="fa-regular fa-file pe-1"></i> Documents
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link
                      id="nav-lnk-agreementtemplates"
                      to={routeNames.AgreementTemplates.path}
                    >
                      <i className="fa-regular fa-file pe-1"></i> Agreement
                      Templates
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="nav-myproperties">
                  <i className="fa fa-home pe-2"></i>
                  My Properties
                </a>
                <ul className="dropdown-menu">
                  <li className="dropdown-item">
                    <Link
                      id="nav-lnk-viewproperties"
                      to={routeNames.userproperties.path}
                    >
                      <i className="fa-regular fa-eye pe-1"></i> View Properties
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link
                      id="nav-lnk-addproperty"
                      to={routeNames.addproperty.path}
                    >
                      <i className="fa fa-edit pe-1"></i> Add Property
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-home"
                  to={routeNames.Services.path}
                >
                  <i className="fa fa-screwdriver-wrench pe-2"></i>
                  Services
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-home"
                  to={routeNames.home.path}
                >
                  <i className="fa fa-credit-card flat-mini pe-2"></i>
                  Payments
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-home"
                  to={routeNames.Reports.path}
                >
                  <i className="fa fa-chart-pie flat-mini pe-2"></i>
                  Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-home"
                  to={routeNames.Agents.path}
                >
                  <i className="fa fa-users flat-mini pe-2"></i>
                  Agents
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-group"
                  to={routeNames.home.path}
                >
                  <i className="fa fa-users flat-mini pe-2"></i>
                  Tenants
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  id="nav-home"
                  to={routeNames.Settings.path}
                >
                  <i className="fa fa-gear flat-mini pe-2"></i>
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/*============== Menu Section End ==============*/}
    </>
  );
};

export default UserHeader;
