import { React } from "react";
import { Link } from "react-router-dom";
import { AppDetails, UserCookie } from "../../utils/constants";
import { routeNames } from "../../routes/routes";
import { useAuth } from "../../contexts/AuthContext";
import UserProfileMenu from "../common/UserProfileMenu";

const Header = () => {
  let $ = window.$;

  const { loggedinUser, isAuthenticated } = useAuth();

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
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon flaticon-menu flat-small text-primary" />
                  </button>
                  <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                  >
                    <ul className="navbar-nav ms-auto">
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          id="nav-home"
                          to={routeNames.home.path}
                        >
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          id="nav-howitworks"
                          to={routeNames.howItWorks.path}
                        >
                          How It Works
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          id="nav-properties"
                          to={routeNames.properties.path}
                        >
                          Properties
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          id="nav-plans"
                          to={routeNames.plans.path}
                        >
                          Plans
                        </Link>
                      </li>
                      {/* <li className="nav-item">
                        <Link
                          className="nav-link"
                          id="nav-blog"
                          to={routeNames.blog.path}
                        >
                          Blog
                        </Link>
                      </li> */}
                      {isAuthenticated() == false ? (
                        <>
                          <li className="nav-item">
                            <Link
                              className="nav-link"
                              id="nav-aboutus"
                              to={routeNames.aboutUs.path}
                            >
                              About Us
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link
                              className="nav-link"
                              id="nav-contactus"
                              to={routeNames.contactUs.path}
                            >
                              Contact Us
                            </Link>
                          </li>
                          <li className="nav-item nav-login-register">
                            <Link
                              className="nav-link d-inline"
                              id="nav-login"
                              to={routeNames.login.path}
                            >
                              <i className="fas fa-user"></i> Login
                            </Link>{" "}
                            /{" "}
                            <Link
                              className="nav-link d-inline"
                              id="nav-register"
                              to={routeNames.register.path}
                            >
                              Register
                            </Link>
                          </li>
                        </>
                      ) : (
                        ""
                      )}
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="col-auto px-12">
                {isAuthenticated() == true && (
                  <UserProfileMenu
                    style={{
                      className: "publiclayout",
                    }}
                  ></UserProfileMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/*============== Header Section End ==============*/}
    </>
  );
};

export default Header;
