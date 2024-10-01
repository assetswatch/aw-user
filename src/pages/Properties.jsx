import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
} from "../utils/constants";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  setSelectDefaultVal,
} from "../utils/common";
import { axiosPost } from "../helpers/axiosHelper";
import config from "../config.json";
import { GridList } from "../components/common/LazyComponents";
import { useGetTopAssetsGateWay } from "../hooks/useGetTopAssetsGateWay";
import { useGetTopAgentsGateWay } from "../hooks/useGetTopAgentsGateWay";
import Rating from "../components/common/Rating";

const Properties = () => {
  let $ = window.$;

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
  }, [topAssetsList]);

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
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  const assetsRef = useRef(null);

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

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: null,
      txttodate: null,
      ddlassettype: null,
      ddlcontracttype: null,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
  );

  const getAssets = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    //show loader if search actions.
    if (isSearch || isShowall) {
      apiReqResLoader("x");
    }
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {};
    objParams = {
      keyword: "",
      contracttypeid: 0,
      assettypeid: 0,
      fromdate: setSearchInitialFormData.txtfromdate,
      todate: setSearchInitialFormData.txttodate,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    if (!isShowall) {
      objParams = {
        ...objParams,
        keyword: searchFormData.txtkeyword,
        contracttypeid: parseInt(
          setSelectDefaultVal(searchFormData.ddlcontracttype)
        ),
        assettypeid: parseInt(setSelectDefaultVal(searchFormData.ddlassettype)),
        fromdate: searchFormData.txtfromdate,
        todate: searchFormData.txttodate,
      };
    }

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
        setIsDataLoading(false);
      });
    if (isSearch || isShowall) {
      apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
    }
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
                <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom rounded">
                  <div className="catart position-absolute">
                    <span className="sale bg-secondary text-white">
                      For {row.original.ContractType}
                    </span>
                  </div>
                  <div className="prop-carousel owl-carousel single-carusel dot-disable nav-between-in">
                    {row.original.Images?.map((i, idx) => {
                      return (
                        <div className="item" key={`pimg-key-${idx}`}>
                          <Link to={routeNames.propertyDetails.path}>
                            <img src={i?.ImagePath} className="img-fit-grid" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    to={routeNames.propertyDetails.path}
                    className="listing-ctg text-white"
                  >
                    <i className="fa-solid fa-building" />
                    <span>{row.original.AssetType}</span>
                  </Link>
                </div>
                <div className="property_text p-3 pb-0">
                  <h5 className="listing-title">
                    <Link
                      to={routeNames.propertyDetails.path}
                      className="text-primary font-16"
                    >
                      {row.original.Title}
                    </Link>
                  </h5>
                  <span className="listing-location mb-1">
                    <i className="fas fa-map-marker-alt" />{" "}
                    {row.original.AddressOne}
                  </span>
                  <span className="listing-price font-16 font-600 mb-1">
                    {row.original.PriceDisplay}
                  </span>
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
                      {row.original.SqfeetDisplay} Sqft
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

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getAssets({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  return (
    <>
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
                <div className="widget advance_search_widget box-shadow rounded">
                  <h5 className="mb-30 down-line">Search Property</h5>
                  <form
                    className="rounded quick-search form-icon-right"
                    action="#"
                    method="post"
                  >
                    <div className="row g-3">
                      <div className="col-12">
                        <input
                          type="text"
                          className="form-control"
                          name="keyword"
                          placeholder="Enter Keyword..."
                        />
                      </div>
                      <div className="col-12">
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
                      <div className="col-12">
                        <select className="form-control">
                          <option>Property Status</option>
                          <option>For Rent</option>
                          <option>For Sale</option>
                        </select>
                      </div>
                      <div className="col-12">
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
                      <div className="col-12">
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
                            className="price_range price-range-toggle w-100"
                          >
                            <div className="area-filter price-filter">
                              <span className="price-slider">
                                <input
                                  className="filter_price"
                                  type="text"
                                  name="price"
                                  defaultValue="0;10000000"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <select className="form-control">
                          <option>Bedrooms</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <select className="form-control">
                          <option>Bathrooms</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <select className="form-control">
                          <option>Garage</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control"
                          name="keyword"
                          placeholder="Min Area"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control"
                          name="keyword"
                          placeholder="Max Area"
                        />
                      </div>
                      <div className="col-12">
                        <div className="position-relative">
                          <button
                            className="form-control text-start toggle-btn"
                            data-target="#aditional-features"
                          >
                            Advanced{" "}
                            <i className="fas fa-ellipsis-v font-mini icon-font y-center text-dark" />
                          </button>
                        </div>
                      </div>
                      <div className="col-12 position-relative">
                        <div
                          id="aditional-features"
                          className="aditional-features visible-static p-5"
                        >
                          <h5 className="mb-3">Aditional Options</h5>
                          <ul className="row row-cols-1 custom-check-box mb-4">
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck1"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck1"
                              >
                                Air Conditioning
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck2"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck2"
                              >
                                Garage Facility
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck3"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck3"
                              >
                                Swiming Pool
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck4"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck4"
                              >
                                Fire Security
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck5"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck5"
                              >
                                Fire Place Facility
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck6"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck6"
                              >
                                Play Ground
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck7"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck7"
                              >
                                Ferniture Include
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck8"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck8"
                              >
                                Marbel Floor
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck9"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck9"
                              >
                                Store Room
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck10"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck10"
                              >
                                Hight Class Door
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck11"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck11"
                              >
                                Floor Heating System
                              </label>
                            </li>
                            <li className="col">
                              <input
                                type="checkbox"
                                className="custom-control-input hide"
                                id="customCheck12"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="customCheck12"
                              >
                                Garden Include
                              </label>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100">
                          Search
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
                                <div className="overflow-hidden position-relative transation thumbnail-img rounded bg-secondary hover-img-zoom">
                                  <div className="cata position-absolute">
                                    <span className="sale bg-secondary text-white">
                                      For {a.ContractType}
                                    </span>
                                  </div>
                                  <Link to={routeNames.propertyDetails.path}>
                                    <img
                                      src={a.Images?.[0]?.ImagePath}
                                      className="img-fit-grid"
                                    />
                                  </Link>
                                </div>
                                <div className="post-content py-3 pb-0">
                                  <div className="post-meta font-small text-uppercase list-color-primary">
                                    <Link
                                      to={routeNames.propertyDetails.path}
                                      className="listing-ctg text-primary"
                                    >
                                      <i className="fa-solid fa-building" />
                                      <span className="font-general font-500">
                                        {a.AssetType}
                                      </span>
                                    </Link>
                                  </div>
                                  <h5 className="listing-title">
                                    <Link
                                      to={routeNames.propertyDetails.path}
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
                    <a href="#" className="btn-link font-small text-primary">
                      View more...
                    </a>
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
                              <img
                                src={a.PicPath}
                                alt={a.FirstName}
                                className="img-fit-grid-contain"
                              />
                              <div className="thumb-body">
                                <h5 className="listing-title">
                                  <a
                                    href="property-single-v1.html"
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
                data={assetsList}
                loading={isDataLoading}
                fetchData={fetchData}
                pageCount={pageCount}
                totalInfo={{
                  text: "properties",
                  count: totalCount,
                }}
                noData={AppMessages.NoProperties}
                containerClassName="row row-cols-xl-3 row-cols-lg-1 row-cols-md-2 row-cols-1 g-4 min-h-200"
                defaultPs={12}
              />
            </div>
          </div>
        </div>
      </div>
      {/*============== Property Grid View End ==============*/}
    </>
  );
};

export default Properties;
