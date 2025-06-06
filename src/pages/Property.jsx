import React, { useEffect, useState } from "react";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import {
  aesCtrDecrypt,
  aesCtrEncrypt,
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  getCityStateCountryZipFormat,
  GetUserCookieValues,
} from "../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
} from "../utils/constants";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DataLoader,
  LazyImage,
  NoData,
} from "../components/common/LazyComponents";
import PropertySearch from "../components/layouts/PropertySearch";
import InputControl from "../components/common/InputControl";
import { formCtrlTypes } from "../utils/formvalidation";
import TextAreaControl from "../components/common/TextAreaControl";
import { useAuth } from "../contexts/AuthContext";
import { Toast } from "../components/common/ToastView";

const Property = () => {
  let $ = window.$;

  const navigate = useNavigate();
  const { isAuthenticated, loggedinUser } = useAuth();
  const [rerouteKey, setRerouteKey] = useState(0);

  const { id } = useParams();

  let assetDetailId = 0; //parseInt(isInt(Number(id)) ? id : 0);

  let loggedInProfileId = isAuthenticated()
    ? parseInt(GetUserCookieValues(UserCookie.ProfileId, loggedinUser))
    : 0;

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "/assets/js/",
      pos: "body",
      type: "js",
      files: ["layerslider.js", "owl.js"],
    },
  ];

  useEffect(() => {
    aesCtrDecrypt(id).then((decId) => {
      assetDetailId = decId
        .toString()
        .substring(0, decId.toString().indexOf(":"));

      if (assetDetailId == 0) {
        navigate(routeNames.properties.path);
      } else {
        //load js/css depedency files.
        let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
        let promiseLoadFiles = arrLoadFiles.map(loadFile);
        Promise.allSettled(promiseLoadFiles).then(function (responses) {});

        getAssetDetails();
        getLoggedInUserDetails();
      }
    });

    return () => {
      unloadFile(arrJsCssFiles); //unload files.
    };
  }, [rerouteKey]);

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 3);

  const [assetDetails, setAssetDetails] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  let formErrors = {};
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtemail: "",
      txtname: "",
      txtphone: "",
      txtmessage: "",
    };
  }
  const [formData, setFormData] = useState(setInitialFormData());

  useEffect(() => {
    try {
      $("#single-property").layerSlider({
        sliderVersion: "6.5.0b2",
        type: "popup",
        pauseOnHover: "disabled",
        skin: "photogallery",
        fullSizeMode: "fitheight",
        globalBGSize: "contain",
        navStartStop: false,
        hoverBottomNav: true,
        showCircleTimer: true,
        thumbnailNavigation: "always",
        tnContainerWidth: "100%",
        tnHeight: 70,
        popupShowOnTimeout: 1,
        popupShowOnce: true,
        popupCloseButtonStyle:
          "background: rgba(0,0,0,.5); border-radius: 2px; border: 0; left: auto; right: 10px;",
        popupResetOnClose: "disabled",
        popupDistanceLeft: 20,
        popupDistanceRight: 20,
        popupDistanceTop: 20,
        popupDistanceBottom: 20,
        popupDurationIn: 750,
        popupDelayIn: 500,
        popupTransitionIn: "scalefromtop",
        popupTransitionOut: "scaletobottom",
        height: 700,
        skinsPath: "/assets/skins/",
        keybNav: false,
      });
    } catch {}
  }, [assetDetails]);

  //Get asset details
  const getAssetDetails = () => {
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {
      AssetId: assetDetailId,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getAssetDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (
            objResponse.Data?.IsListed == 0 ||
            checkObjNullorEmpty(objResponse.Data)
          ) {
            navigate(routeNames.properties.path);
          } else {
            setAssetDetails(objResponse.Data);
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.getAssets}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr === true) {
          setAssetDetails(null);
          navigate(routeNames.properties.path);
        }
        setIsDataLoading(false);
      });
  };

  //get loggedinuser details
  const getLoggedInUserDetails = () => {
    if (loggedInProfileId > 0) {
      let objParams = {
        ProfileId: loggedInProfileId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setFormData({
              ...formData,
              txtemail: objResponse.Data?.Email,
              txtname: objResponse.Data?.FirstName,
              txtphone: objResponse.Data?.MobileNo,
            });
          }
        })
        .catch((err) => {
          console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
        })
        .finally(() => {});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSendMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader(
        "btnsendmessage",
        "Sending Message",
        API_ACTION_STATUS.START
      );
      let errctl = ".form-error";
      $(errctl).html("");

      setErrors({});
      let isapimethoderr = false;

      let fromProfileid = GetUserCookieValues(
        UserCookie.ProfileId,
        loggedinUser
      );

      let objBodyParams = {
        Name: formData.txtname,
        Email: formData.txtemail,
        Phone: formData.txtphone,
        Message: formData.txtmessage,
        FromProfileId: parseInt(
          checkEmptyVal(fromProfileid) ? 0 : fromProfileid
        ),
        ToProfileId: parseInt(assetDetails?.ListedByProfileId),
        AssetId: parseInt(assetDetails?.AssetId),
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.sendUserEnquiry}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Id > 0) {
              Toast.success(objResponse.Data.Message);
              setFormData(setInitialFormData());
            } else {
              $(errctl).html(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.sendUserEnquiry}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendmessage",
            "Send Message",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    aesCtrEncrypt(assetId.toString()).then((encId) => {
      navigate(routeNames.property.path.replace(":id", encId), {
        state: { timestamp: Date.now() },
        replace: true,
      });
      setRerouteKey(rerouteKey + 1);
    });
    window.scrollTo(0, 0);
  };

  return (
    <div key={rerouteKey}>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Property Details"
        navLinks={[
          { title: "Home", url: routeNames.home.path },
          { title: "Properties", url: routeNames.properties.path },
        ]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Property Details Start ==============*/}
      <div className="full-row pt-30 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-xl-4 order-xl-2">
              {/* Message Form */}
              <div className="widget widget_contact bg-white border p-30 rounded mb-30 box-shadow">
                <h6 className="mb-4 down-line pb-10">Listed By</h6>
                {assetDetails && (
                  <div className="media mb-3">
                    <LazyImage
                      className="rounded-circle me-3 shadow img-border-white w-80px"
                      src={assetDetails.PicPath}
                      alt={assetDetails.FirstName}
                      placeHolderClass="min-h-80 w-80px"
                    />
                    <div className="media-body">
                      <div className="font-xl font-500 text-primary">
                        {assetDetails.FirstName} {assetDetails.LastName}
                      </div>
                      <span className="d-block small mt-0 mb-1 text-light lh-1">
                        {assetDetails.ListedByProfileType}
                      </span>
                      <span className="d-block">
                        <i
                          className="flat-mini flaticon-phone-call me-2"
                          aria-hidden="true"
                        ></i>
                        {assetDetails.MobileNo}
                      </span>
                      <span className="d-block">
                        <i
                          className="flat-mini flaticon-email me-2"
                          aria-hidden="true"
                        ></i>
                        {assetDetails.Email}
                      </span>
                    </div>
                  </div>
                )}
                <form
                  className="quick-search form-icon-right"
                  noValidate
                  onSubmit={onSendMessage}
                >
                  <div className="row">
                    <div className="col-md-12 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field d-none"
                        lblText="Your name:"
                        placeHolder={"Name"}
                        name="txtname"
                        ctlType={formCtrlTypes.name}
                        isFocus={true}
                        required={true}
                        onChange={handleChange}
                        value={formData.txtname}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={10}
                      ></InputControl>
                    </div>
                    <div className="col-md-12 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field d-none"
                        lblText="Your email:"
                        name="txtemail"
                        placeHolder={"Email Id"}
                        ctlType={formCtrlTypes.email}
                        required={true}
                        onChange={handleChange}
                        value={formData.txtemail}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={11}
                      ></InputControl>
                    </div>
                    <div className="col-md-12 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field d-none"
                        lblText="Your phone:"
                        name="txtphone"
                        placeHolder={"Phone number"}
                        ctlType={formCtrlTypes.phone}
                        required={true}
                        onChange={handleChange}
                        value={formData.txtphone}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={12}
                      ></InputControl>
                    </div>
                    <div className="col-md-12 mb-20">
                      <TextAreaControl
                        lblClass="mb-0 lbl-req-field d-none"
                        name="txtmessage"
                        placeHolder={"Message"}
                        ctlType={formCtrlTypes.message}
                        required={true}
                        onChange={handleChange}
                        value={formData.txtmessage}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={13}
                        rows={6}
                      ></TextAreaControl>
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-primary w-100 btn-glow box-shadow rounded"
                        name="btnsendmessage"
                        id="btnsendmessage"
                        type="submit"
                      >
                        Send Message
                      </button>
                    </div>
                    <div
                      className="form-error text-left col-12 mt-15"
                      id="err-message"
                    ></div>
                  </div>
                </form>
              </div>
              {/* Property Search */}
              <PropertySearch />
              {/*============== Recent Property Widget Start ==============*/}
              <div className="widget widget_recent_property rounded box-shadow pb-20">
                <h6 className="text-secondary mb-4 down-line pb-10">
                  Recent Properties
                </h6>
                <ul>
                  {topAssetsList?.length > 0 && (
                    <>
                      {topAssetsList?.map((a, i) => {
                        return (
                          <li
                            className={`v-c enter ${
                              i == 0 ? "" : "border-top pt-4"
                            }`}
                            key={`tassets-key-${i}`}
                          >
                            <Link
                              onClick={(e) => onPropertyDetails(e, a.AssetId)}
                            >
                              <LazyImage
                                src={a.Images?.[0]?.ImagePath}
                                className="img-fit-grid"
                                placeHolderClass="min-h-80 w-80px"
                              />
                            </Link>
                            <div className="thumb-body w-100">
                              <h5 className="listing-title text-primary mb-0">
                                <Link
                                  onClick={(e) =>
                                    onPropertyDetails(e, a.AssetId)
                                  }
                                  className="text-primary font-general font-500"
                                >
                                  <i className="fas fa-map-marker-alt" />{" "}
                                  {a.AddressOne}
                                  {/* {checkEmptyVal(a.AddressTwo)
                                    ? ""
                                    : `, ${a.AddressTwo}`} */}
                                </Link>
                              </h5>
                              {/* <div className="listing-location mb-0 font-general">
                                {a.City}, {a.State}, {a.CountryShortName}
                              </div>
                              <div className="listing-price font-general mb-0 font-500">
                                {a.PriceDisplay}
                              </div> */}
                              <ul className="d-flex quantity font-general my-1 flex-sb">
                                <li className="flex-start pr-20 listing-location mb-1">
                                  {getCityStateCountryZipFormat(a)}
                                  {/* {a.City}, {a.State}, {a.CountryShortName} */}
                                </li>
                                <li className="flex-end listing-price font-15 font-500 mb-1">
                                  {a.PriceDisplay}
                                </li>
                              </ul>
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
                                  {a.AreaDisplay} {a.AreaUnitType}
                                </li>
                              </ul>
                            </div>
                          </li>
                        );
                      })}
                      <li className="flex-end m-0 p-0">
                        <Link
                          to={routeNames.properties.path}
                          className="btn-link font-small text-primary"
                        >
                          View more...
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {/*============== Recent Property Widget End ==============*/}
            </div>
            <div className="col-xl-8 order-xl-1">
              {isDataLoading && (
                <div className="property-overview border rounded bg-white p-30 mb-30  box-shadow">
                  <div className="row row-cols-1">
                    <div className="col">
                      <h5 className="mb-3">Property Details</h5>
                      <div className="min-h-150">
                        <DataLoader />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isDataLoading && checkObjNullorEmpty(assetDetails) && (
                <div className="property-overview border rounded bg-white p-30 mb-30  box-shadow">
                  <div className="row row-cols-1">
                    <div className="col">
                      <h5 className="mb-3">Property Details</h5>
                      <NoData
                        className="min-h-150 font-500"
                        message={AppMessages.NoPropertyDetails}
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isDataLoading && !checkObjNullorEmpty(assetDetails) && (
                <>
                  <div className="property-overview border summary rounded bg-white p-30 mb-30 box-shadow">
                    <div className="row">
                      <div className="col-md-12">
                        <div
                          id="single-property"
                          style={{
                            width: 1200,
                            height: 600,
                            margin: "0 auto 30px",
                          }}
                          className="shadow rounded"
                        >
                          {assetDetails.Images.map((i, idx) => {
                            return (
                              <div
                                className="ls-slide"
                                data-ls="duration:7500; transition2d:5; kenburnszoom:in; kenburnsscale:1.2;"
                                key={`pimg-key-${idx}`}
                              >
                                {" "}
                                <img
                                  width={1920}
                                  height={1280}
                                  src={i?.ImagePath}
                                  className="ls-bg"
                                  alt="Property Image"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-auto">
                        <div className="post-meta font-small text-uppercase list-color-primary">
                          <a href="#" className="listing-ctg">
                            <i className="fa-solid fa-building" />
                            <span>{assetDetails.AssetType}</span>
                          </a>
                        </div>
                        <h6 className="listing-title mt-10 mb-0 text-primary">
                          <i className="fas fa-map-marker-alt text-primary" />{" "}
                          {assetDetails.AddressOne}
                        </h6>
                        {!checkEmptyVal(assetDetails.AddressTwo) && (
                          <>
                            <span className="listing-location d-block pl-20">
                              {assetDetails.AddressTwo}
                            </span>
                          </>
                        )}
                        <span className="listing-location d-block pl-20">
                          {getCityStateCountryZipFormat(assetDetails)}
                          {/* {assetDetails.City}, {assetDetails.State},{" "}
                          {assetDetails.CountryShortName} */}
                        </span>
                      </div>
                      <div className="col-auto ms-auto xs-m-0 text-end xs-text-start pb-4">
                        <span className="listing-price">
                          {assetDetails.PriceDisplay}
                        </span>
                      </div>
                      <div className="col-12 px-2 mt-10">
                        <div className="mt-2">
                          <ul className="list-three-fold-width d-flex flex-se">
                            <li className="d-flex flex-start">
                              <span className="font-500">Property Type: </span>{" "}
                              {assetDetails.ClassificationType}
                            </li>
                            <li className="d-flex flex-center">
                              <span className="font-500">List Type: </span>{" "}
                              {assetDetails.ListingType}
                            </li>
                            <li className="d-flex flex-end">
                              <span className="font-500">Area: </span>{" "}
                              {assetDetails.AreaDisplay}{" "}
                              {assetDetails.AreaUnitType}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-12 px-2 mb-10">
                        <div className="mt-2">
                          <ul className="list-three-fold-width d-flex flex-se">
                            <li className="d-flex flex-start">
                              <span className="font-500">Noof Floors: </span>{" "}
                              {assetDetails.NoOfFloors}
                            </li>
                            <li className="d-flex flex-center">
                              <span className="font-500">Bedrooms: </span>{" "}
                              {assetDetails.Bedrooms}
                            </li>
                            <li className="d-flex flex-end">
                              <span className="font-500">Bathrooms: </span>{" "}
                              {assetDetails.Bathrooms}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row row-cols-1">
                      <div className="col">
                        <h5 className="mb-3">Description</h5>
                        <p>{assetDetails.Description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="property-overview border rounded bg-white p-30 mb-30 box-shadow">
                    <div className="row row-cols-1">
                      <div className="entry-wrapper">
                        {/* Location Map */}
                        <h6 className="mb-4 down-line pb-10">Geo Location</h6>
                        <p className="rounded">
                          <iframe
                            title="locationmap"
                            src={`https://www.google.com/maps?q=${
                              encodeURIComponent(assetDetails?.AddressOne) +
                              encodeURIComponent(
                                !checkEmptyVal(assetDetails?.AddressTwo)
                                  ? `, ${assetDetails.AddressTwo}`
                                  : ", "
                              ) +
                              encodeURIComponent(
                                getCityStateCountryZipFormat(assetDetails, true)
                              )
                            }
                            &output=embed`}
                            width="100%"
                            height="300"
                            style={{ border: "0" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="rounded"
                          ></iframe>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* <div className="property-overview border rounded bg-white p-30 mb-30 box-shadow">
                    <div className="row row-cols-1">
                      <div className="col">
                        <div id="comments" className="comments">
                          <div className="comment-head mb-4 gap-4 d-flex align-items-center">
                            <div className="comment-title">
                              <h3>10 User Reviews</h3>
                            </div>
                            <div className="user-rating">
                              <span className="d-inline-block py-2 font-mini text-warning">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star-half-alt" />
                              </span>
                              <span className="d-inline-block py-2">
                                (4.9 out of 5)
                              </span>
                            </div>
                          </div>
                          <div className="media">
                            <img
                              src="assets/images/user2.jpg"
                              className="me-3 rounded-circle"
                              alt="..."
                            />
                            <div className="media-body">
                              <div className="row d-flex align-items-center">
                                <h5 className="col-auto mb-0">Lee Sipes</h5>
                                <div className="col-auto">
                                  <span className="d-inline-block font-mini text-warning">
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                  </span>
                                  <span className="d-inline-block">
                                    (5 out of 5)
                                  </span>
                                </div>
                              </div>
                              <div className="comments-date mb-2">
                                <span>Posted On 21th May, 2019 - </span>
                                <a href="#">Replay</a>
                              </div>
                              <p>
                                Cras sit amet nibh libero, in gravida nulla.
                                Nulla vel metus scelerisque ante sollicitudin.
                                Cras purus odio, vestibulum in vulputate at,
                                tempus viverra turpis. Fusce condimentum nunc ac
                                nisi vulputate fringilla. Donec lacinia congue
                                felis in faucibus.
                              </p>
                              <div className="media mt-4">
                                <img
                                  src="assets/images/user4.jpg"
                                  className="me-3 rounded-circle"
                                  alt="..."
                                />
                                <div className="media-body">
                                  <div className="row d-flex align-items-center">
                                    <h5 className="col-auto mb-0">Lee Sipes</h5>
                                  </div>
                                  <div className="comments-date mb-2">
                                    <span>Posted On 10th June, 2019 - </span>
                                    <a href="#">Replay</a>
                                  </div>
                                  <p>
                                    Cras sit amet nibh libero, in gravida nulla.
                                    Nulla vel metus scelerisque ante
                                    sollicitudin. Cras purus odio, vestibulum in
                                    vulputate at, tempus viverra.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <hr />
                          <div className="media mt-4">
                            <img
                              src="assets/images/user3.jpg"
                              className="me-3 rounded-circle"
                              alt="..."
                            />
                            <div className="media-body">
                              <div className="row d-flex align-items-center">
                                <h5 className="col-auto mb-0">Lee Sipes</h5>
                                <div className="col-auto">
                                  <span className="d-inline-block font-mini text-warning">
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                  </span>
                                  <span className="d-inline-block">
                                    (5 out of 5)
                                  </span>
                                </div>
                              </div>
                              <div className="comments-date mb-2">
                                <span>Posted On 10th June, 2019 - </span>
                                <a href="#">Replay</a>
                              </div>
                              <p>
                                Cras sit amet nibh libero, in gravida nulla.
                                Nulla vel metus scelerisque ante sollicitudin.
                                Cras purus odio, vestibulum in vulputate at,
                                tempus viverra turpis.
                              </p>
                            </div>
                          </div>
                          <hr />
                          <div className="media mt-4">
                            <img
                              src="assets/images/user3.jpg"
                              className="me-3 rounded-circle"
                              alt="..."
                            />
                            <div className="media-body">
                              <div className="row d-flex align-items-center">
                                <h5 className="col-auto mb-0">Lee Sipes</h5>
                                <div className="col-auto">
                                  <span className="d-inline-block font-mini text-warning">
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                  </span>
                                  <span className="d-inline-block">
                                    (5 out of 5)
                                  </span>
                                </div>
                              </div>
                              <div className="comments-date mb-2">
                                <span>Posted On 10th June, 2019 - </span>
                                <a href="#">Replay</a>
                              </div>
                              <p>
                                Cras sit amet nibh libero, in gravida nulla.
                                Nulla vel metus scelerisque ante sollicitudin.
                                Cras purus odio, vestibulum in vulputate at,
                                tempus viverra turpis.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="property-overview border rounded bg-white p-30 mb-30 box-shadow">
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
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*============== Property Details End ==============*/}
    </div>
  );
};

export default Property;
