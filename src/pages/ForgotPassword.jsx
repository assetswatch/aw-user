import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { useAuth } from "../contexts/AuthContext";
import {
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
} from "../utils/common";
import { UserCookie } from "../utils/constants";

const ForgotPassword = () => {
  let $ = window.$;

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {isAuthenticated() == true ? (
        <Navigate
          to={getPagesPathByLoggedinUserProfile(
            GetCookieValues(UserCookie.ProfileTypeId),
            "profile"
          )}
          replace
        />
      ) : (
        <>
          {/*============== Page title Start ==============*/}
          <PageTitle
            title="Forgot Password"
            navLinks={[{ title: "Home", url: routeNames.home.path }]}
          ></PageTitle>
          {/*============== Page title End ==============*/}

          {/*============== ForgotPassword Form Start ==============*/}
          <div className="full-row  bg-light">
            <div className="container">
              <div className="row">
                <div className="col-xl-5 col-lg-6 mx-auto">
                  <div className="bg-white xs-p-20 p-30 border rounded shadow">
                    <div className="form-icon-left rounded form-boder">
                      <h4 className="mb-4 down-line pb-10">Forgot Password</h4>
                      <form action="#" method="post">
                        <div className="row row-cols-1 g-3">
                          <div className="col">
                            <label className="mb-2">Email Address</label>
                            <input
                              type="email"
                              className="form-control bg-light"
                              defaultValue=""
                              required=""
                            />
                          </div>
                          <div className="col">
                            <button
                              type="button"
                              className="btn btn-primary mb-2"
                            >
                              Send
                            </button>
                          </div>
                          <div className="col">
                            <Link
                              to={routeNames.login.path}
                              className="text-dark d-table py-1"
                            >
                              <u>I already have account.</u>
                            </Link>
                            <Link
                              to={routeNames.register.path}
                              className="text-dark d-table py-1"
                            >
                              <u>Don't have account? Click here.</u>
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*============== ForgotPassword Form End ==============*/}
        </>
      )}
    </>
  );
};

export default ForgotPassword;
