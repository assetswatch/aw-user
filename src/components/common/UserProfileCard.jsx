import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkEmptyVal,
  getCityStateCountryZipFormat,
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
} from "../../utils/common";
import { useAuth } from "../../contexts/AuthContext";
import { ApiUrls, UserCookie } from "../../utils/constants";
import { LazyImage } from "./LazyComponents";
import { axiosPost } from "../../helpers/axiosHelper";
import config from "../../config.json";

const UserProfileCard = React.memo(({ showEdit = false, cssClass = "" }) => {
  let $ = window.$;
  const { loggedinUser } = useAuth();

  //bind from login cookie
  const [pDetails, setpDetails] = useState({
    Name: GetCookieValues(UserCookie.Name),
    Email: GetCookieValues(UserCookie.Email),
    ProfileType: GetCookieValues(UserCookie.ProfileType),
    ProfilePic: GetCookieValues(UserCookie.ProfilePic),
    Mobile: "",
    AddressOne: "",
    AddressTwo: "",
    Country: "",
    CountryShortName: "",
    State: "",
    StateShortName: "",
    City: "",
    Zip: "",
  });

  useEffect(() => {
    let editProfileId = parseInt(
      GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
    );
    let accountId = parseInt(
      GetUserCookieValues(UserCookie.AccountId, loggedinUser)
    );
    let objParams = {
      // AccountId: accountId,
      ProfileId: editProfileId,
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setpDetails({
            ...pDetails,
            Mobile: objResponse?.Data?.MobileNo,
            AddressOne: objResponse?.Data?.AddressOne,
            AddressTwo: objResponse?.Data?.AddressTwo,
            Country: objResponse?.Data?.Country,
            CountryShortName: objResponse?.Data?.CountryShortName,
            State: objResponse?.Data?.State,
            StateShortName: objResponse?.Data?.StateShortName,
            City: objResponse?.Data?.City,
            Zip: objResponse?.Data?.Zip,
          });
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
      })
      .finally(() => {});
  }, []);

  const navigate = useNavigate();
  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  const onEditProfile = () => {
    navigate(
      getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "profileedit")
    );
  };

  return (
    <div
      className={`bg-white box-shadow rounded px-0 mb-20 text-center profile-card-widget ${cssClass}`}
    >
      <div className="min-h-90 bg-primary box-shadow rounded bb-lr-0 bb-rr-0 bg-bb"></div>
      <div className="profile-card">
        <LazyImage
          className="profile-img mx-auto mt-3 shadow rounded-circle"
          src={pDetails?.ProfilePic}
          alt=""
          placeHolderClass={`profile-img mx-auto mt-3 shadow rounded-circle`}
        ></LazyImage>
        {showEdit && (
          <div className="div-action">
            <button
              className="btn btn-primary btn-glow shadow rounded btn-rt"
              name="btneditprofile"
              id="btneditprofile"
              type="button"
              onClick={onEditProfile}
            >
              Edit
            </button>
          </div>
        )}
        <div className="text-center my-20 title">
          <div className="m-0 p-0">
            <div className="pb-0 font-500 font-medium">{pDetails?.Name}</div>
            <div className="small text-light">{pDetails?.ProfileType}</div>
            <hr className="w-100 text-primary mt-10"></hr>
          </div>
          <div className="text-left mx-20 pb-20 info">
            <div className="down-line pb-0 font-small font-500">
              Contact Information
            </div>
            <div className="row pt-15">
              <div className="col-4 text-left">
                <p className="mb-0">Mobile</p>
              </div>
              <div className="col-8 text-right">
                <p className="text-muted mb-0">{pDetails?.Mobile}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-4 text-left">
                <p className="mb-0">Email</p>
              </div>
              <div className="col-8 text-right">
                <p className="text-muted mb-0">{pDetails?.Email}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-4 text-left">
                <p className="mb-0">Address</p>
              </div>
              <div className="col-8 text-right">
                <p className="text-muted mb-0">{pDetails?.AddressOne}</p>
                {!checkEmptyVal(pDetails?.AddressTwo) && (
                  <p className="text-muted mb-0">{pDetails?.AddressTwo}</p>
                )}
                <p className="text-muted mb-0">
                  {getCityStateCountryZipFormat(pDetails)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserProfileCard;
