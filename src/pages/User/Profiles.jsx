import React, { useEffect, useState } from "react";
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
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { routeNames } from "../../routes/routes";
import { useProfileTypesGateway } from "../../hooks/useProfileTypesGateway";

const Profiles = () => {
  let $ = window.$;

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

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

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-4 down-line pb-10">Profiles</h4>
              <div className="row row-cols-lg-3 pt-10 pb-0 row-cols-1 g-4 flex-center">
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
                          {profileTypesList.map((pt, pidx) => {
                            let p = userProfilesList?.filter(
                              (item) => item.ProfileTypeId === pt.ProfileTypeId
                            );

                            return p.length > 0 ? (
                              <div
                                className="col"
                                key={`profile-${pidx}`}
                                profile-id={p[0].ProfileId}
                                profile-type={p[0].ProfileType}
                                profile-name={p[0].Name}
                                profile-pic={p[0].PicPath}
                                profile-typeid={p[0].ProfileTypeId}
                                profile-catid={p[0].ProfileCategoryId}
                              >
                                <div className="text-center px-4 py-10">
                                  <div>
                                    <a href="#" onClick={onChangeProfile}>
                                      <img
                                        src={p[0].PicPath}
                                        className="box-100px max-100 rounded-circle shadow"
                                      ></img>
                                    </a>
                                  </div>
                                  <div className="mt-3">
                                    <span className="transation font-500">
                                      <a href="#" onClick={onChangeProfile}>
                                        {p[0].ProfileType}
                                      </a>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="col"
                                key={`profile-${pidx}`}
                                profile-id={0}
                                profile-type={pt.ProfileType}
                                profile-typeid={pt.ProfileTypeId}
                              >
                                <div className="text-center px-4 py-10">
                                  <div className="">
                                    <a href="#" onClick={onAddProfile}>
                                      <i className="fa fa-plus box-100px max-100 rounded-circle shadow bg-primary text-white flat-small pt-35" />
                                    </a>
                                  </div>
                                  <div className="mt-3">
                                    <span className="transation font-500">
                                      <a href="#" onClick={onAddProfile}>
                                        {pt.ProfileType}
                                      </a>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <hr className="w-100 text-primary d -none"></hr>
                          <div className="w-100 pt-10 pr-10 d-flex flex-end mt-0">
                            <Link
                              className="font-500 font-general text-primary"
                              to={getPagesPathByLoggedinUserProfile(
                                GetCookieValues(UserCookie.ProfileTypeId),
                                "profile"
                              )}
                            >
                              <u>
                                Skip
                                <i className="pl-5 fa fa-circle-chevron-right"></i>
                              </u>
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
    </>
  );
};

export default Profiles;
