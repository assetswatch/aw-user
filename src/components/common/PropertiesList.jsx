import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadFile, unloadFile, getArrLoadFiles } from "../../utils/loadFiles";
import { routeNames } from "../../routes/routes";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
} from "../../utils/constants";
import {
  aesCtrEncrypt,
  apiReqResLoader,
  getCityStateCountryZipFormat,
} from "../../utils/common";
import { axiosPost } from "../../helpers/axiosHelper";
import config from "../../config.json";
import { GridList, LazyImage } from "../../components/common/LazyComponents";

const PropertiesList = ({ listedByProfileId = 0, isShowNoData = true }) => {
  let $ = window.$;
  const navigate = useNavigate();

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "../../assets/js/",
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
      unloadFile(arrJsCssFiles);
    };
  }, []);

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
          autowidth: false,
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
        setTimeout(() => {
          $(".prop-carousel")?.trigger("refresh.owl.carousel");
        }, 500);
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

    objParams = {
      keyword: "",
      location: "",
      listedbyprofileid: listedByProfileId,
      classificationtypeid: 0,
      assettypeid: 0,
      listingtypeid: 0,
      bedrooms: "",
      bathrooms: "",
      minarea: 0,
      maxarea: 0,
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
                              className="img-fit-grid-small"
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
                  <h5 className="listing-title text-primary">
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
                      {getCityStateCountryZipFormat(row.original)}
                      {/* {row.original.City}, {row.original.State},{" "}
                      {row.original.CountryShortName} */}
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
                      onClick={(e) => onAssetProfileDetails(e, row.original)}
                      className="d-flex text-general align-items-center lh-18 font-general hovertxt-decnone"
                    >
                      <img
                        className="rounded-circle me-1 shadow img-border-white"
                        src={row.original.PicPath}
                        alt={row.original.FirstName}
                      />
                      <span className="font-general">
                        {row.original.FirstName} {row.original.LastName}
                        <br />
                        <span className="mt-1 small text-light">
                          {row.original.ListedByProfileType}
                        </span>
                      </span>
                    </a>
                  </div>
                  <div className="post-date ms-auto font-small">
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
          showPageLoader: false,
        });
      }
    },
    [] //check page search from properties page
  );

  //Setup Grid.

  const onPropertyDetails = (e, assetId) => {
    e.preventDefault();
    aesCtrEncrypt(assetId.toString()).then((encId) => {
      navigate(routeNames.property.path.replace(":id", encId));
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

  return (
    <GridList
      columns={columns}
      data={assetsList}
      loading={isDataLoading}
      fetchData={fetchData}
      pageCount={pageCount}
      totalInfo={{
        text: "listed properties",
        count: totalCount,
      }}
      noData={AppMessages.NoListedProperties}
      containerClassName="row row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 g-4 min-h-200"
      cellclassName="col-lg-6 col-md-6"
      defaultPs={12}
      isShowNoData={isShowNoData}
    />
  );
};

export default PropertiesList;
