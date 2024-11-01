import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { SetPageLoaderNavLinks } from "../../../utils/common";

const AgentSettings = () => {
  let $ = window.$;

  const [errors, setErrors] = useState({});
  const [emailNotification, setEmailNotification] = useState(false);
  const [smsNotification, setSmsNotification] = useState(false);
  const [branding, setBranding] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateNotifications = () => {
    const errors = {};
    if (!emailNotification && !smsNotification) {
      errors.notifications = "Please enable at least one notification type.";
    }
    setErrors(errors);
  };

  const validateBranding = () => {
    const errors = {};
    if (!branding || branding === "Please Select...") {
      errors.branding = "Please select a valid branding option.";
    }
    setErrors(errors);
  };

  const validatePasswords = (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwords.oldPassword) {
      errors.oldPassword = "Old password is required.";
    }
    if (!passwords.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters.";
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Settings</h5>
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  <div className="widget bg-white box-shadow rounded px-0 mb-20">
                    <h6 className="mb-20 down-line pb-10 px-20 down-line-mx20">
                      Settings
                    </h6>
                    <ul className="nav-page-lnk">
                      <li className="dropdown-item px-40">
                        <Link
                          id="page-lnk-Notifications"
                          className="page-lnk font-general"
                        >
                          Notifications
                        </Link>
                      </li>
                      <li className="dropdown-item px-40">
                        <Link
                          id="page-lnk-ManageBranding"
                          className="page-lnk font-general"
                        >
                          Manage Branding
                        </Link>
                      </li>
                      <li className="dropdown-item px-40">
                        <Link
                          id="page-lnk-ChangePassword"
                          className="page-lnk font-general"
                        >
                          Change Password
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-xl-9 col-lg-8">
                  <form noValidate>
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col-12 px-0">
                            <h6 className="mb-4 down-line pb-10">
                              Notification Setup
                            </h6>
                            <div className="row d-flex">
                              <div className="col-4 mb-4">
                                <label>
                                  Email Notification{" "}
                                  <span className="text-danger">*</span>
                                </label>
                              </div>
                              <div className="col-2 ">
                                <div className="form-check form-switch">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="emailNotificationSwitch"
                                    checked={emailNotification}
                                    onChange={() =>
                                      setEmailNotification(!emailNotification)
                                    }
                                    style={{ marginTop: "6px" }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="emailNotificationSwitch"
                                  >
                                    {emailNotification ? "On" : "Off"}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="row d-flex">
                              <div className="col-4 mb-4">
                                <label>
                                  SMS Notification{" "}
                                  <span className="text-danger">*</span>
                                </label>
                              </div>
                              <div className="col-2 ">
                                <div className="form-check form-switch">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="smsNotificationSwitch"
                                    checked={smsNotification}
                                    onChange={() =>
                                      setSmsNotification(!smsNotification)
                                    }
                                    style={{ marginTop: "6px" }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="smsNotificationSwitch"
                                  >
                                    {smsNotification ? "On" : "Off"}
                                  </label>
                                </div>
                              </div>
                            </div>
                            {errors.notifications && (
                              <div className="text-danger">
                                {errors.notifications}
                              </div>
                            )}
                            <div className="col-12 text-right mt-3">
                              <button
                                className="btn btn-primary btn-glow btn-xs rounded box-shadow"
                                type="button"
                                onClick={validateNotifications}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <div className="col-xl-9 col-lg-8">
                    <form noValidate>
                      <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-12 px-0">
                              <h6 className="mb-4 down-line pb-10">
                                Manage Branding
                              </h6>
                              <div className="row d-flex">
                                <div className="col-3 mb-4">
                                  <label
                                    htmlFor="branding"
                                    className="col-sm-2 col-form-label font-weight-bold"
                                  >
                                    Branding
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <div className="col-3">
                                  <select
                                    className="form-control"
                                    id="branding"
                                    value={branding}
                                    onChange={(e) =>
                                      setBranding(e.target.value)
                                    }
                                  >
                                    <option value="">Please Select...</option>
                                    <option value="Default Branding">
                                      Default Branding
                                    </option>
                                    <option value="No Branding">
                                      No Branding
                                    </option>
                                  </select>
                                  {errors.branding && (
                                    <div className="text-danger">
                                      {errors.branding}
                                    </div>
                                  )}
                                </div>
                                <div className="col-12 text-right mt-3">
                                  <button
                                    className="btn btn-primary btn-glow btn-xs rounded box-shadow"
                                    type="button"
                                    onClick={validateBranding}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <div className="col-xl-9 col-lg-8">
                    <form noValidate onSubmit={validatePasswords}>
                      <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-12 px-0">
                              <h6 className="mb-4 down-line pb-10">
                                Change Password
                              </h6>
                              <div className="row d-flex">
                                <div className="col-lg-4 mb-20">
                                  <label className="mb-2 font-fifteen">
                                    Old Password
                                  </label>
                                  <input
                                    className="form-control"
                                    name="oldPassword"
                                    type="password"
                                    value={passwords.oldPassword}
                                    onChange={handleInputChange}
                                  />
                                  {errors.oldPassword && (
                                    <div className="text-danger">
                                      {errors.oldPassword}
                                    </div>
                                  )}
                                </div>
                                <div className="col-lg-4 mb-20">
                                  <label className="mb-2 font-fifteen">
                                    New Password
                                  </label>
                                  <input
                                    className="form-control"
                                    name="newPassword"
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={handleInputChange}
                                  />
                                  {errors.newPassword && (
                                    <div className="text-danger">
                                      {errors.newPassword}
                                    </div>
                                  )}
                                </div>
                                <div className="col-lg-4 mb-20">
                                  <label className="mb-2 font-fifteen">
                                    Confirm Password
                                  </label>
                                  <input
                                    className="form-control"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={handleInputChange}
                                  />
                                  {errors.confirmPassword && (
                                    <div className="text-danger">
                                      {errors.confirmPassword}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="col-12 text-right mt-3">
                                <button
                                  className="btn btn-primary btn-glow btn-xs rounded box-shadow"
                                  type="submit"
                                  onClick={validatePasswords}
                                >
                                  Change Password
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
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

export default AgentSettings;
