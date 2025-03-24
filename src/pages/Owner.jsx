import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import {
  aesCtrDecrypt,
  aesCtrEncrypt,
  checkEmptyVal,
  checkObjNullorEmpty,
  isInt,
} from "../utils/common";
import { ApiUrls } from "../utils/constants";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LazyImage } from "../components/common/LazyComponents";
import Rating from "../components/common/Rating";
import { useGetTopAgentsGateWay } from "../hooks/useGetTopAgentsGateWay";

const Owner = () => {
  let $ = window.$;

  const navigate = useNavigate();
  const [rerouteKey, setRerouteKey] = useState(0);

  const { id } = useParams();

  let ownerId = 0; // parseInt(isInt(Number(id)) ? id : 0);

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 5);
  const topAssetsRef = useRef(null);

  const { topAgentsList } = useGetTopAgentsGateWay("rating", 4);

  const [ownerDetails, setOwnerDetails] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

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

  useEffect(() => {
    aesCtrDecrypt(id).then((decId) => {
      ownerId = decId.toString().substring(0, decId.toString().indexOf(":"));

      if (ownerId == 0) {
        navigate(routeNames.home.path);
      } else {
        getOwnerDetails();
      }
    });
  }, [rerouteKey]);

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

  //Get owner details
  const getOwnerDetails = () => {
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {
      ProfileId: ownerId,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (checkObjNullorEmpty(objResponse.Data)) {
            navigate(routeNames.home.path);
          } else {
            setOwnerDetails(objResponse.Data);
          }
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
          setOwnerDetails(null);
          navigate(routeNames.home.path);
        }
        setIsDataLoading(false);
      });
  };

  const onownerDetails = (e, profileId) => {
    e.preventDefault();
    setRerouteKey(rerouteKey + 1);
    aesCtrEncrypt(profileId.toString()).then((encId) => {
      navigate(routeNames.agent.path.replace(":id", encId));
    });
    window.scrollTo(0, 0);
  };

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    setRerouteKey(rerouteKey + 1);
    aesCtrEncrypt(assetId.toString()).then((encId) => {
      navigate(routeNames.property.path.replace(":id", encId));
    });
  };

  return (
    <div key={rerouteKey}>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Owner Details"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Property Details Start ==============*/}
      <div className="full-row pt-30 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 agent-style-1 list-view agent-details">
              {!isDataLoading && (
                <div className="entry-wrapper bg-white transation-this hover-shadow mb-4 box-shadow rounded">
                  <div className="entry-thumbnail-wrapper transation hover-img-zoom p-20 shadow rounded border bg-primary div-agdetails-img">
                    <LazyImage
                      className="rounded-circle mr-10 shadow img-border-white"
                      src={ownerDetails?.PicPath}
                      alt={
                        ownerDetails?.FirstName + " " + ownerDetails?.LastName
                      }
                      placeHolderClass="pos-absolute w-150px min-h-150 fl-l"
                    ></LazyImage>
                  </div>

                  <div className="entry-content-wrapper col-9 pb-10">
                    <div className="entry-header d-flex flex-sb pb-2">
                      <div className="me-auto">
                        <h6 className="agent-name  text-primary mb-0">
                          {ownerDetails?.FirstName} {ownerDetails?.LastName}
                        </h6>
                        <span className="text-primary font-fifteen">
                          {ownerDetails?.CompanyName}
                        </span>
                      </div>
                      <div className="entry-meta text-right">
                        {/* <span title="Feedback Score">
                            {ownerDetails?.Rating} / 5
                          </span> */}
                        <div className="text-primary rating-icon mr-0">
                          <Rating ratingVal={ownerDetails?.Rating}></Rating>
                        </div>
                        <div className="text-primary font-fifteen">
                          From {ownerDetails?.ModifiedDateDisplay}
                        </div>
                      </div>
                    </div>
                    <div className="enrey-content pb-10 pt-10">
                      {/* <p>{ownerDetails?.AboutUs}</p> */}
                      <ul className="row pb-20">
                        <li className="col-xl-4 col-md-6">
                          <span className="font-500">Mobile: </span>
                          {"  "}
                          {ownerDetails?.MobileNo}
                        </li>
                        <li className="col-xl-4 col-md-6 text-lg-end text-xl-center">
                          {checkEmptyVal(ownerDetails?.LandLineNo) ? (
                            ""
                          ) : (
                            <>
                              <span className="font-500">Office: </span>
                              {ownerDetails?.LandLineNo}
                            </>
                          )}
                        </li>
                        <li className="col-xl-4 col-md-6 text-xl-end">
                          <span className="font-500">Email: </span>
                          {"  "}
                          {ownerDetails?.Email}
                        </li>
                      </ul>
                      <ul className="row">
                        <li className="col-xl-7 col-md-12">
                          <span className="font-500">Address: </span>
                          {"  "}
                          {ownerDetails?.AddressOne}, {ownerDetails?.City},{" "}
                          {ownerDetails?.State}, {ownerDetails?.Country}.
                        </li>
                        <li className="col-xl-5 col-md-12 text-xl-end">
                          <span className="font-500">Website: </span>
                          {"  "}
                          {checkEmptyVal(ownerDetails?.Website)
                            ? "--"
                            : ownerDetails?.Website}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 order-xl-2">
              {/* Message Form */}
              <div className="widget widget_send_message mb-30 box-shadow rounded">
                <h6 className="mb-4 text-primary">
                  {!isDataLoading &&
                    ownerDetails?.FirstName + " " + ownerDetails.LastName}
                </h6>
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
              <div className="widget widget_recent_property rounded box-shadow pb-20">
                <h5 className="text-secondary mb-4 down-line pb-10">
                  Recent Properties
                </h5>
                <ul>
                  {topAssetsList?.length > 0 && (
                    <>
                      {topAssetsList?.map((a, i) => {
                        return (
                          <li
                            className={`v-center ${
                              i == 0 ? "" : "border-top pt-3"
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
                            <div className="thumb-body">
                              <h5 className="listing-title mb-0">
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
                                  {a.City}, {a.State}, {a.CountryShortName}
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
              {/*============== Agents Widget Start ==============*/}
              <div className="widget widget_recent_property box-shadow rounded pb-20">
                <h5 className="text-secondary mb-4 down-line pb-10">
                  Listed Agents
                </h5>
                <ul>
                  {topAgentsList?.length > 0 && (
                    <>
                      {topAgentsList?.map((a, i) => {
                        return (
                          <li
                            className={`${i == 0 ? "" : "border-top pt-3"}`}
                            key={`tagents-key-${i}`}
                          >
                            <LazyImage
                              src={a.PicPath}
                              alt={a.FirstName}
                              className="img-fit-grid cur-pointer rounded-circle shadow img-border-white"
                              placeHolderClass="min-h-80 w-80px"
                              onClick={(e) => onownerDetails(e, a.ProfileId)}
                            />
                            <div className="thumb-body">
                              <h5 className="listing-title">
                                <a
                                  onClick={(e) =>
                                    onownerDetails(e, a.ProfileId)
                                  }
                                  className="text-primary font-16 font-500"
                                >
                                  {a.FirstName} {a.LastName}
                                </a>
                              </h5>
                              <span className="font-general">
                                At {a.ModifiedDateDisplay}
                              </span>
                              <ul className="d-flex quantity font-small">
                                <span className="text-primary rating-icon mr-0">
                                  <Rating ratingVal={a.Rating}></Rating>
                                </span>
                              </ul>
                            </div>
                          </li>
                        );
                      })}
                      <li className="flex-end m-0 p-0">
                        <Link
                          to={routeNames.agents.path}
                          className="btn-link font-small text-primary"
                        >
                          View more...
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {/*============== Agents Property Widget End ==============*/}
            </div>
            <div className="col-xl-8 order-xl-1">
              <div className="entry-wrapper">
                {/* Owner Overview */}
                <div className="agent-overview p-30 bg-white mb-50 border px-0 box-shadow rounded">
                  <h6 className="mb-4 text-primary">Overview</h6>
                  <p> {!isDataLoading && ownerDetails?.AboutUs}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Property Details End ==============*/}
    </div>
  );
};

export default Owner;
