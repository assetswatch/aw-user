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

const AgentDetails = () => {
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
    <div key={rerouteKey}>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Agent Details"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Agent Details Start ==============*/}
      <div className="full-row">
        <div className="container">
          <div className="row">
            <div className="col-12 agent-style-1 list-view agent-details">
              <div className="entry-wrapper bg-white transation-this hover-shadow mb-4">
                <div className="entry-thumbnail-wrapper transation bg-secondary hover-img-zoom">
                  <img src="assets/images/team/1.jpg" alt="Agent Photo" />
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
                    <p>
                      Lorem ipsum dolor sit amet, consec tetur cing elit. Suspe
                      ndisse suscorem ipsum dolor sit ametcipsum dolor sit t,
                      consec tetur atetur cing elit. Suspe ndisse susco rem
                      ipsum dolor sit ametcipsum doloamet.
                    </p>
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
                      <li>
                        <span>Language:</span>English, French, Spanish
                      </li>
                    </ul>
                  </div>
                  <div className="entry-footer d-flex align-items-center post-meta py-2 border-top">
                    <div className="customer-review d-flex ms-auto">
                      <div className="agent-rating d-flex text-dark">
                        <span title="Feedback Score">4.90 / 5</span>
                        <div className="rating-star">
                          <span style={{ width: "90%" }} />
                        </div>
                      </div>
                      <span className="review-number">( 237 Review )</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 order-xl-2">
              {/* Message Form */}
              <div className="widget widget_send_message mb-30 shadow">
                <h5 className="mb-4">Luann McLawhorn</h5>
                <form
                  className="quick-search form-icon-right"
                  action="#"
                  method="post"
                >
                  <div className="form-row">
                    <div className="col-12 mb-10">
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="col-12 mb-10">
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="col-12 mb-10">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Your Email"
                      />
                    </div>
                    <div className="col-12 mb-10">
                      <textarea
                        className="form-control"
                        name="message"
                        placeholder="Message"
                        rows={10}
                        defaultValue={""}
                      />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary w-100">
                        Send Message
                      </button>
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
              <div className="entry-wrapper">
                {/* Agent Overview */}
                <div className="agent-overview p-30 bg-white mb-50 shadow">
                  <h4 className="mb-4">Agent Overview</h4>
                  <p>
                    Maecenas egestas quam et volutpat bibendum metus vulputate
                    platea eleifend sed Integer dictum ultricies consectetuer
                    nunc vivamus a. Eu mus justo magna lacinia purus sodales
                    scelerisque. Sociosqu pede facilisi. Sociis pretium gravida
                    auctor mus amet accumsan adipiscing id dignissim, potenti.
                    Curae; massa ridiculus lobortis consectetuer condimentum
                    mollis vulputate hymenaeos tellus egestas auctor dictumst
                    imperdiet curae; quisque ut porta molestie dui duis blandit
                    molestie etiam enim erat sociis lacinia litora phasellus
                    sit. Ipsum Lacinia class enim pharetra interdum potenti
                    tellus parturient. Potenti scelerisque erat facilisi mauris
                    tortor, mattis euismod augue nascetur rutrum augue ipsum
                    tortor cum Porta primis.
                  </p>
                  <p>
                    Praesent lectus facilisi tempor ridiculus arcu pharetra non
                    tellus. Torquent nisl tempor. Magnis mollis lobortis nam,
                    montes ut, consequat sed amet nullam, malesuada nascetur
                    ornare sociosqu magna cum gravida quam tincidunt dapibus
                    tellus felis nibh inceptos netus convallis facilisis
                    torquent. Laoreet pulvinar ut. Fringilla lacus tellus lectus
                    erat hac conubia eget quisque nisi aliquam nibh molestie
                    nisi hymenaeos id phasellus metus duis inceptos arcu
                    hendrerit ligula blandit lectus nisl fermentum sociosqu
                    pretium eros libero.
                  </p>
                </div>

                {/* Comments Form */}
                <div className="comments-block bg-white p-30 mt-4 shadow">
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
      {/*============== Agent Details End ==============*/}
    </div>
  );
};
export default AgentDetails;
