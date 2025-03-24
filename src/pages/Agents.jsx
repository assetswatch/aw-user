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
import { aesCtrEncrypt, apiReqResLoader, checkEmptyVal } from "../utils/common";
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

const Agents = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const location = useLocation();
  let showLoader = location?.state?.["search"];
  delete location?.state?.["search"];

  const [rerouteKey, setRerouteKey] = useState(0);

  let arrJsCssFiles = [
    {
      dir: "./assets/js/",
      pos: "body",
      type: "js",
      files: ["owl.js"],
    },
  ];

  useEffect(() => {
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {});

    return () => {
      unloadFile(arrJsCssFiles);
    };
  }, []);

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

  const [agentsList, setAgentsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const getAgents = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    showPageLoader = false,
  }) => {
    if (showPageLoader) {
      apiReqResLoader("x");
    }
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {};
    let propfilters = JSON.parse(
      getsessionStorageItem(SessionStorageKeys.ObjAssetfilters, "{}")
    );

    objParams = {
      keyword: "",
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getAgents}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTotalCount(objResponse.Data.TotalCount);
          setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
          setAgentsList(objResponse.Data.Agents);
        } else {
          isapimethoderr = true;
          setAgentsList([]);
          setPageCount(0);
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        setAgentsList([]);
        setPageCount(0);
        console.error(`"API :: ${ApiUrls.getAgents}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr === true) {
        }
        if (showPageLoader) {
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        }
        setIsDataLoading(false);
      });
  };

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Agent",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <div
              className="item"
              key={`user-key-${row.id}`}
              d-profileid={row.original.ProfileId}
            >
              <div className="property-grid-1 property-block box-shadow transation-this rounded">
                <div className="overflow-hidden position-relative transation thumbnail-img box-sh adow ro unded py-10">
                  <div className="nav-between-in">
                    <div className="item flex flex-center">
                      <Link
                        onClick={(e) =>
                          onAgentDetails(e, row.original.ProfileId)
                        }
                      >
                        <LazyImage
                          src={row.original.PicPath}
                          className="img-fit-grid-contain min-h-150"
                          placeHolderClass="min-h-150"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="property_text p-10 pb-0 border-top shadow rounded">
                  <h5 className="listing-title">
                    <Link
                      onClick={(e) => onAgentDetails(e, row.original.ProfileId)}
                      className="text-primary font-16"
                    >
                      {row.original.FirstName} {row.original.LastName}
                    </Link>
                  </h5>
                  {/* <span className="font-small text-light lh-1 mb-1">
                    {row.original.CompanyName}
                  </span> */}
                  <ul className="d-flex font-general mt-1 flex-sb">
                    <li className="flex-start pr-10">
                      <i className="icons icon-location-pin pr-5" />
                      {checkEmptyVal(row.original.AddressOne)
                        ? "--"
                        : row.original.AddressOne}
                    </li>
                  </ul>
                  <ul className="d-flex font-general flex-sb">
                    <li className="flex-start pr-10 mb-1">
                      At {row.original.ModifiedDateDisplay}
                    </li>
                    <li className="flex-end listing-price font-mini font-500 mb-1">
                      <span className="text-primary rating-icon mr-0">
                        <Rating ratingVal={row.original.Rating}></Rating>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    ({ pageIndex, pageSize }) => {
      const fetchId = ++fetchIdRef.current;
      if (fetchId === fetchIdRef.current) {
        getAgents({
          pi: pageIndex,
          ps: pageSize,
          showPageLoader: showLoader || pageIndex > 0,
        });
      }
    },
    [location.state] //check page search from properties page
  );

  //Setup Grid.

  const onAgentDetails = (e, profileid) => {
    e.preventDefault();
    aesCtrEncrypt(profileid.toString()).then((encId) => {
      navigate(routeNames.agent.path.replace(":id", encId));
    });
  };

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    aesCtrEncrypt(assetId.toString()).then((encId) => {
      navigate(routeNames.property.path.replace(":id", encId));
    });
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
        title="Agents"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Agents Grid View Start ==============*/}
      <div className="full-row py-40 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4">
              <div className="listing-sidebar">
                <PropertySearch></PropertySearch>
                {/*============== Recent Property Widget Start ==============*/}
                <div className="widget property_carousel_widget box-shadow rounded pb-20">
                  <h5 className="mb-30 down-line pb-10">Recent Properties</h5>
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
                                      <i className="fas fa-map-marker-alt" />{" "}
                                      {a.AddressOne}
                                      {/* {checkEmptyVal(a.AddressTwo)
                                    ? ""
                                    : `, ${a.AddressTwo}`} */}
                                    </Link>
                                  </h5>
                                  {/* <span className="listing-location mb-2">
                                    {a.City}, {a.State}, {a.CountryShortName}
                                  </span>
                                  <span className="listing-price font-16 mb-1 font-600">
                                    {a.PriceDisplay}
                                  </span> */}
                                  <ul className="d-flex font-general my-10 flex-sb">
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
                                onClick={(e) => onAgentDetails(e, a.ProfileId)}
                              />
                              <div className="thumb-body">
                                <h5 className="listing-title">
                                  <a
                                    onClick={(e) =>
                                      onAgentDetails(e, a.ProfileId)
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
                          <a
                            href="#"
                            className="btn-link font-small text-primary"
                          >
                            View more...
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                {/*============== Agents Property Widget End ==============*/}
              </div>
            </div>
            <div className="col-xl-9 col-lg-8">
              <GridList
                columns={columns}
                data={agentsList}
                loading={isDataLoading}
                fetchData={fetchData}
                pageCount={pageCount}
                totalInfo={{
                  text: "agents",
                  count: totalCount,
                }}
                noData={AppMessages.NoAgents}
                containerClassName="row row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 g-4 min-h-150"
                cellclassName="col-lg-4 col-md-4 col-xl-3"
                defaultPs={12}
              />
            </div>
          </div>
        </div>
      </div>
      {/*============== Agents Grid View End ==============*/}
    </div>
  );
};

export default Agents;
