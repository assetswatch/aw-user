import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  getCityStateCountryZipFormat,
  GetUserCookieValues,
  replacePlaceHolders,
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
  ValidationMessages,
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
import { useGetAssetListingTypesGateway } from "../../../hooks/useGetAssetListingTypesGateway";
import { Toast } from "../../../components/common/ToastView";
import { useAssetClassificationTypesGateway } from "../../../hooks/useAssetClassificationTypesGateway";
import GridFiltersPanel from "../../../components/common/GridFiltersPanel";

const AssignedProperties = () => {
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

  const { assetListingTypesList } = useGetAssetListingTypesGateway("", 1);
  const [selectedListingType, setSelectedListingType] = useState(null);

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

  const [modalListPropertyShow, setModalListPropertyShow] = useState(false);
  const [modalSwitchClassificationShow, setModalSwitchClassificationShow] =
    useState(false);

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
        apiReqResLoader("x");
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        accountid: parseInt(
          GetUserCookieValues(UserCookie.AccountId, loggedinUser)
        ),
        profileid: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        keyword: "",
        classificationtypeid: 0,
        assettypeid: 0,
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
        `${config.apiBaseUrl}${ApiUrls.getUserAssignedAssets}`,
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
            `"API :: ${ApiUrls.getUserAssignedAssets}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", "completed");
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
        Header: "Assigned On",
        accessor: "AssignedModifiedDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        className: "w-130px",
        isPropertyActionMenu: true,
        actions: [
          {
            text: "View Property",
            onclick: (e, row) => onView(e, row),
          },
          {
            text: "List Property",
            onclick: (e, row) => onListPropertyModalShow(e, row),
            icssclass: "pr-10 pl-2px",
          },
          {
            text: "Listing Information",
            onclick: (e, row) => onListPropertyModalShow(e, row),
            icssclass: "pr-10 pl-2px",
          },
          {
            text: "Switch Zone",
            onclick: (e, row) => onSwitchClassificationModalShow(e, row),
            icssclass: "pr-10 pl-2px",
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
    navigate(routeNames.agentviewproperty.path);
  };

  const onListProperty = (e, isupdate = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedListingType)) {
      formListPropertyErrors["ddllistingtype"] =
        ValidationMessages.ListingTypeReq;
    }

    if (Object.keys(formListPropertyErrors).length === 0) {
      setListPropertyErrors({});
      if (!isupdate) {
        apiReqResLoader("btnlistproperty", "Listing", API_ACTION_STATUS.START);
      } else {
        apiReqResLoader(
          "btnupdatelistinginfo",
          "Saving",
          API_ACTION_STATUS.START
        );
      }
      let isapimethoderr = false;
      let objBodyParams = {
        AssetId: parseInt(selectedGridRow?.original?.AssetId),
        ListedByProfileId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        ListingTypeId: parseInt(setSelectDefaultVal(selectedListingType)),
        Price: checkEmptyVal(listPropertyFormData.txtprice)
          ? 0
          : listPropertyFormData.txtprice,
        Advance: checkEmptyVal(listPropertyFormData.txtadvance)
          ? 0
          : listPropertyFormData.txtadvance,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.listAsset}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              Toast.success(
                !isupdate
                  ? AppMessages.AssetListSuccess
                  : AppMessages.UpdateListingInfoSuccess
              );
              getAssets({ pi: currPagingInfo.pi, ps: currPagingInfo.ps });
              onListPropertyModalHide();
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.listAsset}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          if (!isupdate) {
            apiReqResLoader(
              "btnlistproperty",
              "List",
              API_ACTION_STATUS.COMPLETED
            );
          } else {
            apiReqResLoader(
              "btnupdatelistinginfo",
              "Save",
              API_ACTION_STATUS.COMPLETED
            );
          }
        });
    } else {
      $(`[name=${Object.keys(formListPropertyErrors)[0]}]`).focus();
      setListPropertyErrors(formListPropertyErrors);
    }
  };

  const onUnListProperty = (e) => {
    e.preventDefault();
    e.stopPropagation();

    apiReqResLoader("btnunlistproperty", "Unlisting", API_ACTION_STATUS.START);
    let isapimethoderr = false;
    let objBodyParams = {
      AssetId: parseInt(selectedGridRow?.original?.AssetId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.unlistAsset}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Id > 0) {
            Toast.success(AppMessages.AssetUnlistSuccess);
            getAssets({ pi: currPagingInfo.pi, ps: currPagingInfo.ps });
            onListPropertyModalHide();
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.unlistAsset}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader(
          "btnunlistproperty",
          "Unlist",
          API_ACTION_STATUS.COMPLETED
        );
      });
  };

  const onSwitchClassification = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(switchClassificationSelectedAssetType)) {
      formSwitchClassificationErrors["ddlswitchclassificationassettype"] =
        ValidationMessages.AssetTypeReq;
    }

    if (Object.keys(formSwitchClassificationErrors).length === 0) {
      setSwitchClassificationErrors({});
      apiReqResLoader(
        "btnswitchclassification",
        "Saving",
        API_ACTION_STATUS.START
      );
      let isapimethoderr = false;
      let objBodyParams = {
        AssetId: parseInt(selectedGridRow?.original?.AssetId),
        ClassificationTypeId: parseInt(
          selectedGridRow?.original?.ClassificationTypeId ==
            config.assetClassificationTypes.Residential
            ? config.assetClassificationTypes.Commercial
            : config.assetClassificationTypes.Residential
        ),
        AssetTypeId: parseInt(
          setSelectDefaultVal(switchClassificationSelectedAssetType)
        ),
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.switchAssetClassification}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status > 0) {
              Toast.success(AppMessages.AssetSwitchClassificationSuccess);
              getAssets({ pi: currPagingInfo.pi, ps: currPagingInfo.ps });
              onSwitchClassificationModalHide();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.switchAssetClassification}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnswitchclassification",
            "Switch",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formSwitchClassificationErrors)[0]}]`).focus();
      setSwitchClassificationErrors(formSwitchClassificationErrors);
    }
  };

  //Grid actions

  //Siwtch Classficiation Modal actions

  let formSwitchClassificationErrors = {};
  const [switchClassificationErrors, setSwitchClassificationErrors] = useState(
    {}
  );
  const [switchClassificationAssetTypes, setSwitchClassificationAssetTypes] =
    useState([]);
  const [
    switchClassificationSelectedAssetType,
    setSwitchClassificationSelectedAssetType,
  ] = useState(null);

  const getAssetTypes = (ctid) => {
    let objBody = {
      ClassificationTypeId: ctid,
      Keyword: "",
      Status: 1,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getAssetTypes}`, objBody)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setSwitchClassificationAssetTypes(objResponse.Data);
        } else {
          setSwitchClassificationAssetTypes([]);
        }
      })
      .catch((err) => {
        console.error(
          `API :: ${config.apiBaseUrl}${ApiUrls.getAssetTypes}, Error :: ${err}`
        );
        setSwitchClassificationAssetTypes([]);
      })
      .finally(() => {});
  };

  const handleSwitchClassificationAssetTypeChange = (e) => {
    setSwitchClassificationSelectedAssetType(e?.value);
  };

  const onSwitchClassificationModalShow = (e, row) => {
    e?.preventDefault();
    getAssetTypes(
      row?.original?.ClassificationTypeId ==
        config.assetClassificationTypes.Residential
        ? config.assetClassificationTypes.Commercial
        : config.assetClassificationTypes.Residential
    );
    setSelectedGridRow(row);
    setModalSwitchClassificationShow(true);
  };

  const onSwitchClassificationModalHide = (e) => {
    e?.preventDefault();
    setSelectedGridRow(null);
    setModalSwitchClassificationShow(false);
    setSwitchClassificationSelectedAssetType(null);
    setSwitchClassificationAssetTypes([]);
    setSwitchClassificationErrors({});
    apiReqResLoader(
      "btnswitchclassification",
      "Switch",
      API_ACTION_STATUS.COMPLETED,
      false
    );
  };

  //Siwtch Classficiation Modal actions

  //List Property Modal actions

  let formListPropertyErrors = {};
  const [listPropertyErrors, setListPropertyErrors] = useState({});
  function setInitialListPropertyFormData() {
    return {
      txtprice: "",
      txtadvance: "",
    };
  }
  const [listPropertyFormData, setListPropertyFormData] = useState(
    setInitialListPropertyFormData()
  );

  const onListPropertyModalShow = (e, row) => {
    e?.preventDefault();
    if (row.original?.IsListed == 1) {
      setListPropertyFormData({
        txtprice: row.original?.Price,
        txtadvance: row.original?.Advance,
      });
      setSelectedListingType(row.original?.ListingTypeId);
    }
    setSelectedGridRow(row);
    setModalListPropertyShow(true);
  };

  const onListPropertyModalHide = (e) => {
    e?.preventDefault();
    setSelectedGridRow(null);
    setShowEditListingInfo(false);
    setModalListPropertyShow(false);
    setSelectedListingType(null);
    setListPropertyErrors({});
    setListPropertyFormData(setInitialListPropertyFormData());
    apiReqResLoader(
      "btnlistproperty",
      "List",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    apiReqResLoader(
      "btnupdatelistinginfo",
      "Save",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    apiReqResLoader(
      "btnunlistproperty",
      "Unlist",
      API_ACTION_STATUS.COMPLETED,
      false
    );
  };

  const handleListingTypeChange = (e) => {
    setSelectedListingType(e?.value);
  };

  const handleListingTypeInputChange = (e) => {
    const { name, value } = e?.target;
    setListPropertyFormData({
      ...listPropertyFormData,
      [name]: value,
    });
  };

  const generateModalActions = () => {
    let actions = [];
    if (selectedGridRow) {
      if (selectedGridRow?.original?.IsListed == 0) {
        actions.push({
          id: "btnlistproperty",
          text: "List",
          displayOrder: 1,
          btnClass: "btn-primary",
          onClick: (e) => onListProperty(e),
        });
        actions.push({
          text: "Cancel",
          displayOrder: 2,
          btnClass: "btn-secondary",
          onClick: (e) => onListPropertyModalHide(e),
        });
      } else {
        actions.push({
          id: "btnunlistproperty",
          text: "Unlist",
          displayOrder: 3,
          btnClass: "btn-danger",
          onClick: (e) => onUnListProperty(e),
        });
        if (showEditListingInfo) {
          actions.push({
            id: "btnupdatelistinginfo",
            text: "Save",
            displayOrder: 1,
            btnClass: "btn-primary",
            onClick: (e) => onListProperty(e, true),
          });
          actions.push({
            text: "Cancel",
            displayOrder: 2,
            btnClass: "btn-secondary",
            onClick: (e) => toggleListingInfo(e),
          });
        } else {
          actions.push({
            id: "btnlistproperty",
            text: "Edit",
            displayOrder: 1,
            btnClass: "btn-primary",
            onClick: (e) => toggleListingInfo(e),
          });
          actions.push({
            text: "Close",
            displayOrder: 2,
            btnClass: "btn-secondary",
            onClick: (e) => onListPropertyModalHide(e),
          });
        }
      }
    }
    return actions;
  };

  const [showEditListingInfo, setShowEditListingInfo] = useState(false);
  const toggleListingInfo = (e) => {
    setShowEditListingInfo(!showEditListingInfo);
  };

  //List Property Modal actions

  const navigateToMyProperties = () => {
    navigate(routeNames.agentproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumb my-1">
                <div className="breadcrumb-item bc-fh">
                  <h6 className="mb-3 down-line pb-10">Properties</h6>
                </div>
                <div className="breadcrumb-item bc-fh ctooltip-container">
                  <span className="font-general font-500 cur-default">
                    Assigned Properties
                  </span>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToMyProperties}>My Properties</li>
                  <li className="active">Assigned Properties</li>
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <GridFiltersPanel
                    divFilterControls={
                      <div
                        className="container-fluid v-center"
                        id="div-filters-controls-panel"
                      >
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
                                      Object.keys(selectedAssetType).length ===
                                        0
                                        ? AppMessages.DdlDefaultSelect
                                        : assetTypesList?.length <= 0 &&
                                          selectedAssetType == null
                                        ? AppMessages.DdLLoading
                                        : AppMessages.DdlDefaultSelect
                                    }
                                    noData={
                                      selectedAssetType == null ||
                                      Object.keys(selectedAssetType).length ===
                                        0
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
                    }
                  ></GridFiltersPanel>
                  {/*============== Search End ==============*/}

                  {/*============== Grid Start ==============*/}
                  <div className="row rounded">
                    <div className="col">
                      <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
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
                          noData={AppMessages.NoAssignedProperties}
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

      {/*============== List Property Modal Start ==============*/}
      {modalListPropertyShow && (
        <>
          <ModalView
            title={
              selectedGridRow?.original?.IsListed == 1
                ? AppMessages.ListingInfoModalTitle
                : AppMessages.ListPropertyModalTitle
            }
            content={
              <>
                {!showEditListingInfo &&
                selectedGridRow?.original?.IsListed == 1 ? (
                  <div className="row form-view">
                    <div className="col-md-6 mb-15">
                      <span>Listing type : </span>
                      <span>{selectedGridRow?.original?.ListingType}</span>
                    </div>
                    <div className="col-md-6 mb-15 text-md-end">
                      <span>Listed On : </span>
                      <span>
                        {selectedGridRow?.original?.ListedDateDisplay}
                      </span>
                    </div>
                    <div className="col-md-6 mb-15">
                      <span>Amount : </span>
                      <span>{selectedGridRow?.original?.PriceDisplay}</span>
                    </div>
                    <div className="col-md-6 mb-0 text-md-end">
                      <span>Advance : </span>
                      <span>{selectedGridRow?.original?.AdvanceDisplay}</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12 mb-15">
                      <AsyncSelect
                        placeHolder={
                          assetListingTypesList.length <= 0 &&
                          selectedListingType == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          assetListingTypesList.length <= 0 &&
                          selectedListingType == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlNoData
                        }
                        options={assetListingTypesList}
                        dataKey="ListingTypeId"
                        dataVal="ListingType"
                        onChange={handleListingTypeChange}
                        value={selectedListingType}
                        name="ddllistingtype"
                        lbl={formCtrlTypes.assetlistingtype}
                        lblClass="mb-0 lbl-req-field"
                        className="ddlborder"
                        isClearable={false}
                        errors={listPropertyErrors}
                        formErrors={formListPropertyErrors}
                        tabIndex={1}
                      ></AsyncSelect>
                    </div>
                    <div className="col-md-6 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field"
                        name="txtprice"
                        ctlType={formCtrlTypes.amount}
                        required={true}
                        onChange={handleListingTypeInputChange}
                        value={listPropertyFormData.txtprice}
                        errors={listPropertyErrors}
                        formErrors={formListPropertyErrors}
                        tabIndex={2}
                      ></InputControl>
                    </div>
                    <div className="col-md-6 mb-0">
                      <InputControl
                        lblClass="mb-0"
                        name="txtadvance"
                        ctlType={formCtrlTypes.advance}
                        onChange={handleListingTypeInputChange}
                        value={listPropertyFormData.txtadvance}
                        errors={listPropertyErrors}
                        formErrors={formListPropertyErrors}
                        tabIndex={3}
                      ></InputControl>
                    </div>
                  </div>
                )}
              </>
            }
            onClose={onListPropertyModalHide}
            actions={generateModalActions()}
          ></ModalView>
        </>
      )}
      {/*============== List Property Modal End ==============*/}

      {/*============== Switch Classification Modal Start ==============*/}
      {modalSwitchClassificationShow && (
        <>
          <ModalView
            title={AppMessages.SwitchClassificationModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={
                        switchClassificationSelectedAssetType == null ||
                        Object.keys(switchClassificationSelectedAssetType)
                          .length === 0
                          ? AppMessages.DdlDefaultSelect
                          : switchClassificationAssetTypes?.length <= 0 &&
                            switchClassificationSelectedAssetType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        switchClassificationSelectedAssetType == null ||
                        Object.keys(switchClassificationSelectedAssetType)
                          .length === 0
                          ? AppMessages.NoData
                          : switchClassificationAssetTypes?.length <= 0 &&
                            switchClassificationSelectedAssetType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoData
                      }
                      options={switchClassificationAssetTypes}
                      dataKey="AssetTypeId"
                      dataVal="AssetType"
                      onChange={(e) =>
                        handleSwitchClassificationAssetTypeChange(e)
                      }
                      value={switchClassificationSelectedAssetType}
                      name="ddlswitchclassificationassettype"
                      lbl={formCtrlTypes.assettype}
                      lblClass="mb-0"
                      lblText="Property type"
                      className="ddlborder"
                      isClearable={false}
                      isSearchCtl={true}
                      errors={switchClassificationErrors}
                      formErrors={formSwitchClassificationErrors}
                    ></AsyncSelect>
                  </div>
                </div>
              </>
            }
            onClose={onSwitchClassificationModalHide}
            actions={[
              {
                id: "btnswitchclassification",
                text: "Switch",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSwitchClassification(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSwitchClassificationModalHide(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Switch Classification Modal End ==============*/}
    </>
  );
};

export default AssignedProperties;
