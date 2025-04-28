import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import { routeNames } from "../routes/routes";
import { Link, useNavigate } from "react-router-dom";
import {
  aesCtrEncrypt,
  apiReqResLoader,
  checkEmptyVal,
  getCityStateCountryZipFormat,
  SetPageLoaderNavLinks,
} from "../utils/common";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { useGetTopAgentsGateWay } from "../hooks/useGetTopAgentsGateWay";
import Rating from "../components/common/Rating";
import LazyImage from "../components/common/LazyImage";
import config from "../config.json";
import PropertySearch from "../components/layouts/PropertySearch";
import { API_ACTION_STATUS, ApiUrls, AppMessages } from "../utils/constants";
import { axiosPost } from "../helpers/axiosHelper";
import { DataLoader, NoData } from "../components/common/LazyComponents";

const Home = () => {
  let $ = window.$;

  const navigate = useNavigate();

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "./assets/js/",
      pos: "body",
      type: "js",
      files: ["layerslider.js", "owl.js"],
    },
  ];

  const propertyFilters = [
    {
      All: 0,
      House: 2,
      Office: 3,
      Apartment: 1,
      Townhome: 6,
      Condo: 7,
      Land: 8,
    },
  ];

  //const { topAssetsList } = useGetTopAssetsGateWay("recent", 8);
  const [topAssetsList, setTopAssetsList] = useState([]);
  const [isTopAssetsLoading, setIsTopAssetsLoading] = useState(true);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState(
    propertyFilters[0].All
  );
  const topAssetsRef = useRef(null);

  const { topAgentsList } = useGetTopAgentsGateWay("listed", 10);
  const topAgentsRef = useRef(null);

  const [testimonials, setTestimonials] = useState([]);
  const testimonialsRef = useRef(null);

  useLayoutEffect(() => {
    //load js/css depedency files.
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {
      getTopAssets();
      getTestimonials();
      loadSettings();
    });

    return () => {
      unloadFile(arrJsCssFiles); //unload files.
    };
  }, []);

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
  }, [topAssetsList]);

  useEffect(() => {
    if (topAgentsList.length > 0) {
      try {
        $(topAgentsRef.current)?.owlCarousel({
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
              items: 3,
            },
            992: {
              items: 3,
            },
            1200: {
              items: 4,
            },
            1400: {
              items: 5,
            },
          },
        });
      } catch {}
    }

    // Cleanup on unmount
    return () => {
      if ($(topAgentsRef.current).hasClass("owl-loaded")) {
        $(topAgentsRef.current).trigger("destroy.owl.carousel");
      }
    };
  }, [topAgentsList]);

  useEffect(() => {
    if (testimonials.length > 0) {
      setCarousel($(testimonialsRef.current), true);
    }

    // Cleanup on unmount
    return () => {
      if ($(testimonialsRef.current).hasClass("owl-loaded")) {
        $(testimonialsRef.current).trigger("destroy.owl.carousel");
      }
    };
  }, [testimonials]);

  //load all jquery dependencies.
  function loadSettings() {
    try {
      //Banner Slider
      $("#slider")?.layerSlider({
        sliderVersion: "6.0.0",
        type: "fullwidth",
        responsiveUnder: 0,
        maxRatio: 1,
        slideBGSize: "auto",
        hideUnder: 0,
        hideOver: 100000,
        skin: "outline",
        fitScreenWidth: true,
        //navButtons: false,
        navStartStop: false,
        navPrevNext: false,
        globalBGColor: "#53585f",
        fullSizeMode: "fitheight",
        thumbnailNavigation: "disabled",
        pauseOnHover: "enabled",
        height: 600,
        skinsPath: "assets/skins/",
      });
    } catch (e) {
      console.error(e.message);
    }
  }

  function setCarousel(elem, istestimonials = false) {
    try {
      elem?.owlCarousel({
        loop: false,
        margin: 24,
        nav: istestimonials ? false : true,
        dots: true,
        smartSpeed: 500,
        autoplay: false,
        responsive: {
          0: {
            items: 1,
          },
          576: {
            items: istestimonials ? 1 : 2,
          },
          992: {
            items: istestimonials ? 1 : 2,
          },
          1200: {
            items: istestimonials ? 1 : 3,
          },
          1400: {
            items: istestimonials ? 1 : 4,
          },
        },
      });
    } catch {}
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
            items: 2,
          },
          992: {
            items: 2,
          },
          1200: {
            items: 3,
          },
          1400: {
            items: 4,
          },
        },
      });
    } catch {}
  }

  const getTopAssets = (assetTypeId = 0, showLoader = false) => {
    setIsTopAssetsLoading(true);
    // if (showLoader) {
    //   apiReqResLoader("x");
    // }
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getTopAssets}`, {
      FeatureType: "recent",
      AssetTypeId: assetTypeId,
      Count: 12,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setTopAssetsList(objResponse?.Data);
          $(topAssetsRef.current).css("display", "block");
        } else {
          setTopAssetsList([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getTopAssets}, Error ::" ${err}`);
        setTopAssetsList([]);
      })
      .finally(() => {
        // if (showLoader) {
        //   apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        // }
        setIsTopAssetsLoading(false);
      });
  };

  const getTestimonials = () => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getTestimonials}`, {
      Status: 1,
      Pi: 0,
      Ps: 5,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setTestimonials(objResponse?.Data?.Testimonials);
        } else {
          setTestimonials([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getTestimonials}, Error ::" ${err}`);
        setTestimonials([]);
      })
      .finally(() => {});
  };

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    aesCtrEncrypt(assetId.toString()).then((encId) => {
      navigate(routeNames.property.path.replace(":id", encId));
    });
  };

  const onAgentDetails = (e, profileid) => {
    e.preventDefault();
    aesCtrEncrypt(profileid.toString()).then((encId) => {
      navigate(routeNames.agent.path.replace(":id", encId));
    });
  };

  const onAssetProfileDetails = (e, p) => {
    e.preventDefault();
    if (p.ListedByProfileTypeId == config.userProfileTypes.Agent) {
      aesCtrEncrypt(p.ListedByProfileId.toString()).then((encId) => {
        navigate(routeNames.agent.path.replace(":id", encId));
      });
    } else if (p.ListedByProfileTypeId == config.userProfileTypes.Owner) {
      aesCtrEncrypt(p.ListedByProfileId.toString()).then((encId) => {
        navigate(routeNames.owner.path.replace(":id", encId));
      });
    }
  };

  const onPropertyFilter = (e, assetTypeId) => {
    e.preventDefault();
    setSelectedPropertyFilter(assetTypeId);
    if ($(topAssetsRef.current).hasClass("owl-loaded")) {
      $(topAssetsRef.current).css("display", "none");
      $(topAssetsRef.current).trigger("destroy.owl.carousel");
      $(topAssetsRef.current).removeClass("owl-loaded owl-hidden");
      $(topAssetsRef.current).find(".owl-stage-outer").children().unwrap();
      $(topAssetsRef.current).removeData();
    }
    getTopAssets(assetTypeId, true);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Slider Area Start ==============*/}
      <div className="full-row p-0 overflow-hidden">
        <div
          id="slider"
          className="overflow-hidden"
          style={{
            width: 1200,
            height: 660,
            margin: "0 auto",
            marginBottom: 0,
          }}
        >
          {/* Slide 1*/}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-elc-payment.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
          {/* Slide 2 */}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-elc-agreement.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
          {/* Slide 3 */}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-bgv.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
        </div>
      </div>
      {/*============== Slider Area End ==============*/}

      {/*============== Property Search Form Start ==============*/}
      <PropertySearch></PropertySearch>
      {/*============== Property Search Form End ==============*/}

      {/*============== Recent Property Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row mb-4 align-items-center">
            <div className="col-md-8">
              <div className="me-auto">
                <h3 className="d-table mb-1 down-line pb-10">
                  Recent Properties
                </h3>
                <span className="d-table sub-ti tle text-primary sup">
                  Be the First to See Our Latest Properties!
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <Link
                to={routeNames.properties.path}
                className="ms-auto btn-link d-table p y-2 sm-mx-0 text-primary"
              >
                View All Properties{" "}
                <i className="fa-solid fa-chevron-right font-mini"></i>
              </Link>
            </div>
            <div className="col-md-12 pr-0">
              <div className="mix-tab">
                <ul className="nav-tab-border-active ms-auto d-table">
                  {propertyFilters?.map((f, i) => {
                    return Object.keys(f).map((key, i) => {
                      return (
                        <li
                          key={`rprop-key-${i}`}
                          className={`mixitup-control
                            ${
                              f[key] == selectedPropertyFilter
                                ? "mixitup-control-active shadow"
                                : ""
                            }
                          `}
                          onClick={(e) => onPropertyFilter(e, f[key])}
                        >
                          {key}
                        </li>
                      );
                    });
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col position-relative">
              {isTopAssetsLoading && (
                <div className="item min-h-300 d-flex flex-center">
                  <DataLoader />
                </div>
              )}
              {!isTopAssetsLoading &&
                (checkEmptyVal(topAssetsList) || topAssetsList.length == 0) && (
                  <div className="item min-h-300 d-flex flex-center">
                    <NoData
                      className="d-table sub-title text-primary"
                      pos="center"
                      message={AppMessages.NoProperties}
                    />
                  </div>
                )}
              {!isTopAssetsLoading &&
                !checkEmptyVal(topAssetsList) &&
                topAssetsList.length > 0 && (
                  <div
                    className="properties-carousel nav-disable owl-carousel position-static owl-loaded owl-drag min-h-400"
                    ref={topAssetsRef}
                  >
                    <>
                      {topAssetsList?.map((a, i) => {
                        return (
                          <div
                            className="item"
                            key={`rprop-key-${a.AssetId}`}
                            d-assetid={a.AssetId}
                          >
                            <div className="property-grid-1 property-block bg-light transation-this rounded">
                              <div className="overflow-hidden position-relative transation thumbnail-img hover-img-zoom box-shadow rounded">
                                <div className="catart position-absolute">
                                  <span className="sale bg-secondary text-white">
                                    For {a.ListingType}
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
                                    placeHolderClass="min-h-200"
                                  />
                                </Link>
                                <Link
                                  onClick={(e) =>
                                    onPropertyDetails(e, a.AssetId)
                                  }
                                  className="listing-ctg text-primary"
                                >
                                  <i className="fa-solid fa-building" />
                                  <span>{a.AssetType}</span>
                                </Link>
                                {/* <ul className="position-absolute quick-meta">
                                            <li>
                                              <a href="#" title="Add Favourite">
                                                <i className="flaticon-like-1 flat-mini" />
                                              </a>
                                            </li>
                                            <li className="md-mx-none">
                                              <a
                                                className="quick-view"
                                                href="#quick-view"
                                                title="Quick View"
                                              >
                                                <i className="flaticon-zoom-increasing-symbol flat-mini" />
                                              </a>
                                            </li>
                                          </ul> */}
                              </div>
                              <div className="property_text p-3 pb-0">
                                <h5 className="listing-title text-primary">
                                  <Link
                                    onClick={(e) =>
                                      onPropertyDetails(e, a.AssetId)
                                    }
                                    className="text-primary font-16"
                                  >
                                    <i className="fas fa-map-marker-alt" />{" "}
                                    {a.AddressOne}{" "}
                                    {/* {checkEmptyVal(a.AddressTwo)
                                                ? ""
                                                : `, ${a.AddressTwo}`} */}
                                  </Link>
                                </h5>
                                {/* <span className="listing-location mb-1">
                                            {a.City}, {a.State}, {a.CountryShortName}
                                          </span>
                                          <span className="listing-price font-15 font-500 mb-1">
                                            {a.PriceDisplay}
                                          </span> */}
                                <ul className="d-flex font-general mb-10 mt-10 flex-sb">
                                  <li className="flex-start pr-20 listing-location mb-1">
                                    {getCityStateCountryZipFormat(a)}
                                    {/* {a.City}, {a.State}, {a.CountryShortName} */}
                                  </li>
                                  <li className="flex-end listing-price font-15 font-500 mb-1">
                                    {a.PriceDisplay}
                                  </li>
                                </ul>
                                <ul className="d-flex quantity font-general mb-2 flex-sb">
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
                              <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top shadow">
                                <div className="agent">
                                  <a
                                    onClick={(e) => onAssetProfileDetails(e, a)}
                                    className="d-flex text-general align-items-center lh-18 font-general hovertxt-decnone"
                                  >
                                    <img
                                      className="rounded-circle me-1 shadow img-border-white"
                                      src={a.PicPath}
                                      alt={a.FirstName}
                                    />
                                    <span className="font-general">
                                      {a.FirstName} {a.LastName}
                                      <br />
                                      <span className="mt-1 small text-light">
                                        {a.ListedByProfileType}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                                <div className="post-date ms-auto font-small">
                                  <span>
                                    <i className="fa fa-clock text-primary me-1"></i>
                                    {a.PostedDaysDiff}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      {/*============== Recent Property End ==============*/}

      {/*============== Our Aminities Section Start ==============*/}
      <div className="full-row bg-light pt-5 pb-6">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3 className="main-title w-50 mx-auto mb-4 text-center w-sm-100 base-line">
                What are you looking for?
              </h3>
            </div>
          </div>
          <div className="row row-cols-xl-4 row-cols-sm-2 row-cols-1 gy-5">
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-home flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Living Houses
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    500+
                  </a>
                </h6>
                <Link
                  to={routeNames.properties.path}
                  className="btn-icon box-shadow"
                >
                  {" "}
                  <i className="icon fas fa-long-arrow-alt-right" />
                </Link>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-online-booking flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Apartments
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    200+
                  </a>
                </h6>
                <Link
                  to={routeNames.properties.path}
                  className="btn-icon box-shadow"
                >
                  {" "}
                  <i className="icon fas fa-long-arrow-alt-right" />
                </Link>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-shop flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Commercial
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    400+
                  </a>
                </h6>
                <Link
                  to={routeNames.properties.path}
                  className="btn-icon box-shadow"
                >
                  {" "}
                  <i className="icon fas fa-long-arrow-alt-right" />
                </Link>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-shop flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Office Space
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    300+
                  </a>
                </h6>
                <Link
                  to={routeNames.properties.path}
                  className="btn-icon box-shadow"
                >
                  {" "}
                  <i className="icon fas fa-long-arrow-alt-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Our Aminities Section End ==============*/}

      {/*============== Agents Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row mb-4 align-items-center">
            <div className="col-md-8">
              <div className="me-auto">
                <h3 className="d-table mb-4 down-line pb-10">
                  Our Listed Property Agents
                </h3>
                <span className="d-table sub-title text-primary">
                  Our listed property agetns.
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <Link
                to={routeNames.agents.path}
                className="ms-auto btn-link d-table p y-2 sm-mx-0 text-primary"
              >
                View All Agents{" "}
                <i className="fa-solid fa-chevron-right font-mini"></i>
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div
                className="properties-carousel nav-disable owl-carousel position-static owl-loaded owl-drag"
                ref={topAgentsRef}
              >
                {topAgentsList?.length > 0 && (
                  <>
                    {topAgentsList?.map((a, i) => {
                      return (
                        <div className="item" key={`ragent-key-${i}`}>
                          <div className="property-grid-1 property-block bg-light transation-this rounded">
                            <div className="overflow-hidden position-relative transation thumbnail-img box-shadow rounded">
                              <a
                                onClick={(e) => onAgentDetails(e, a.ProfileId)}
                              >
                                <LazyImage
                                  src={a.PicPath}
                                  alt={a.FirstName}
                                  className="img-fit-grid-contain"
                                  placeHolderClass="min-h-200"
                                />
                              </a>
                            </div>
                            <div className="property_text p-3 pb-2">
                              <h5 className="listing-title text-primary">
                                <a
                                  onClick={(e) =>
                                    onAgentDetails(e, a.ProfileId)
                                  }
                                  className="text-primary font-16"
                                >
                                  {a.FirstName} {a.LastName}
                                </a>
                              </h5>
                              <ul className="d-flex quantity font-general mb-2 flex-sb">
                                <li>
                                  <span className="font-general">
                                    At {a.ModifiedDateDisplay}
                                  </span>
                                </li>
                                <li>
                                  {" "}
                                  <span className="text-primary rating-icon mr-0">
                                    <Rating ratingVal={a.Rating}></Rating>
                                  </span>
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
            </div>
          </div>
        </div>
      </div>
      {/*============== Agents End ==============*/}

      {/*============== Counter Banner Start ==============*/}
      <div className="full-row bg-footer py-0 z-10 shadow">
        <div className="container pt-0">
          <div className="fact-counter position-relative z-index-9">
            <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1">
              <div className="col">
                <Link to={routeNames.properties.path}>
                  <div
                    className="my-20 text-center count wow fadeIn animate animated"
                    data-wow-duration="300ms"
                    style={{
                      visibility: "visible",
                      animationDuration: "300ms",
                      animationName: "fadeIn",
                    }}
                  >
                    <i
                      className="text-white fa fa-building flat-medium"
                      aria-hidden="true"
                    ></i>
                    <h6 className="text-white font-400 pt-2">Properties</h6>
                    <span
                      className="count-num text-primary h3"
                      data-speed={3000}
                      data-stop={310}
                    >
                      310
                    </span>
                  </div>
                </Link>
              </div>
              <div className="col">
                <div
                  className="my-20 text-center count wow fadeIn animate animated"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h6 className="text-white font-400 pt-2">Owners</h6>
                  <span
                    className="count-num text-primary h3"
                    data-speed={3000}
                    data-stop={200}
                  >
                    200
                  </span>
                </div>
              </div>
              <div className="col">
                <div
                  className="my-20 text-center count wow fadeIn animate animated"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h6 className="text-white font-400 pt-2">Agents</h6>
                  <span
                    className="count-num text-primary h3"
                    data-speed={3000}
                    data-stop={51}
                  >
                    51
                  </span>
                </div>
              </div>
              <div className="col">
                <div
                  className="my-20 text-center count wow fadeIn animate animated"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h6 className="text-white font-400 pt-2">Tenants</h6>
                  <span
                    className="count-num text-primary h3"
                    data-speed={3000}
                    data-stop={25}
                  >
                    25
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Counter Banner End ==============*/}

      {/*============== Partners Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb-5">
              <h3 className="mb-4 text-center text-primary w-50 w-sm-100 mx-auto down-line pb-10">
                Partners
              </h3>
              <span className="text-secondary w-75 d-table text-center w-sm-100 mx-auto pb-4">
                Our platform integrates seamlessly with best-in-class
                third-party providers to streamline your operations. From secure
                payments and storage to background checks and cloud file
                management — we’ve got you covered.
              </span>
            </div>
          </div>
          <div className="row row-cols-lg-2 row-cols-md-2 row-cols-1">
            <div className="col mb-5">
              <div className="thumb-modern-border p-4 h-100 rounded box-shadow">
                <i className="flaticon-database-storage flat-medium text-white bg-primary d-table rounded shadow"></i>
                <h5 className="my-3">
                  <span className="text-primary">Secure Data Storage</span>
                </h5>
                <p>
                  Your data is securely stored in the Amazon Web Services (AWS)
                  cloud, with regular automated backups, real-time redundancy,
                  and end-to-end encryption. AWS’s robust infrastructure ensures
                  reliability, compliance, and protection against data loss or
                  breaches.
                </p>
                <a className="d-flex flex-center py-10 hover-img-upshow overflow-hidden pe-2">
                  <LazyImage
                    src="./assets/images/aws_logo.png"
                    className="w-80px"
                  ></LazyImage>
                </a>
              </div>
            </div>
            <div className="col mb-5">
              <div className="thumb-modern-border p-4 h-100 rounded box-shadow">
                <i className="flaticon-folder flat-medium text-white bg-primary d-table rounded shadow"></i>
                <h5 className="my-3">
                  <span className="text-primary">Cloud File Management</span>
                </h5>
                <p>
                  Our built-in integration with Google Cloud enables you to
                  securely store, access, and share files directly from your
                  dashboard — without switching between platforms. Whether it's
                  important documents, forms, meeting minutes, or reports,
                  everything stays organized and accessible in one centralized
                  location.
                </p>
                <a className="d-flex flex-center py-10 hover-img-upshow overflow-hidden pe-2">
                  <LazyImage
                    src="./assets/images/gcp_logo.png"
                    className="w-200px"
                  ></LazyImage>
                </a>
              </div>
            </div>
            <div className="col mb-2">
              <div className="thumb-modern-border p-4 h-100 rounded box-shadow">
                <i className="flaticon-bank flat-medium text-white bg-primary d-table rounded shadow"></i>
                <h5 className="my-3">
                  <span className="text-primary">Online Payments</span>
                </h5>
                <p>
                  Our integration with Usio allows you to accept and process
                  online payments directly within the platform — without needing
                  to set up a separate merchant account or deal with complex
                  onboarding processes. Usio’s secure and PCI-compliant
                  infrastructure ensures that all transactions are encrypted and
                  handled safely.
                </p>
                <a className="d-flex flex-center py-10 hover-img-upshow overflow-hidden pe-2">
                  <LazyImage
                    src="./assets/images/usio_logo.png"
                    className="w-150px"
                  ></LazyImage>
                </a>
              </div>
            </div>
            <div className="col mb-2">
              <div className="thumb-modern-border p-4 h-100 rounded box-shadow">
                <i className="fa-solid fa-user-check flat-medium text-white bg-primary d-table rounded shadow"></i>
                <h5 className="my-3">
                  <span className="text-primary">Background Screening</span>
                </h5>
                <p>
                  USAFact’s powerful background screening services are
                  seamlessly integrated into our platform, enabling you to
                  initiate and manage background checks in just a few clicks.
                  USAFact offers comprehensive reports covering criminal
                  records, employment history, identity verification, and more.
                </p>
                <a className="d-flex flex-center py-10 hover-img-upshow overflow-hidden pe-2">
                  <LazyImage
                    src="./assets/images/usafact_logo.png"
                    className="w-150px"
                  ></LazyImage>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Partners End ==============*/}

      {/*============== Testimonials Start ==============*/}
      {testimonials?.length > 0 && (
        <div className="full-row bg-light pt-5 pb-5">
          <div className="container-fluid">
            <div className="row">
              <div className="col mb-3">
                <h3 className="mb-3 text-center text-primary w-50 w-sm-100 mx-auto">
                  Testimonials
                </h3>
                <h4 className="down-line pb-15 w-50 mx-auto mb-3 text-center w-sm-100">
                  What Client Says About Us
                </h4>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="testimonial-simple text-center px-5">
                  <div
                    className="testimonial-carousel owl-carousel dots-mt-10"
                    ref={testimonialsRef}
                  >
                    {testimonials?.map((t, i) => {
                      return (
                        <div className="item" key={`testi-key-${i}`}>
                          <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                          <blockquote className="text-secondary fs-4 fst-italic pb-3">
                            “{t.Testimonial}“
                          </blockquote>
                          <h6 className="mt-2 text-primary font-large font-500 mb-0">
                            {t.Name}
                          </h6>
                          {!checkEmptyVal(t.Occupation) && (
                            <span className="text-light font-300">
                              {t.Occupation}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/*============== Testimonials End ==============*/}
    </>
  );
};

export default Home;
