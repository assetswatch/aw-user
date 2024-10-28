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
            <div className="col-md-4">
              <div className="card box-shadow-sm profile-card rounded p-4">
                <div className="d-flex">
                  {
                    <img
                      src={GetCookieValues(UserCookie.ProfilePic)}
                      alt=""
                      className="Profile-Image"
                    ></img>
                  }
                  <div className="mb-0">
                    <h6>{GetCookieValues(UserCookie.Name)}</h6>
                    <div className="small text-dark">
                      <p>{GetCookieValues(UserCookie.ProfileType)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="box-shadow-sm card text-center">
                <div className="card-body">
                  <h6>Property</h6>
                  <p class="display-6 mb-0">0</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="box-shadow-sm card text-center">
                <div className="card-body">
                  <h6>Agent</h6>
                  <p class="display-6 mb-0">0</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="box-shadow-sm card text-center">
                <div className="card-body">
                  <h6>Tenant</h6>
                  <p class="display-6 mb-0">0</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="box-shadow-sm card text-center">
                <div className="card-body">
                  <h6>Agreement</h6>
                  <p class="display-6 mb-0">0</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5 d-flex">
            <div className="col-md-4">
              <div className="box-shadow rounded card xs-p-20 p-30 pb-30 border">
                <div>
                  <h6 className="text-center">Personal Information</h6>
                  <hr></hr>
                  <div>
                    <div className="d-flex">
                      <span>Full Name : </span>
                      <p className="text-dark">
                        {GetCookieValues(UserCookie.Name)}
                      </p>
                    </div>
                    <div className="d-flex">
                      <span>Mobile :</span>
                    </div>
                    <div className="d-flex">
                      <span>Email : </span>
                    </div>
                    <div className="d-flex">
                      <span>Location : </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div>
                <div className="box-shadow card rounded xs-p-20 p-30 pb-30 border">
                  <h6>RECENT AGENT CONTACT</h6>
                  <p class="text-muted mb-0">No Contact Available</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="box-shadow card rounded xs-p-20 p-30 pb-30 border">
                  <h6>RECENT AGENT CONTACT</h6>
                  <p class="text-muted mb-0">No Contact Available</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-4">
              <div className="box-shadow rounded xs-p-20 p-30 pb-30 border">
                <div>
                  <h6>Recent Added Property</h6>
                  <p class="text-muted mb-0">No Property Added</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profiles;
