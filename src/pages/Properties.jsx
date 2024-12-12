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

const Properties = () => {
  let $ = window.$;

  const navigate = useNavigate();

  /*check page search from properties page*/
  const location = useLocation();
  let showLoader = location?.state?.["search"];
  delete location?.state?.["search"];
  /*check page search from properties page*/

  const [rerouteKey, setRerouteKey] = useState(0);

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "./assets/js/",
      pos: "body",
      type: "js",
      files: ["owl.js"],
    },
  ];

  useEffect(() => {
    //load js/css depedency files.
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {});

    return () => {
      unloadFile(arrJsCssFiles); //unload files.
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

  let formErrors = {};
  const [assetsList, setAssetsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    if (assetsList.length > 0) {
      try {
        $(".prop-carousel")?.owlCarousel({
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

    // Cleanup on unmount
    return () => {
      if ($(".prop-carousel").hasClass("owl-loaded")) {
        $(".prop-carousel").trigger("destroy.owl.carousel");
      }
    };
  }, [assetsList]);

  const getAssets = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    showPageLoader = false,
  }) => {
    //show loader if search actions.
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
      keyword: !checkEmptyVal(propfilters?.["key"]) ? propfilters?.["key"] : "",
      location: !checkEmptyVal(propfilters?.["loc"])
        ? propfilters?.["loc"]
        : "",
      classificationtypeid: !checkEmptyVal(propfilters?.["ctid"])
        ? propfilters?.["ctid"]
        : 0,
      assettypeid: !checkEmptyVal(propfilters?.["atid"])
        ? propfilters?.["atid"]
        : 0,
      listingtypeid: !checkEmptyVal(propfilters?.["ltid"])
        ? propfilters?.["ltid"]
        : 0,
      bedrooms: !checkEmptyVal(propfilters?.["bed"])
        ? propfilters?.["bed"]
        : "",
      bathrooms: !checkEmptyVal(propfilters?.["bath"])
        ? propfilters?.["bath"]
        : "",
      minarea: !checkEmptyVal(propfilters?.["misq"])
        ? propfilters?.["misq"]
        : 0,
      maxarea: !checkEmptyVal(propfilters?.["masq"])
        ? propfilters?.["masq"]
        : 0,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getAssets}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTotalCount(objResponse.Data.TotalCount);
          setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
          setAssetsList(objResponse.Data.Assets);
        } else {
          isapimethoderr = true;
          setAssetsList([]);
          setPageCount(0);
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        setAssetsList([]);
        setPageCount(0);
        console.error(`"API :: ${ApiUrls.getAssets}, Error ::" ${err}`);
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
        Header: "Property",
        accessor: "title",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <div
              className="item"
              key={`prop-key-${row.id}`}
              d-assetid={row.original.AssetId}
            >
              <div className="property-grid-1 property-block bg-white box-shadow transation-this rounded">
                <div className="overflow-hidden position-relative transation thumbnail-img hover-img-zoom box-shadow rounded">
                  <div className="catart position-absolute">
                    <span className="sale bg-secondary text-white">
                      For {row.original.ListingType}
                    </span>
                  </div>
                  <div className="prop-carousel owl-carousel single-carusel dot-disable nav-between-in">
                    {row.original.Images?.map((i, idx) => {
                      return (
                        <div className="item" key={`pimg-key-${idx}`}>
                          <Link
                            onClick={(e) =>
                              onPropertyDetails(e, row.original.AssetId)
                            }
                          >
                            <LazyImage
                              src={i?.ImagePath}
                              className="img-fit-grid"
                              placeHolderClass="min-h-200"
                            />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    onClick={(e) => onPropertyDetails(e, row.original.AssetId)}
                    className="listing-ctg"
                  >
                    <i className="fa-solid fa-building" />
                    <span className="text-primary">
                      {row.original.AssetType}
                    </span>
                  </Link>
                </div>
                <div className="property_text p-3 pb-0">
                  <h5 className="listing-title">
                    <Link
                      onClick={(e) =>
                        onPropertyDetails(e, row.original.AssetId)
                      }
                      className="text-primary font-16"
                    >
                      <i className="fas fa-map-marker-alt" />{" "}
                      {row.original.AddressOne}{" "}
                      {/* {checkEmptyVal(a.AddressTwo)
                                    ? ""
                                    : `, ${a.AddressTwo}`} */}
                    </Link>
                  </h5>
                  {/* <span className="listing-location mb-1">
                    {row.original.City}, {row.original.State},{" "}
                    {row.original.CountryShortName}
                  </span>
                  <span className="listing-price font-15 font-500 mb-1">
                    {row.original.PriceDisplay}
                  </span> */}
                  <ul className="d-flex font-general mb-10 mt-10 flex-sb">
                    <li className="flex-start pr-20 listing-location mb-1">
                      {row.original.City}, {row.original.State},{" "}
                      {row.original.CountryShortName}
                    </li>
                    <li className="flex-end listing-price font-15 font-500 mb-1">
                      {row.original.PriceDisplay}
                    </li>
                  </ul>
                  <ul className="d-flex quantity font-general mb-2 flex-sb">
                    <li title="Beds">
                      <span>
                        <i className="fa-solid fa-bed"></i>
                      </span>
                      {row.original.Bedrooms}
                    </li>
                    <li title="Baths">
                      <span>
                        <i className="fa-solid fa-shower"></i>
                      </span>
                      {row.original.Bathrooms}
                    </li>
                    <li title="Area">
                      <span>
                        <i className="fa-solid fa-vector-square"></i>
                      </span>
                      {row.original.AreaDisplay} {row.original.AreaUnitType}
                    </li>
                  </ul>
                </div>
                <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top box-shadow">
                  <div className="agent">
                    <a
                      href="#"
                      className="d-flex text-general align-items-center"
                    >
                      <img
                        className="rounded-circle me-2 shadow img-border-white"
                        src={row.original.PicPath}
                        alt={row.original.FirstName}
                      />
                      <span className="font-general">
                        {row.original.FirstName} {row.original.LastName}
                      </span>
                    </a>
                  </div>
                  <div className="post-date ms-auto font-general">
                    <span>
                      <i className="fa fa-clock text-primary me-1"></i>
                      {row.original.PostedDaysDiff}
                    </span>
                  </div>
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
        getAssets({
          pi: pageIndex,
          ps: pageSize,
          showPageLoader: showLoader || pageIndex > 0,
        });
      }
    },
    [location.state] //check page search from properties page
  );

  //Setup Grid.

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
        title="Properties"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Property Grid View Start ==============*/}
      <div className="full-row py-40 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4">
              <div className="listing-sidebar">
                <PropertySearch></PropertySearch>
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
                  <h5 className="text-secondary mb-4 down-line">
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
                                className="img-fit-grid"
                                placeHolderClass="min-h-80 w-80px"
                              />
                              <div className="thumb-body">
                                <h5 className="listing-title">
                                  <Link
                                    to={routeNames.agentdetails.path}
                                    className="text-primary font-16 font-500"
                                  >
                                    {a.FirstName} {a.LastName}
                                  </Link>
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
                            to={routeNames.agentsList.path}
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
            </div>
            <div className="col-xl-9 col-lg-8">
              <GridList
                columns={columns}
                data={assetsList}
                loading={isDataLoading}
                fetchData={fetchData}
                pageCount={pageCount}
                totalInfo={{
                  text: "properties",
                  count: totalCount,
                }}
                noData={AppMessages.NoProperties}
                containerClassName="row row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 g-4 min-h-200"
                cellclassName="col-lg-6 col-md-6"
                defaultPs={12}
              />
            </div>
          </div>
        </div>
      </div>
      {/*============== Property Grid View End ==============*/}
    </div>
  );
};

export default Properties;
