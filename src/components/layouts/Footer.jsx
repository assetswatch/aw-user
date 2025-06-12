import { Link, useLocation } from "react-router-dom";
import { AppDetails } from "../../utils/constants";
import { routeNames } from "../../routes/routes";
import { useAuth } from "../../contexts/AuthContext";
import FooterCopyRight from "./FooterCopyRight";
import { UrlWithoutParam } from "../../utils/common";

const Footer = () => {
  let location = useLocation();
  let current = location.pathname.toLowerCase();
  let path = current.split("/")[1]?.toLowerCase();

  let showFooter = false;
  let footerFalsePages = [
    "signin",
    "signup",
    "forgotpassword",
    "resetpassword",
  ];

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
                    <div className="footer-logo mb-1">
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
                  <div className="footer-widget med ia-widget mb-1 media-widget-round-white-primary-shadow">
                    <a
                      href="https://www.facebook.com/assetswatch/"
                      target="_blank"
                      className="mr-10"
                    >
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a
                      href="https://twitter.com/assetswatch"
                      target="_blank"
                      className="mr-10"
                    >
                      <i className="fab fa-twitter" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/assets-watch-355127175/"
                      target="_blank"
                      className="mr-10"
                    >
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a
                      href="https://www.instagram.com/assetswatch/"
                      target="_blank"
                      className="mr-10"
                    >
                      <i className="fab fa-instagram" />
                    </a>
                  </div>
                </div>
                <div className="col">
                  <div className="footer-widget contact-widget mb-3">
                    <h3 className="widget-title down-line mb-3">
                      Contact Info
                    </h3>
                    <ul className="pt-0 text-white">
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
                  <div className="footer-widget footer-nav mb-3">
                    <h3 className="widget-title down-line mb-3">Quick Links</h3>
                    <ul className="pt-0">
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
                              to={UrlWithoutParam(routeNames.signin)}
                            >
                              Sign In
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="nav-link d-inline"
                              to={UrlWithoutParam(routeNames.signup)}
                            >
                              Sign Up
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
                  <div className="footer-widget footer-nav mb-3">
                    <h4 className="widget-title down-line mb-3">Other Links</h4>
                    <ul className="pt-0">
                      <li>
                        <Link to={routeNames.aboutUs.path}>About Us</Link>
                      </li>
                      <li>
                        <Link to={routeNames.contactUs.path}>Contact Us</Link>
                      </li>
                      <li>
                        <Link to={routeNames.testimonials.path}>
                          Testimonials
                        </Link>
                      </li>
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
      <FooterCopyRight isBorder={showFooter} css="text-center" />
    </>
  );
};

export default Footer;
