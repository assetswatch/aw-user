import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  GetCookieValues,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  SetAccordion,
} from "../../../utils/common";
import { UserCookie } from "../../../utils/constants";
import { routeNames } from "../../../routes/routes";

const Settings = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let profileTypeId = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  const onSettingsClick = (e) => {
    e.preventDefault();
    let target = e?.currentTarget?.id?.toString()?.toLowerCase();
    if (target === "tabprofilesettings") {
      navigate(routeNames.profilesettings.path);
    } else if (target === "tabnotificationsettings") {
      navigate(routeNames.notificationsettings.path);
    } else if (target === "tabmanagebranding") {
      navigate(routeNames.branding.path);
    } else if (target === "tabbusinesssettings") {
      navigate(routeNames.businesses.path);
    }
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {SetAccordion()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">Settings</h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-8 col-xl-7 px-0">
                <div className="row row-cols-1 g-4 flex-center my-0 px-0 mx-auto">
                  <div className="st-container mt-0">
                    <a
                      className="st-card"
                      id="tabprofilesettings"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-user icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Profile Settings</div>
                        <div className="card-description d-none d-lg-flex">
                          Personalize your account and update your sign-in
                          preferences.
                        </div>
                      </div>
                      <div className="arrow">
                        <i className="fa fa-chevron-right" />
                      </div>
                    </a>
                    <a
                      className="st-card"
                      id="tabnotificationsettings"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-bell icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Notification Settings</div>
                        <div className="card-description d-none d-lg-flex">
                          Manage your alert preferences for emails, messages,
                          and app notifications.
                        </div>
                      </div>
                      <div className="arrow">
                        <i className="fa fa-chevron-right" />
                      </div>
                    </a>
                    <a
                      className="st-card"
                      id="tabmanagebranding"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-bullseye icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Manage Branding</div>
                        <div className="card-description d-none d-lg-flex">
                          Customize your brand style to match your company’s
                          identity.
                        </div>
                      </div>
                      <div className="arrow">
                        <i className="fa fa-chevron-right" />
                      </div>
                    </a>
                    <a
                      className="st-card"
                      id="tabbusinesssettings"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-briefcase icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Business Settings</div>
                        <div className="card-description d-none d-lg-flex">
                          Configure your business profiles and members access
                          settings.
                        </div>
                      </div>
                      <div className="arrow">
                        <i className="fa fa-chevron-right" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
