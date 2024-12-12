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

  /*check page search from properties page*/
  const location = useLocation();
  let showLoader = location?.state?.["search"];
  delete location?.state?.["search"];
  /*check page search from properties page*/

  const [rerouteKey, setRerouteKey] = useState(0);

  const { topAssetsList } = useGetTopAssetsGateWay("recent", 5);
  const topAssetsRef = useRef(null);

  const { topAgentsList } = useGetTopAgentsGateWay("recent", 10);
  const topAgentsRef = useRef(null);

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

  let formErrors = {};
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

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

  //Setup Grid.
  const columns = React.useMemo(
    () => [
      {
        Header: "Agents List",
        accessor: "title",
        disableSortBy: true,
      },
    ],
    []
  );
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    ({ pageIndex, pageSize }) => {
      const fetchId = ++fetchIdRef.current;
      if (fetchId === fetchIdRef.current) {
        // getAssets({
        //   pi: pageIndex,
        //   ps: pageSize,
        //   showPageLoader: showLoader || pageIndex > 0,
        // });
      }
    },
    [location.state] //check page search from properties page
  );

  //Setup Grid.

  return (
    <div key={rerouteKey}>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Agents List"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== AgentsList Grid View Start ==============*/}
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
              </div>
            </div>
            <div className="col-xl-9 col-lg-8">
              <GridList
                columns={columns}
                data={topAgentsList}
                loading={isDataLoading}
                fetchData={fetchData}
                pageCount={pageCount}
                totalInfo={{
                  text: "Agents List",
                  count: totalCount,
                }}
                noData={AppMessages.NoAgents}
                containerClassName="row row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 g-4 min-h-200"
                cellclassName="col-lg-6 col-md-6"
                defaultPs={12}
              />
            </div>
          </div>
        </div>
      </div>
      {/*==============AgentsList Grid View Start Grid View End ==============*/}
    </div>
  );
};
export default AgentsListView;
