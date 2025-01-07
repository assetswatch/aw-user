import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ApiUrls,
  AppConstants,
  AppDetails,
  UserCookie,
} from "../../utils/constants";
import {
  apiReqResLoader,
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
} from "../../utils/common";
import routes, { routeNames } from "../../routes/routes";
import { useAuth } from "../../contexts/AuthContext";
import { axiosPost } from "../../helpers/axiosHelper";
import config from "../../config.json";

const UserProfileMenu = (styleprops) => {
  const { logoutUser, loggedinUser } = useAuth();
  const navigate = useNavigate();
  const path = useLocation();

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const onLogout = (e) => {
    e.preventDefault();
    apiReqResLoader("x");
    let objBodyParams = {
      accountid: GetUserCookieValues(UserCookie.AccountId, loggedinUser),
      devicetypeid: AppDetails.devicetypeid,
      sessionid: GetUserCookieValues(UserCookie.SessionId, loggedinUser),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.logout}`, objBodyParams)
      .then((response) => {
        logoutUser();

        let routesList = routes.filter((r) => r.isprotected);
        let isprotectedRoute = routesList.filter(
          (rl) => rl.path.toLowerCase() == path.pathname.toLowerCase()
        )?.[0];

        if (isprotectedRoute == false) {
          window.location.reload();
        } else {
          navigate(routeNames.home.path, { replace: true });
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.logout}, Error ::" ${err}`);
      })
      .finally(() => {
        apiReqResLoader("x", "", "completed");
      });
  };

  const onUpgradePlan = () => {
    navigate(routeNames.upgradeplan.path);
  };

  const onChangeProfile = () => {
    navigate(routeNames.profiles.path);
  };

  const onNotifications = () => {
    navigate(
      getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "notifications")
    );
  };

  const onProfile = () => {
    return getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "profile");
  };

  return (
    <>
      <li
        className={`nav-item user-info-nav-item position-relative ${styleprops?.style?.className}`}
      >
        <div
          className="nav-link user-option no-after-cnt"
          data-bs-toggle="collapse"
          data-bs-target="#collpase-widget-userinfo-menu"
          aria-controls="collpase-widget-userinfo-menu"
          aria-expanded="false"
        >
          <div className="d-flex lh-1">
            {
              <img
                src={GetCookieValues(UserCookie.ProfilePic)}
                alt=""
                className="shadow img-border-white"
              ></img>
            }
            <div className="pt-1 user-info-name">
              <div>{GetCookieValues(UserCookie.Name)}</div>
              <div className="mt-1 small text-light">
                {GetCookieValues(UserCookie.ProfileType)}
              </div>
            </div>
          </div>
        </div>
        <ul
          className={`dropdown-menu-arrow collapse in user-info-ddmenu bg-white position-absolute py-0 px-0 lh-1 shadow rounded`}
          id="collpase-widget-userinfo-menu"
          style={{ zIndex: styleprops?.style?.zIndex }}
        >
          <div className="row user-info-head py-10 px-10 mx-0 mb-10 box-shadow">
            <div className="container">
              <div className="row px-0">
                <div className="col px-0 wpx-50">
                  {" "}
                  <img
                    className="user-info-img shadow img-round"
                    src={GetCookieValues(UserCookie.ProfilePic)}
                    alt=""
                  ></img>
                </div>
                <div className="col px-0 text-left">
                  <div className="lh-20 text-primary font-15">
                    {GetCookieValues(UserCookie.Name)}
                  </div>
                  <div className="small text-light lh-20 font-general">
                    {GetCookieValues(UserCookie.ProfileType)}
                  </div>
                </div>
              </div>
              <div className="row px-0">
                <div className="col px-0 wpx-50"></div>
                <div className="col px-0 text-left flex-vc">
                  <div className="small text-primary lh-20 font-small">
                    {`${GetCookieValues(UserCookie.Plan)} Plan`}
                  </div>
                </div>
                <div className="col text-right px-0 w-120 flex-end">
                  <button
                    className="btn btn-primary btn-xs btn-round box-shadow btn-glow"
                    onClick={onUpgradePlan}
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
          <li className="dropdown-item">
            <Link id="nav-user-info-dashboard" to={onProfile()}>
              <i className="fa fa-user pe-1"></i> My Profile
            </Link>
          </li>
          <li className="dropdown-item">
            <Link id="nav-user-info-settings" to={routeNames.settings.path}>
              <i className="fa fa-gear pe-1"></i> Settings
            </Link>
          </li>
          <li className="dropdown-item">
            <a id="nav-user-info-profiles" onClick={onChangeProfile}>
              <i className="fa fa-exchange pe-1"></i> Manage Profiles
            </a>
          </li>
          <div className="dropdown-divider" />
          <div className="font-500 font-general px-10 py-10 text-gray">
            Notifications
          </div>
          <li className="dropdown-item">
            <a id="nav-user-info-notifications" onClick={onNotifications}>
              <i className="fa fa-bell pe-1"></i> Notifications
            </a>
          </li>
          <li className="dropdown-item d-none">
            <a href="#!">
              <i className="fa fa-envelope pe-1"></i> Messages
            </a>
          </li>
          <div className="dropdown-divider" />
          <li className="dropdown-item">
            <a href="#!" onClick={onLogout}>
              <i className="fa fa-sign-out pe-1" aria-hidden="true"></i> Logout
            </a>
          </li>
        </ul>
      </li>
    </>
  );
};

export default UserProfileMenu;
