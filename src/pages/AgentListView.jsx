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
import { GridList, LazyImage } from "../components/common/LazyComponents";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { useGetTopAgentsGateWay } from "../hooks/useGetTopAgentsGateWay";
import Rating from "../components/common/Rating";
import {
  addSessionStorageItem,
  getsessionStorageItem,
} from "../helpers/sessionStorageHelper";
import PropertySearch from "../components/layouts/PropertySearch";

const AgentsListView = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const [rerouteKey, setRerouteKey] = useState(0);

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 5);
  const topAssetsRef = useRef(null);

  const { topAgentsList } = useGetTopAgentsGateWay("rating", 4);

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

  //set carousel
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

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Agents List"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Agent List Section Start ==============*/}
      <div className="full-row">
        <div className="container">
          <div className="row">
            <div className="col-xl-4">
              <div className="agent-sidebar">
                {/*============== Agent Search Widget Start ==============*/}
                <div className="widget agent-search">
                  <h5 className="mb-30">Agent Search</h5>
                  <form
                    action="#"
                    method="POST"
                    className="quick-search form-icon-right"
                  >
                    <div className="row row-cols-1 g-3">
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          name="search"
                          placeholder="Keywords"
                        />
                      </div>
                      <div className="col">
                        <select name="agent-type">
                          <option>Agent Type</option>
                          <option>Independent</option>
                          <option>Company Base</option>
                          <option>Agency</option>
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
                        <select name="agent-level">
                          <option>Agent Level</option>
                          <option>1st</option>
                          <option>2nd</option>
                          <option>3rd</option>
                        </select>
                      </div>
                      <div className="col">
                        <select name="category">
                          <option>Spacific Category</option>
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
                        <button className="btn btn-primary w-100">
                          Search
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                {/*============== Agent Search Widget End ==============*/}

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
            </div>
            <div className="col-xl-8">
              <div className="row">
                <div className="col">
                  <div className="woo-filter-bar p-3 d-flex flex-wrap justify-content-between">
                    <div className="d-flex flex-wrap">
                      <form className="woocommerce-ordering" method="get">
                        <select name="orderby2">
                          <option>Default</option>
                          <option>Most Popular</option>
                          <option>Top Rated</option>
                          <option>Newest Items</option>
                          <option>Price low to high</option>
                          <option>Price hight to low</option>
                        </select>
                      </form>
                    </div>
                    <div className="d-flex">
                      <span className="woocommerce-ordering-pages me-4 font-fifteen">
                        Showing at 15 result
                      </span>
                      <form className="view-category" method="get">
                        <button
                          title="List"
                          className="list-view"
                          value="list"
                          name="display"
                          type="submit"
                        >
                          <i className="flaticon-grid-1 flat-mini" />
                        </button>
                        <button
                          title="Grid"
                          className="grid-view active"
                          value="grid"
                          name="display"
                          type="submit"
                        >
                          <i className="flaticon-grid flat-mini" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row row-cols-1 agent-style-1 g-4 list-view">
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="" alt="" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Luann McLawhorn</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/2.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Melvin Dawson</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/3.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Guadalupe Allen</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="" alt="" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Lyle Echevarria</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/5.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Kyle Brown</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/6.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Charles Constantine</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/7.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Lawrence Spencer</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/8.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">George Campbell</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <img src="assets/images/team/9.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Michael Clinton</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Agent thumb */}
                <div className="col">
                  <div className="entry-wrapper bg-white transation-this hover-shadow">
                    <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                      <div className="agent-level">
                        <span title="Agenet level">Top Agent</span>
                      </div>
                      <img src="assets/images/team/10.jpg" alt="Agent Photo" />
                    </div>
                    <div className="entry-content-wrapper">
                      <div className="entry-header d-flex pb-2">
                        <div className="me-auto">
                          <h6 className="agent-name text-dark mb-0">
                            <a href="#">Cody Ramos</a>
                          </h6>
                          <span className="text-primary font-fifteen">
                            From 1st April, 2012
                          </span>
                        </div>
                      </div>
                      <div className="enrey-content">
                        <ul className="agent-contact py-1">
                          <li>
                            <span>Mobile:</span>891 456 9874
                          </li>
                          <li>
                            <span>Email:</span>pakulla@findhouse.com
                          </li>
                          <li>
                            <span>Website:</span>
                            <a href="#">www.websitename.com</a>
                          </li>
                        </ul>
                      </div>
                      <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                        <div className="customer-review d-flex">
                          <div className="agent-rating d-flex text-dark">
                            <span title="Feedback Score">4.90 / 5</span>
                            <div className="rating-star">
                              <span style={{ width: "90%" }} />
                            </div>
                          </div>
                          <span className="review-number">( 237 Review )</span>
                        </div>
                        <div className="post-date ms-auto">
                          <span>27 Listed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                {/* Pagination */}
                <div className="col mt-5">
                  <nav aria-label="Page navigation example">
                    <ul className="pagination pagination-dotted-active justify-content-center">
                      <li className="page-item disabled">
                        <a
                          className="page-link"
                          href="#"
                          tabIndex={-1}
                          aria-disabled="true"
                        >
                          Previous Page
                        </a>
                      </li>
                      <li className="page-item active">
                        <a className="page-link" href="#">
                          1
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          2
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          3
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          Next Page
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Agent List Section End ==============*/}
    </>
  );
};
export default AgentsListView;
