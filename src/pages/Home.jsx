import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import { routeNames } from "../routes/routes";
import { Link, useNavigate } from "react-router-dom";
import { SetPageLoaderNavLinks } from "../utils/common";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { useGetTopAgentsGateWay } from "../hooks/useGetTopAgentsGateWay";
import Rating from "../components/common/Rating";
import LazyImage from "../components/common/LazyImage";
import { SessionStorageKeys } from "../utils/constants";
import { addSessionStorageItem } from "../helpers/sessionStorageHelper";
import PropertySearch from "../components/layouts/PropertySearch";

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

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 8);
  const topAssetsRef = useRef(null);

  const { topAgentsList } = useGetTopAgentsGateWay("recent", 10);
  const topAgentsRef = useRef(null);

  useLayoutEffect(() => {
    //load js/css depedency files.
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {
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

      // Testimonials carousel
      if ($(".testimonial-carousel").length) {
        $(".testimonial-carousel")?.owlCarousel({
          loop: true,
          margin: 30,
          nav: false,
          dots: true,
          smartSpeed: 500,
          autoplay: true,
          responsive: {
            0: {
              items: 1,
            },
            480: {
              items: 1,
            },
            600: {
              items: 1,
            },
            800: {
              items: 1,
            },
            1200: {
              items: 1,
            },
          },
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  }

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

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    addSessionStorageItem(SessionStorageKeys.AssetDetailsId, assetId);
    navigate(routeNames.propertyDetails.path);
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
      {/* <div className="full-row p-0" style={{ marginTop: "0px", zIndex: 99 }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col px-0">
              <form
                className="bg-light shadow-sm quick-search py-4 px-5 form-icon-right position-relative"
                action="#"
                method="post"
              >
                <div className="row row-cols-lg-6 row-cols-md-3 row-cols-1 g-3">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      name="keyword"
                      placeholder="Enter Keyword..."
                    />
                  </div>
                  <div className="col">
                    <select className="form-control">
                      <option>Property Types</option>
                      <option>House</option>
                      <option>Office</option>
                      <option>Appartment</option>
                      <option>Condos</option>
                      <option>Villa</option>
                      <option>Small Family</option>
                      <option>Single Room</option>
                    </select>
                  </div>
                  <div className="col">
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        placeholder="Location"
                      />
                      <i className="flaticon-placeholder flat-mini icon-font y-center text-dark" />
                    </div>
                  </div>
                  <div className="col">
                    <div className="position-relative">
                      <button
                        className="form-control price-toggle toggle-btn"
                        data-target="#data-range-price"
                      >
                        Price{" "}
                        <i className="fas fa-angle-down font-mini icon-font y-center text-dark" />
                      </button>
                      <div
                        id="data-range-price"
                        className="price_range price-range-toggle"
                      >
                        <div className="area-filter price-filter">
                          <span className="price-slider">
                            <input
                              className="filter_price"
                              type="text"
                              name="price"
                              defaultValue="0;10000"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <Link
                      to={routeNames.properties.path}
                      className="btn btn-primary btn-mini w-100 btn-glow shadow rounded"
                    >
                      Search
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div> */}
      {/*============== Property Search Form End ==============*/}

      {/*============== Recent Property Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row mb-4 align-items-center">
            <div className="col-md-8">
              <div className="me-auto">
                <h2 className="d-table mb-4 down-line">Recent Properties</h2>
                <span className="d-table sub-title text-primary">
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
          </div>
          <div className="row">
            <div className="col position-relative">
              <div
                className="properties-carousel nav-disable owl-carousel position-static owl-loaded owl-drag"
                ref={topAssetsRef}
              >
                {topAssetsList?.length > 0 && (
                  <>
                    {topAssetsList?.map((a, i) => {
                      return (
                        <div
                          className="item"
                          key={`rprop-key-${i}`}
                          d-assetid={a.AssetId}
                        >
                          <div className="property-grid-1 property-block bg-light transation-this rounded">
                            <div className="overflow-hidden position-relative transation thumbnail-img hover-img-zoom box-shadow rounded">
                              <div className="catart position-absolute">
                                <span className="sale bg-secondary text-white">
                                  For {a.ContractType}
                                </span>
                              </div>
                              <Link
                                onClick={(e) => onPropertyDetails(e, a.AssetId)}
                              >
                                <LazyImage
                                  src={a.Images?.[0]?.ImagePath}
                                  className="img-fit-grid"
                                  placeHolderClass="min-h-200"
                                />
                              </Link>
                              <Link
                                onClick={(e) => onPropertyDetails(e, a.AssetId)}
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
                              <h5 className="listing-title">
                                <Link
                                  to={routeNames.propertyDetails.path}
                                  className="text-primary font-16"
                                >
                                  {a.Title}
                                </Link>
                              </h5>
                              <span className="listing-location mb-1">
                                <i className="fas fa-map-marker-alt" />{" "}
                                {a.AddressOne}
                              </span>
                              <span className="listing-price font-16 font-600 mb-1">
                                {a.PriceDisplay}
                              </span>
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
                                  {a.SqfeetDisplay} Sqft
                                </li>
                              </ul>
                            </div>
                            <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top shadow">
                              <div className="agent">
                                <a
                                  href="#"
                                  className="d-flex text-general align-items-center"
                                >
                                  <img
                                    className="rounded-circle me-2 shadow img-border-white"
                                    src={a.PicPath}
                                    alt={a.FirstName}
                                  />
                                  <span className="font-general">
                                    {a.FirstName} {a.LastName}
                                  </span>
                                </a>
                              </div>
                              <div className="post-date ms-auto font-general">
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
                )}
              </div>
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
              <h1 className="main-title w-50 mx-auto mb-4 text-center w-sm-100 base-line">
                What are you looking for?
              </h1>
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
                <h2 className="d-table mb-4 down-line">
                  Our Listed Property Agents
                </h2>
                <span className="d-table sub-title text-primary">
                  Our listed property agetns.
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <a
                href="#"
                className="ms-auto btn-link d-table p y-2 sm-mx-0 text-primary"
              >
                View All Agents{" "}
                <i className="fa-solid fa-chevron-right font-mini"></i>
              </a>
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
                              <a href="property-single-v1.html">
                                <LazyImage
                                  src={a.PicPath}
                                  alt={a.FirstName}
                                  className="img-fit-grid-contain"
                                  placeHolderClass="min-h-200"
                                />
                              </a>
                            </div>
                            <div className="property_text p-3 pb-2">
                              <h5 className="listing-title">
                                <a
                                  href="property-single-v1.html"
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

      {/*============== Testimonials Start ==============*/}
      <div className="full-row bg-light pt-5 pb-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col mb-3">
              <span className="text-primary tagline pb-2 d-table m-auto">
                Testimonials
              </span>
              <h2 className="down-line w-50 mx-auto mb-4 text-center w-sm-100">
                What Client Says About Us
              </h2>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="testimonial-simple text-center px-5">
                <div className="testimonial-carousel owl-carousel">
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ Assetswatch saves time in processing rental payments and
                      I'm always sure that the rent is paid every month.I love
                      the "split the rent option" so I'm going to sign up my
                      roommates too. ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Mark Wiggins</h4>
                    <span className="text-primary font-fifteen">
                      CEO ( AssetsWatch )
                    </span>
                  </div>
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ I must say that I've been looking for such program for
                      long. Only one rental application! That's just perfect, no
                      need to refill it each time you move. ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Kiran</h4>
                    <span className="text-primary font-fifteen">
                      MANAGER ( Kansolve Technologies )
                    </span>
                  </div>
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ Assetswatch saves time in processing rental payments and
                      I'm always sure that the rent is paid every month.I love
                      the "split the rent option" so I'm going to sign up my
                      roommates too! ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Manoj</h4>
                    <span className="text-primary font-fifteen">
                      CTO ( Eyegate Parking Solutions )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Testimonials End ==============*/}
    </>
  );
};

export default Home;
