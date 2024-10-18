import React from "react";
import { useGetUserProfilesGateway } from "../../hooks/useGetUserProfilesGateway";
import { DataLoader, NoData } from "../../components/common/LazyComponents";
import { apiReqResLoader, checkObjNullorEmpty } from "../../utils/common";
import { AppMessages } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeNames } from "../../routes/routes";

const Profiles = () => {
  let $ = window.$;

  const { userProfilesList, isDataLoading } = useGetUserProfilesGateway();
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
    navigate(routeNames.dashboard.path);
    apiReqResLoader("x", "", "completed");
  };

  return (
    <>
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-4 down-line">Profiles</h4>
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
                          {userProfilesList?.map((p, pidx) => {
                            return (
                              <div
                                className="col"
                                key={`profile-${pidx}`}
                                profile-id={p.ProfileId}
                                profile-type={p.ProfileType}
                                profile-name={p.Name}
                                profile-pic={p.PicPath}
                                profile-typeid={p.ProfileTypeId}
                                profile-catid={p.ProfileCategoryId}
                              >
                                <div className="text-center px-4 py-10">
                                  <div>
                                    <a href="#" onClick={onChangeProfile}>
                                      <img
                                        src={p.PicPath}
                                        className="box-100px max-100 rounded-circle shadow"
                                      ></img>
                                    </a>
                                  </div>
                                  <div className="mt-3">
                                    <span className="transation font-500">
                                      <a href="#" onClick={onChangeProfile}>
                                        {p.ProfileType}
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
                              to={routeNames.dashboard.path}
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
