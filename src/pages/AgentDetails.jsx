import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
  SessionStorageKeys,
} from "../utils/constants";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  checkStartEndDateGreater,
  setSelectDefaultVal,
} from "../utils/common";
import { axiosPost } from "../helpers/axiosHelper";
import config from "../config.json";
import {
  DataLoader,
  LazyImage,
  NoData,
} from "../components/common/LazyComponents";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import Rating from "../components/common/Rating";
import {
  addSessionStorageItem,
  getsessionStorageItem,
} from "../helpers/sessionStorageHelper";

const AgentDetails = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const [rerouteKey, setRerouteKey] = useState(0);

  let ProfileDetailsId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ProfileDetailsId, 0)
  );

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [initApisLoaded, setinitApisLoaded] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 5);
  const topAssetsRef = useRef(null);

  useEffect(() => {
    if (topAssetsList.length > 0) {
      setCarousel($(topAssetsRef.current));
    }

    // Cleanup on unmount
    return () => {
      if ($(topAssetsRef.current).hasClass("owl-loaded")) {
        $(topAssetsRef.current).trigger("destroy.owl.carousel");
      }
    };
  }, [topAssetsList, rerouteKey]);

  //Load
  useEffect(() => {
    Promise.allSettled([getProfileDetails()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  function setCarousel(elem) {
    try {
      elem?.owlCarousel({
        loop: false,
        margin: 24,
        nav: true,
        dots: true,
        smartSpeed: 500,
        autoplay: false,
        responsive: {
          0: {
            items: 1,
          },
          576: {
            items: 1,
          },
          992: {
            items: 1,
          },
          1200: {
            items: 1,
          },
          1400: {
            items: 1,
          },
        },
      });
    } catch {}
  }

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    addSessionStorageItem(SessionStorageKeys.AssetDetailsId, assetId);
    navigate(routeNames.propertyDetails.path);
  };

  const onProperties = (e) => {
    e.preventDefault();
    setRerouteKey(rerouteKey + 1);
    navigate(routeNames.properties.path, {
      state: { timestamp: Date.now() },
      replace: true,
    });
    window.scrollTo(0, 0);
  };

  function setInitialFormData(pDetails) {
    return {
      txtfirstname: pDetails ? pDetails.FirstName : "",
      txtlastname: pDetails ? pDetails.LastName : "",
      txtmobile: pDetails ? pDetails.MobileNo : "",
      txtlandline: pDetails ? pDetails.LandLineNo : "",
      txtzip: pDetails ? pDetails.Zip : "",
      txtcompanyname: pDetails ? pDetails.CompanyName : "",
      txtwebsite: pDetails ? pDetails.Website : "",
      txtaddressone: pDetails ? pDetails.AddressOne : "",
      txtaddresstwo: pDetails ? pDetails.AddressTwo : "",
      profilepic: pDetails ? pDetails.PicPath : "",
      txtaboutme: pDetails ? pDetails.AboutUs : "",
      profileDetails: pDetails,
    };
  }

  const [formData, setFormData] = useState(setInitialFormData(null));

  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [profileCatData, setProfileCatData] = useState([]);
  const [selectedProfileCatId, setSelectedProfileCatId] = useState(null);

  const [file, setFile] = useState(null);

  //Get Profile details
  const getProfileDetails = () => {
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {
      ProfileId: ProfileDetailsId,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setProfileDetails(objResponse.Data);
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr === true) {
          setProfileDetails(null);
        }
        setIsDataLoading(false);
      });
  };

  return (
    <div key={rerouteKey}>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Agent Details"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Agent Details Start ==============*/}
      <div className="full-row pt-30 bg-light">
        <div className="container">
          <div className="row">
            <div className="col">
              {isDataLoading && (
                <div className="property-overview border rounded bg-white p-30 mb-30  box-shadow">
                  <div className="row row-cols-1">
                    <div className="col">
                      <h5 className="mb-3">Agent Details</h5>
                      <div className="min-h-150">
                        <DataLoader />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isDataLoading && checkObjNullorEmpty(profileDetails) && (
                <div className="property-overview border rounded bg-white p-30 mb-30  box-shadow">
                  <div className="row row-cols-1">
                    <div className="col">
                      <h5 className="mb-3">Agent Details</h5>
                      <NoData
                        className="min-h-150 font-500"
                        message={AppMessages.NoAgentDetails}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 order-xl-2">
              {/* Message Form */}
              <div className="widget widget_contact bg-white border p-30 rounded mb-30 box-shadow">
                <form
                  className="quick-search form-icon-right"
                  action="#"
                  method="post"
                >
                  <div className="form-row">
                    <div className="col-12 mb-10">
                      <div className="form-group mb-0">
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="col-12 mb-10">
                      <div className="form-group mb-0">
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                    <div className="col-12 mb-10">
                      <div className="form-group mb-0">
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          placeholder="Your Email"
                        />
                      </div>
                    </div>
                    <div className="col-12 mb-10">
                      <div className="form-group mb-0">
                        <textarea
                          className="form-control"
                          name="message"
                          placeholder="Message"
                          rows={4}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group mb-0">
                        <button className="btn btn-primary w-100 btn-glow box-shadow rounded">
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/*============== Recent Property Widget Start ==============*/}
              <div className="widget property_carousel_widget box-shadow rounded pb-20">
                <h5 className="mb-30 down-line">Recent Properties</h5>
                <div
                  className="topprop-carusel owl-carousel nav-disable owl-loaded owl-drag"
                  ref={topAssetsRef}
                >
                  {topAssetsList?.length > 0 && (
                    <>
                      {topAssetsList?.map((a, i) => {
                        return (
                          <div className="item" key={`rprop-key-${i}`}>
                            <div className="property-grid-2 property-block transation mb-1">
                              <div className="overflow-hidden position-relative transation thumbnail-img rounded hover-img-zoom">
                                <div className="cata position-absolute">
                                  <span className="sale bg-secondary text-white">
                                    For {a.ContractType}
                                  </span>
                                </div>
                                <Link
                                  onClick={(e) =>
                                    onPropertyDetails(e, a.AssetId)
                                  }
                                >
                                  <LazyImage
                                    src={a.Images?.[0]?.ImagePath}
                                    className="img-fit-grid"
                                    placeHolderClass="min-h-150"
                                  />
                                </Link>
                              </div>
                              <div className="post-content py-3 pb-0">
                                <div className="post-meta font-small text-uppercase list-color-primary">
                                  <Link
                                    onClick={(e) =>
                                      onPropertyDetails(e, a.AssetId)
                                    }
                                    className="listing-ctg text-primary"
                                  >
                                    <i className="fa-solid fa-building" />
                                    <span className="font-general font-400 text-primary">
                                      {a.AssetType}
                                    </span>
                                  </Link>
                                </div>
                                <h5 className="listing-title">
                                  <Link
                                    onClick={(e) =>
                                      onPropertyDetails(e, a.AssetId)
                                    }
                                    className="text-primary font-15"
                                  >
                                    {a.Title}
                                  </Link>
                                </h5>
                                <span className="listing-location mb-2">
                                  <i className="fas fa-map-marker-alt" />{" "}
                                  {a.AddressOne}
                                </span>
                                <span className="listing-price font-16 mb-1 font-600">
                                  {a.PriceDisplay}
                                </span>
                                <ul className="d-flex quantity font-general flex-sb">
                                  <li title="Beds">
                                    <span>
                                      <i className="fa-solid fa-bed"></i>
                                    </span>
                                    {a.Bedrooms}
                                  </li>
                                  <li title="Baths">
                                    <span>
                                      <i className="fa-solid fa-shower"></i>
                                    </span>
                                    {a.Bathrooms}
                                  </li>
                                  <li title="Area">
                                    <span>
                                      <i className="fa-solid fa-vector-square"></i>
                                    </span>
                                    {a.SqfeetDisplay} Sqft
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
                <div className="d-flex flex-end m-0 p-0 pt-10">
                  <Link
                    onClick={onProperties}
                    className="btn-link font-small text-primary"
                  >
                    View more...
                  </Link>
                </div>
              </div>
              {/*============== Recent Property Widget End ==============*/}
            </div>
            <div className="col-xl-8 order-xl-1">
              <div className="widget widget_contact bg-white border p-30 rounded mb-30 box-shadow">
                {/* Comments Form */}
                <div className="row row-cols-1">
                  <div className="col">
                    <h5 className="mb-4">Write A Review</h5>
                    <div className="d-flex w-100 mb-5">
                      <span>Your Rating:</span>
                      <ul className="d-flex mx-2 text-primary font-12">
                        <li>
                          <i className="fas fa-star" />
                        </li>
                        <li>
                          <i className="fas fa-star" />
                        </li>
                        <li>
                          <i className="fas fa-star" />
                        </li>
                        <li>
                          <i className="fas fa-star" />
                        </li>
                        <li>
                          <i className="fas fa-star" />
                        </li>
                      </ul>
                    </div>
                    <form
                      className="contact_message form-boder"
                      action="#"
                      method="post"
                      noValidate="novalidate"
                    >
                      <div className="row g-3">
                        <div className="col-md-6 col-sm-6">
                          <input
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="Name"
                            type="text"
                          />
                        </div>
                        <div className="col-md-6 col-sm-6">
                          <input
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Email Address"
                            type="text"
                          />
                        </div>
                        <div className="col-md-12 col-sm-12">
                          <textarea
                            className="form-control"
                            id="message"
                            rows={5}
                            name="message"
                            placeholder="Message"
                            defaultValue={""}
                          />
                        </div>
                        <div className="col-md-12 col-sm-6">
                          <button
                            className="btn btn-primary"
                            id="send"
                            value="send"
                            type="submit"
                          >
                            Submit
                          </button>
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
    </div>
  );
};
export default AgentDetails;
