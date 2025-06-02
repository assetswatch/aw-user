import React from "react";
import { useGetUserProfilesGateway } from "../../hooks/useGetUserProfilesGateway";
import { DataLoader, NoData } from "../../components/common/LazyComponents";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  SetPageLoaderNavLinks,
} from "../../utils/common";
import { AppMessages, UserCookie } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeNames } from "../../routes/routes";
import { useProfileTypesGateway } from "../../hooks/useProfileTypesGateway";
import config from "../../config.json";

const Profiles = () => {
  let $ = window.$;

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let viewProfiles = false;

  if (params.size == 1 && params.get("v") != null) {
    viewProfiles = true;
  }

  const { userProfilesList, isDataLoading } = useGetUserProfilesGateway();

  const { profileTypesList } = useProfileTypesGateway();

  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();

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
    navigate(
      getPagesPathByLoggedinUserProfile(
        parseInt(pelem.getAttribute("profile-typeid")),
        "profile"
      )
    );

    apiReqResLoader("x", "", "completed");
  };

  const onAddProfile = (e) => {
    e.preventDefault();
    let pelem = e.target.closest(".col");

    navigate(
      routeNames.createprofile.path.replace(
        ":ProfileType",
        pelem.getAttribute("profile-type")
      )
    );
  };

  const setProfileText = (profileTypeId) => {
    if (profileTypeId == config.userProfileTypes.Owner) {
      return " Manages property and invites agents or tenants.";
    } else if (profileTypeId == config.userProfileTypes.Agent) {
      return " Handles daily operations and tenant relations.";
    } else if (profileTypeId == config.userProfileTypes.Tenant) {
      return " Occupies and manages leased properties.";
    } else {
      return "";
    }
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10 cur-pointer">
                        Profiles
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Choose Your Profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-8 col-xl-8 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="breadcrumb mb-0">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-2 down-line pb-10">Select Profile</h6>
                    </div>
                  </div>
                  <div className="row row-cols-lg-3 pt-20 pb-10 row-cols-1 g-4 flex-center">
                    {isDataLoading && (
                      <div className="pb-100">
                        <DataLoader />
                      </div>
                    )}
                    {!isDataLoading && (
                      <>
                        {checkObjNullorEmpty(userProfilesList) ||
                          (userProfilesList.length == 0 && (
                            <div className="pb-100">
                              <NoData message={AppMessages.NoProfiles} />
                            </div>
                          ))}
                        {!checkObjNullorEmpty(userProfilesList) &&
                          userProfilesList.length > 0 && (
                            <>
                              {viewProfiles == true ? (
                                <>
                                  {userProfilesList.map((p, pidx) => {
                                    return (
                                      <div
                                        className="col cur-pointer"
                                        key={`profile-${pidx}`}
                                        profile-id={p.ProfileId}
                                        profile-type={p.ProfileType}
                                        profile-name={p.Name}
                                        profile-pic={p.PicPath}
                                        profile-typeid={p.ProfileTypeId}
                                        profile-catid={p.ProfileCategoryId}
                                        onClick={onChangeProfile}
                                      >
                                        <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                                          <div>
                                            <a>
                                              <img
                                                src={p.PicPath}
                                                className="box-100px max-100 rounded-circle shadow"
                                              ></img>
                                            </a>
                                          </div>
                                          <div className="mt-3">
                                            <span className="transation font-500 text-primary">
                                              <a>{p.ProfileType}</a>
                                            </span>
                                            <p className="transation font-general font-500">
                                              {setProfileText(p.ProfileTypeId)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              ) : (
                                <>
                                  {profileTypesList.map((pt, pidx) => {
                                    let p = userProfilesList?.filter(
                                      (item) =>
                                        item.ProfileTypeId === pt.ProfileTypeId
                                    );

                                    return p.length > 0 ? (
                                      <div
                                        className="col cur-pointer"
                                        key={`profile-${pidx}`}
                                        profile-id={p[0].ProfileId}
                                        profile-type={p[0].ProfileType}
                                        profile-name={p[0].Name}
                                        profile-pic={p[0].PicPath}
                                        profile-typeid={p[0].ProfileTypeId}
                                        profile-catid={p[0].ProfileCategoryId}
                                        onClick={onChangeProfile}
                                      >
                                        <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                                          <div>
                                            <a>
                                              <img
                                                src={p[0].PicPath}
                                                className="box-100px max-100 rounded-circle shadow"
                                              ></img>
                                            </a>
                                          </div>
                                          <div className="mt-3">
                                            <span className="transation font-500 text-primary">
                                              <a>{p[0].ProfileType}</a>
                                            </span>
                                            <p className="transation font-general font-500">
                                              {setProfileText(
                                                p[0].ProfileTypeId
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="col cur-pointer"
                                        key={`profile-${pidx}`}
                                        profile-id={0}
                                        profile-type={pt.ProfileType}
                                        profile-typeid={pt.ProfileTypeId}
                                        onClick={onAddProfile}
                                      >
                                        <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                                          <div>
                                            <a>
                                              <i className="fa fa-plus box-100px max-100 rounded-circle shadow bg-primary text-white flat-small pt-35" />
                                            </a>
                                          </div>
                                          <div className="mt-3">
                                            <span className="transation font-500 text-primary">
                                              <a>{pt.ProfileType}</a>
                                            </span>
                                            <p className="transation font-general font-500">
                                              {setProfileText(pt.ProfileTypeId)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                              {/* <hr className="w-100 text-primary mt-30 d -none"></hr> */}
                              <div className="w-100 pt-30 pr-10 d-flex flex-end mt-0">
                                <Link
                                  className="font-500 font-general text-primary hovertxt-dec"
                                  to={getPagesPathByLoggedinUserProfile(
                                    GetCookieValues(UserCookie.ProfileTypeId),
                                    "profile"
                                  )}
                                >
                                  <span className="pe-2">
                                    Skip →
                                    {/* <i className="pl-5 fa fa-circle-chevron-right"></i> */}
                                  </span>
                                  {/* <u>Cancel</u> */}
                                </Link>
                              </div>
                            </>
                          )}
                      </>
                    )}
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

export default Profiles;
