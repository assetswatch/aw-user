import React, { useEffect, useState } from "react";
import {
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { NoData } from "../../../components/common/LazyComponents";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ViewProperty = () => {
  let $ = window.$;

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let viewAssetId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewAssetId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [assetDetails, setAssetDetails] = useState([]);

  useEffect(() => {
    getAssetDetails();
    return () => {
      //deletesessionStorageItem(SessionStorageKeys.ViewAssetId);
    };
  }, []);

  const getAssetDetails = () => {
    if (viewAssetId > 0) {
      let objParams = {
        AccountId: accountid,
        // ProfileId: profileid,
        AssetId: viewAssetId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserAssetDetails}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let details = objResponse.Data;
            setAssetDetails(details);
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getUserAssetDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {});
    }
  };

  const onCancel = (e) => {
    window.history.go(-1);
    //navigate(routeNames.agentproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light content-ph">
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
                        Properties
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Property Details
                      </span>
                    </div>
                  </div>
                </div>
                <GoBackPanel clickAction={onCancel} />
              </div>
              <div className="row">
                <div className="col-xl-7 col-lg-7">
                  <form noValidate>
                    {/*============== Propertyinfo Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <div className="row mx-0">
                              <div className="col-12 px-0">
                                <h6 className="mb-3 down-line  pb-10">
                                  Property Info
                                </h6>
                              </div>
                            </div>
                            <div
                              className="row form-view"
                              id="divViewPropertyInfo"
                            >
                              <div className="col-md-6 mb-15">
                                <span>AddressOne : </span>
                                <span>{assetDetails?.AddressOne}</span>
                              </div>
                              <div className="col-md-6 mb-15 text-md-end">
                                <span>AddressTwo : </span>
                                <span>{assetDetails?.AddressTwo}</span>
                              </div>
                              <div className="col-md-6 mb-15">
                                <span>Country : </span>
                                <span>{assetDetails?.Country}</span>
                              </div>
                              <div className="col-md-6 mb-15 text-md-end">
                                <span>State : </span>
                                <span>{assetDetails?.State}</span>
                              </div>
                              <div className="col-md-6 mb-15">
                                <span>City : </span>
                                <span>{assetDetails?.City}</span>
                              </div>
                              <div className="col-md-6 mb-15 text-md-end">
                                <span>Zip code : </span>
                                <span>{assetDetails?.Zip}</span>
                              </div>
                              <div className="col-md-6 mb-15">
                                <span>Property type : </span>
                                <span>{assetDetails?.AssetType}</span>
                              </div>
                              <div className="col-md-6 mb-15 text-md-end">
                                <span>Area : </span>
                                <span>
                                  {assetDetails?.AreaDisplay}{" "}
                                  {assetDetails?.AreaUnitType}
                                </span>
                              </div>
                              <div className="col-md-4 mb-15">
                                <span>Noof floors : </span>
                                <span>{assetDetails?.NoOfFloors}</span>
                              </div>
                              <div className="col-md-4 mb-15 text-md-center">
                                <span>Bedrooms : </span>
                                <span>{assetDetails?.Bedrooms}</span>
                              </div>
                              <div className="col-md-4 mb-15 text-md-end">
                                <span>Bathrooms : </span>
                                <span>{assetDetails?.Bathrooms}</span>
                              </div>
                              {assetDetails?.IsListed == 1 && (
                                <>
                                  <div className="col-md-6 mb-15">
                                    <span>Listing Type : </span>
                                    <span>
                                      {assetDetails?.ListingType
                                        ? assetDetails.ListingType
                                        : "--"}
                                    </span>
                                  </div>
                                  <div className="col-md-6 mb-15 text-md-end">
                                    <span>Listed On : </span>
                                    <span>
                                      {assetDetails?.ListedDateDisplay}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="col-md-12 mb-15">
                                <span>Description : </span>
                                <span>{assetDetails?.Description}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Propertyinfo End ==============*/}

                    {/*============== Add Owners Start ==============*/}

                    <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <div className="row mx-0">
                              <div className="col-12 px-0">
                                <h6 className="mb-3 down-line  pb-10">
                                  Property Owners
                                </h6>
                              </div>
                            </div>
                            {assetDetails?.Owners?.length == 0 ? (
                              <>
                                <NoData
                                  message={AppMessages.NoOwners}
                                  className="mt-25 mb-40"
                                ></NoData>
                              </>
                            ) : (
                              assetDetails?.Owners?.map((o, idx) => (
                                <div
                                  className="row form-view"
                                  key={`od-${idx}`}
                                >
                                  <div className="col-md-6 mb-15">
                                    <span>Owner : </span>
                                    <span>
                                      {o.FirstName} {o.LastName}
                                    </span>
                                  </div>
                                  <div className="col-md-6 mb-15 text-md-end">
                                    <span>Ownership status : </span>
                                    <span>{o.OwnerShipStatusDisplay}</span>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <span>Ownership percentage : </span>
                                    <span>{o.SharePercentageDisplay}</span>
                                  </div>
                                  <hr className="w-100 text-primary my-10 px-0"></hr>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/*============== Add Owners End ==============*/}
                  </form>
                </div>
                <div className="col-xl-5 col-lg-5 md-mt-20">
                  {/*============== Propertymedia Start ==============*/}
                  <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                    <div className="container-fluid">
                      <div className="row">
                        <div className="col px-0">
                          <div className="row mx-0">
                            <div className="col-12 px-0">
                              <h6 className="mb-3 down-line  pb-10">
                                Property Media
                              </h6>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-12 mt-0 mb-20">
                              {assetDetails?.Images?.length == 0 ? (
                                <NoData
                                  message={AppMessages.NoAssetMedia}
                                  className="mt-25 mb-40"
                                ></NoData>
                              ) : (
                                <ul className="row row-cols-xl-6 row-cols-md-3 row-cols-2 media-upload">
                                  {assetDetails?.Images?.map((file, index) => (
                                    <li
                                      className="col bg-light border rounded m-10 p-0"
                                      key={`if-${index}`}
                                    >
                                      <>
                                        <img
                                          src={file.ImagePath}
                                          className="py-0"
                                          alt={file.ImageName}
                                        />
                                      </>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Propertymedia End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProperty;
