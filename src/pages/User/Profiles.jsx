import React from "react";
import { useGetUserProfilesGateway } from "../../hooks/useGetUserProfilesGateway";
import { DataLoader, NoData } from "../../components/common/LazyComponents";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  SetPageLoaderNavLinks,
  GetCookieValues,
} from "../../utils/common";
import { AppMessages, UserCookie } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeNames } from "../../routes/routes";

const Profiles = () => {
  let $ = window.$;

  const { userProfilesList, isDataLoading } = useGetUserProfilesGateway();
  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const onChangeProfile = (e) => {
    apiReqResLoader("x");
    e.preventDefault();

    let pelem = e.target.closest(".col");
    let profileData = {
      profileid: pelem.getAttribute("profile-id"),
      profiletype: pelem.getAttribute("profile-type"),
      profilename: pelem.getAttribute("profile-name"),
      profilepic: pelem.getAttribute("profile-pic"),
      profiletypeid: pelem.getAttribute("profile-typeid"),
      profilecatid: pelem.getAttribute("profile-catid"),
    };

    updateUserProfile(profileData);
    navigate(routeNames.dashboard.path);
    apiReqResLoader("x", "", "completed");
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Profile</h5>
            </div>
          </div>
          <div className="row d-flex">
            <div className="col-4">
              <div className="box-shadow rounded p-5">
                <div className="p-2 d-flex">
                  {
                    <img
                      src={GetCookieValues(UserCookie.ProfilePic)}
                      alt=""
                      className=" user-profile-pic img-border-white"
                    ></img>
                  }
                  <div className="p-3 user-info-name">
                    <h6>{GetCookieValues(UserCookie.Name)}</h6>
                    <div className="mt-1 small text-dark">
                      {GetCookieValues(UserCookie.ProfileType)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-2">
              <div className="box-shadow rounded p-5"></div>
            </div>
            <div className="col-2">
              <div className="box-shadow rounded p-5"></div>
            </div>
            <div className="col-2">
              <div className="box-shadow rounded p-5"></div>
            </div>
            <div className="col-2">
              <div className="box-shadow rounded p-5"></div>
            </div>
          </div>
          <div className="row mt-5 d-flex">
            <div className="col-4">
              <div className="box-shadow rounded xs-p-20 p-30 pb-30 border">
                <div>
                  <h6 className="text-center">Personal Information</h6>
                  <hr></hr>
                  <div>
                    <div>
                      <span>Full Name :</span>
                    </div>
                    <div>
                      <span>Mobile :</span>
                    </div>
                    <div>
                      <span>Email : </span>
                    </div>
                    <div>
                      <span>Location : </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="box-shadow rounded xs-p-20 p-30 pb-30 border"></div>
            </div>
            <div className="col-4">
              <div className="box-shadow rounded xs-p-20 p-30 pb-30 border"></div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-4">
              <div className="box-shadow rounded xs-p-20 p-30 pb-30 border">
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profiles;
