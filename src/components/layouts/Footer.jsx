import { Link, useLocation } from "react-router-dom";
import { AppDetails } from "../../utils/constants";
import { routeNames } from "../../routes/routes";
import { useAuth } from "../../contexts/AuthContext";
import FooterCopyRight from "./FooterCopyRight";

const Footer = () => {
  let location = useLocation();
  let current = location.pathname;
  let path = current.substring(current.lastIndexOf("/") + 1).toLowerCase();
  let showFooter = false;
  let footerFalsePages = ["login", "register", "forgotpassword"];
  if (footerFalsePages.includes(path)) {
    showFooter = false;
  } else {
    showFooter = true;
  }

  const { isAuthenticated } = useAuth();

  return (
    <>
      {showFooter && (
        <>
          {/* ============== Footer Section Start ============== */}
          <footer className="full-row footer-default-dark bg-footer pt-5 pb-0">
            <div className="container">
              <div className="row row-cols-lg-4 row-cols-md-2 row-cols-1">
                <div className="col">
                  <div className="footer-widget mb-4">
                    <div className="footer-logo mb-3">
                      <a href="#">
                        <img src="/assets/images/logo-white.png" />
                      </a>
                    </div>
                    <p className="text-white">
                      Assets Watch provides residential, commercial and rural
                      property marketing solutions and search tools, plus
                      information for buyers, investors, sellers, renters and
                      agents United States wide.
                    </p>
                  </div>
                  <div className="footer-widget media-widget mb-4">
                    <a href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a href="#">
                      <i className="fab fa-google-plus-g" />
                    </a>
                    <a href="#">
                      <i className="fab fa-pinterest-p" />
                    </a>
                  </div>
                </div>
                <div className="col">
                  <div className="footer-widget contact-widget mb-4">
                    <h3 className="widget-title down-line mb-4">
                      Contact Info
                    </h3>
                    <ul className="pt-1 text-white">
                      <li>
                        <i
                          className="fa fa-map-marker-alt"
                          aria-hidden="true"
                        />{" "}
                        {AppDetails.address}
                      </li>
                      <li>
                        <i className="fa fa-phone" aria-hidden="true" />{" "}
                        {AppDetails.phone}
                      </li>
                      <li>
                        <i className="fa fa-envelope" aria-hidden="true" />{" "}
                        {AppDetails.email}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col">
                  <div className="footer-widget footer-nav mb-4">
                    <h3 className="widget-title down-line mb-4">Quick Links</h3>
                    <ul>
                      <li>
                        <Link to={routeNames.properties.path}>Properties</Link>
                      </li>
                      <li>
                        <Link to={routeNames.plans.path}>Plans</Link>
                      </li>
                      {isAuthenticated() == false && (
                        <>
                          <li>
                            <Link
                              className="nav-link d-inline"
                              to={routeNames.login.path}
                            >
                              Login
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="nav-link d-inline"
                              to={routeNames.register.path}
                            >
                              Register
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <Link to={routeNames.howItWorks.path}>
                          How it Works
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col">
                  <div className="footer-widget footer-nav mb-4">
                    <h4 className="widget-title down-line mb-4">Other Links</h4>
                    <ul>
                      <li>
                        <Link to={routeNames.aboutUs.path}>About Us</Link>
                      </li>
                      <li>
                        <Link to={routeNames.contactUs.path}>Contact Us</Link>
                      </li>
                      {/* <li>
                        <Link to={routeNames.blog.path}>Blog</Link>
                      </li> */}
                      <li>
                        <Link to={routeNames.privacyPolicy.path}>
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link to={routeNames.terms.path}>
                          Terms and Conditions
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </footer>
          {/* ============== Footer Section End ============== */}
        </>
      )}
      <FooterCopyRight isBorder={showFooter} />
    </>
  );
};

export default Footer;
