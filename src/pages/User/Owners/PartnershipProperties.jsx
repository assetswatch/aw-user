import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { Grid, LazyImage } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  getCityStateCountryZipFormat,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { useGetAssetTypesGateway } from "../../../hooks/useGetAssetTypesGateway";
import { useAssetClassificationTypesGateway } from "../../../hooks/useAssetClassificationTypesGateway";

const PartnershipProperties = () => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();

  const { assetClassificationTypes } = useAssetClassificationTypesGateway();
  const [selectedClassificationType, setSelectedClassificationType] =
    useState(0);

  //Search data.
  const { assetTypesList } = useGetAssetTypesGateway(
    "",
    1,
    selectedClassificationType
  );
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  //Grid
  const [assetsList, setAssetsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currPagingInfo, setCurrPagingInfo] = useState({
    pi: GridDefaultValues.pi,
    ps: GridDefaultValues.ps,
  });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  const navigate = useNavigate();

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: "", //moment().subtract(3, "month"),
      txttodate: "", //moment(),
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
  );

  //Set search formdata

  //Search ddl controls changes

  //Search Date control change
  const onDateChange = (newDate, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: newDate,
    });
  };

  //Input change
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  //Set search formdata

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getAssets({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    setSelectedClassificationType(null);
    setSelectedAssetType(null);
    getAssets({ isShowall: true });
  };

  const handleAssetTypeChange = (e, name) => {
    setSelectedAssetType(e?.value);
  };

  const handleClassificationTypeChange = (e, name) => {
    setSelectedClassificationType(e?.value);
    setSelectedAssetType(null);
  };

  // Search events

  //Delete any stored edit propertyid.
  //deletesessionStorageItem(SessionStorageKeys.EditAssetId);

  //Get assets list
  const getAssets = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    let errctl = "#search-val-err-message";
    $(errctl).html("");

    //Add date error to form errors.
    delete formErrors["date"];
    if (!isShowall) {
      if (
        !checkEmptyVal(searchFormData.txtfromdate) &&
        !checkEmptyVal(searchFormData.txttodate)
      ) {
        let dateCheck = checkStartEndDateGreater(
          searchFormData.txtfromdate,
          searchFormData.txttodate
        );

        if (!checkEmptyVal(dateCheck)) {
          formErrors["date"] = dateCheck;
        }
      }
    }

    //Validation check
    if (Object.keys(formErrors).length > 0) {
      $(errctl).html(formErrors[Object.keys(formErrors)[0]]);
    } else {
      //show loader if search actions.
      if (isSearch || isShowall) {
        apiReqResLoader("x", "", API_ACTION_STATUS.START);
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        accountid: parseInt(
          GetUserCookieValues(UserCookie.AccountId, loggedinUser)
        ),
        ownerprofileid: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        keyword: "",
        classificationtypeid: 0,
        assettypeid: 0,
        islisted: -1,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      setCurrPagingInfo({ pi: parseInt(pi), ps: parseInt(ps) });

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          classificationtypeid: parseInt(
            setSelectDefaultVal(selectedClassificationType)
          ),
          assettypeid: parseInt(setSelectDefaultVal(selectedAssetType)),
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getUserPartnerOwnerAssets}`,
        objParams
      )
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
          console.error(
            `"API :: ${ApiUrls.getUserPartnerOwnerAssets}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Property",
        accessor: "",
        className: "w-450px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded box-shadow cur-pointer"
              onClick={(e) => {
                onView(e, row);
              }}
              src={row.original.Images[0]?.ImagePath}
              alt={""}
              placeHolderClass="pos-absolute w-140px min-h-100 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <a
                href="#"
                onClick={(e) => {
                  onView(e, row);
                }}
              >
                {/* <i className="fas fa-map-marker-alt text-primary font-13 p-r-5" /> */}
                <h5 className="text-secondary mb-1">
                  {row.original.AddressOne}
                </h5>
              </a>
              {!checkEmptyVal(row.original.AddressTwo) && (
                <div className="py-0">{row.original.AddressTwo}</div>
              )}
              <div className="py-0">
                {getCityStateCountryZipFormat(row.original)}
                {/* {row.original.City}, {row.original.State},{" "}
                             {row.original.Country} */}
              </div>
              <div className="price">
                <span className="text-primary">
                  {row.original.PriceDisplay}
                </span>
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Classification Type",
        accessor: "ClassificationType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Property Type",
        accessor: "AssetType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Listing Info",
        className: "w-220px",
        Cell: ({ row }) => (
          <>
            <div className="property-info d-table">
              <div>Is Listed : {row.original.IsListed == 1 ? "Yes" : "No"}</div>
              <div>
                Listing Type :{" "}
                {row.original.ListingType ? row.original.ListingType : "--"}
              </div>
            </div>
            {/* <div className="property-info d-table text-center">
              <div>Noof Floors : {row.original.NoOfFloors}</div>
              <div>Bedrooms : {row.original.Bedrooms}</div>
              <div>Bathrooms : {row.original.Bathrooms}</div> 
            </div>*/}
          </>
        ),
      },
      {
        Header: "Ownership Info",
        className: "w-250px",
        Cell: ({ row }) => (
          <>
            <div className="property-info d-table">
              <div>Status : {row.original?.OwnerShipStatusDisplay}</div>
              <div>Share : {row.original?.SharePercentageDisplay}</div>
            </div>
          </>
        ),
      },
      //   {
      //     Header: "Last Modified On",
      //     accessor: "ModifiedDateDisplay",
      //     className: "w-250px",
      //   },
      {
        Header: "Actions",
        className: "w-130px",
        isPropertyActionMenu: true,
        actions: [
          {
            text: "View Property",
            onclick: (e, row) => onView(e, row),
          },
        ],
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

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(SessionStorageKeys.ViewAssetId, row.original.AssetId);
    navigate(routeNames.ownerviewproperty.path);
  };

  //Grid actions

  //List Property Modal actions

  const navigateToMyProperties = () => {
    navigate(routeNames.ownerproperties.path);
  };

  const navigateToListedProperties = () => {
    navigate(routeNames.ownerlistedproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="col-6">
                <div className="breadcrumb">
                  <div className="breadcrumb-item bc-fh">
                    <h6 className="mb-3 down-line pb-10">Properties</h6>
                  </div>
                  <div className="breadcrumb-item bc-fh ctooltip-container">
                    <span className="font-general font-500 cur-default">
                      Partnership Properties
                    </span>
                  </div>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToMyProperties}>My Properties</li>
                  <li onClick={navigateToListedProperties}>
                    Listed Properties
                  </li>
                  <li className="active">Partnership Properties</li>
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <div className="woo-filter-bar full-row p-3 grid-search bo-0">
                    <div className="container-fluid v-center">
                      <div className="row">
                        <div className="col px-0">
                          <form noValidate>
                            <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                              <div className="col-lg-3 col-xl-3 col-md-6">
                                <InputControl
                                  lblClass="mb-0"
                                  lblText="Search keyword"
                                  name="txtkeyword"
                                  ctlType={formCtrlTypes.searchkeyword}
                                  value={searchFormData.txtkeyword}
                                  onChange={handleChange}
                                  formErrors={formErrors}
                                ></InputControl>
                              </div>
                              <div className="col-lg-2 col-xl-2 col-md-4">
                                <AsyncSelect
                                  placeHolder={
                                    assetClassificationTypes.length <= 0 &&
                                    selectedClassificationType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetClassificationTypes.length <= 0 &&
                                    selectedClassificationType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.NoData
                                  }
                                  options={assetClassificationTypes}
                                  dataKey="Id"
                                  dataVal="Type"
                                  onChange={(e) =>
                                    handleClassificationTypeChange(
                                      e,
                                      "ddlclassificationtype"
                                    )
                                  }
                                  value={selectedClassificationType}
                                  defualtselected={selectedClassificationType}
                                  name="ddlclassificationtype"
                                  lbl={formCtrlTypes.assetclassificationtype}
                                  lblClass="mb-0"
                                  lblText="Classification type"
                                  className="ddlborder"
                                  isClearable={false}
                                  isSearchCtl={true}
                                  formErrors={formErrors}
                                ></AsyncSelect>
                              </div>
                              <div className="col-lg-2 col-xl-2 col-md-6">
                                <AsyncSelect
                                  placeHolder={
                                    selectedAssetType == null ||
                                    Object.keys(selectedAssetType).length === 0
                                      ? AppMessages.DdlDefaultSelect
                                      : assetTypesList?.length <= 0 &&
                                        selectedAssetType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    selectedAssetType == null ||
                                    Object.keys(selectedAssetType).length === 0
                                      ? AppMessages.NoData
                                      : assetTypesList?.length <= 0 &&
                                        selectedAssetType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.NoData
                                  }
                                  options={assetTypesList}
                                  dataKey="AssetTypeId"
                                  dataVal="AssetType"
                                  onChange={(e) =>
                                    handleAssetTypeChange(e, "ddlassettype")
                                  }
                                  value={selectedAssetType}
                                  name="ddlassettype"
                                  lbl={formCtrlTypes.assettype}
                                  lblClass="mb-0"
                                  lblText="Property type"
                                  className="ddlborder"
                                  isClearable={false}
                                  isSearchCtl={true}
                                  formErrors={formErrors}
                                ></AsyncSelect>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-4">
                                <DateControl
                                  lblClass="mb-0"
                                  lblText="Start date"
                                  name="txtfromdate"
                                  required={false}
                                  onChange={(dt) =>
                                    onDateChange(dt, "txtfromdate")
                                  }
                                  value={searchFormData.txtfromdate}
                                  isTime={false}
                                ></DateControl>
                              </div>
                              <div className="col-lg-3 col-xl-2 col-md-4">
                                <DateControl
                                  lblClass="mb-0"
                                  lblText="End date"
                                  name="txttodate"
                                  required={false}
                                  onChange={(dt) =>
                                    onDateChange(dt, "txttodate")
                                  }
                                  value={searchFormData.txttodate}
                                  isTime={false}
                                  objProps={{
                                    checkVal: searchFormData.txtfromdate,
                                    days: 7,
                                  }}
                                ></DateControl>
                              </div>
                              <div className="col-lg-6 col-xl-4 col-md-7 grid-search-action">
                                <label
                                  className="mb-0 form-error w-100"
                                  id="search-val-err-message"
                                ></label>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Search"
                                  name="btnsearch"
                                  type="button"
                                  onClick={onSearch}
                                >
                                  Search
                                </button>
                                <button
                                  className="btn btn-primary w- 100"
                                  value="Show all"
                                  name="btnshowall"
                                  type="button"
                                  onClick={onShowAll}
                                >
                                  Show All
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Search End ==============*/}

                  {/*============== Grid Start ==============*/}
                  <div className="row rounded">
                    <div className="col">
                      <div className="dashboard-panel bo-top br-r-0 br-l-0 bg-white rounded overflow-hidden w-100 box-shadow-top">
                        <Grid
                          columns={columns}
                          data={assetsList}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Properties",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoProperties}
                        />
                      </div>
                    </div>
                  </div>
                  {/*============== Grid End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnershipProperties;
