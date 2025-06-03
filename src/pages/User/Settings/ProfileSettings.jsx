import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  GetCookieValues,
  SetPageLoaderNavLinks,
  SetAccordion,
} from "../../../utils/common";
import { UserCookie } from "../../../utils/constants";
import { routeNames } from "../../../routes/routes";

const ProfileSettings = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser, updateUserProfile } = useAuth();

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const onSettingsClick = (e) => {
    e.preventDefault();
    let target = e?.currentTarget?.id?.toString()?.toLowerCase();
    if (target === "tabprofilesettings") {
      navigate(routeNames.profileinfo.path);
    } else if (target === "tabchangepwd") {
      navigate(routeNames.changepassword.path);
    }
  };

  const onCancel = () => {
    navigate(routeNames.settings.path);
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
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={onCancel}
                      >
                        Settings
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Profile Settings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-8 col-xl-7 px-0">
                <div className="row row-cols-1 g-4 flex-center my-0 px-0 mx-auto">
                  <div className="d-flex align-items-end justify-content-end px-20 py-0 my-0 pb-15">
                    <button
                      type="button"
                      className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                      onClick={onCancel}
                    >
                      <i className="icons font-mini icon-arrow-left text-primary me-2"></i>
                      <span className="font-general">Back to Settings</span>
                    </button>
                  </div>
                  <div className="st-container mt-0">
                    <a
                      className="st-card"
                      id="tabprofilesettings"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-user icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Profile Information</div>
                        <div className="card-description d-none d-lg-flex">
                          Manage your personal information.
                        </div>
                      </div>
                      <div className="arrow">
                        <i className="fa fa-chevron-right" />
                      </div>
                    </a>
                    <a
                      className="st-card"
                      id="tabchangepwd"
                      onClick={onSettingsClick}
                    >
                      <i className="fa fa-key icon font-1dot8rem" />
                      <div className="card-content">
                        <div className="card-title">Change Password</div>
                        <div className="card-description d-none d-lg-flex">
                          Update your account password to keep it secure.
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

export default ProfileSettings;
