import { useState } from "react";
import { formCtrlTypes } from "../../utils/formvalidation";
import InputControl from "../common/InputControl";
import { useGetAssetAccessTypesGateway } from "../../hooks/useGetAssetAccessTypesGateway";
import { useGetAssetTypesGateway } from "../../hooks/useGetAssetTypesGateway";
import { useGetAssetContractTypesGateway } from "../../hooks/useGetAssetContractTypesGateway";
import { useAssetsAppConfigGateway } from "../../hooks/useAssetsAppConfigGateway";
import AsyncSelect from "../common/AsyncSelect";
import { AppMessages, SessionStorageKeys } from "../../utils/constants";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../helpers/sessionStorageHelper";
import { routeNames } from "../../routes/routes";
import { useLocation, useNavigate } from "react-router-dom";
import { checkEmptyVal, setSelectDefaultVal } from "../../utils/common";

const PropertySearch = () => {
  let $ = window.$;

  let formErrors = {};

  const { pathname } = useLocation();
  const [errors, setErrors] = useState({});

  if (
    pathname.toLowerCase().indexOf("propertydetails") != -1 ||
    pathname?.toLowerCase() == "/" ||
    pathname?.toLowerCase() == "home"
  ) {
    deletesessionStorageItem(SessionStorageKeys.ObjAssetfilters);
  }

  let propfilters = JSON.parse(
    getsessionStorageItem(SessionStorageKeys.ObjAssetfilters, "{}")
  );

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: !checkEmptyVal(propfilters?.["key"])
        ? propfilters?.["key"]
        : "",
      txtlocation: !checkEmptyVal(propfilters?.["loc"])
        ? propfilters?.["loc"]
        : "",
      ddlassettype: !checkEmptyVal(propfilters?.["atid"])
        ? propfilters?.["atid"]
        : null,
      ddlcontracttype: !checkEmptyVal(propfilters?.["ctid"])
        ? propfilters?.["ctid"]
        : null,
      ddlbedrooms: !checkEmptyVal(propfilters?.["bed"])
        ? propfilters?.["bed"]
        : "",
      ddlbathrooms: !checkEmptyVal(propfilters?.["bath"])
        ? propfilters?.["bath"]
        : "",
      txtminsqfeet: !checkEmptyVal(propfilters?.["misq"])
        ? propfilters?.["misq"]
        : "",
      txtmaxsqfeet: !checkEmptyVal(propfilters?.["masq"])
        ? propfilters?.["masq"]
        : "",
    };
  };

  const navigate = useNavigate();

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
  );

  const { assetTypesList } = useGetAssetTypesGateway("", 1);
  const [selectedAssetType, setSelectedAssetType] = useState(
    !checkEmptyVal(propfilters?.["atid"]) ? propfilters?.["atid"] : null
  );

  const { assetContractTypesList } = useGetAssetContractTypesGateway("", 1);
  const [selectedContractType, setSelectedContractType] = useState(
    !checkEmptyVal(propfilters?.["ctid"]) ? propfilters?.["ctid"] : null
  );

  const { assetsAppConfigList } = useAssetsAppConfigGateway();
  const [selectedBedRooms, setSelectedBedRooms] = useState(
    !checkEmptyVal(propfilters?.["bed"]) ? propfilters?.["bed"] : null
  );
  const [selectedBathRooms, setSelectedBathRooms] = useState(
    !checkEmptyVal(propfilters?.["bath"]) ? propfilters?.["bath"] : null
  );

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  const handleAssetTypeChange = (e) => {
    setSelectedAssetType(e?.value);
  };

  const handleContractTypeChange = (e) => {
    setSelectedContractType(e?.value);
  };

  const handleBedroomsChange = (e) => {
    setSelectedBedRooms(e?.value);
  };

  const handleBathRoomsChange = (e) => {
    setSelectedBathRooms(e?.value);
  };

  const onPropertiesSearch = (e, isClearSearch = false) => {
    e.preventDefault();
    if (isClearSearch) {
      deletesessionStorageItem(SessionStorageKeys.ObjAssetfilters);
      setSearchFormData(setSearchInitialFormData());
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ObjAssetfilters,
        JSON.stringify({
          key: searchFormData.txtkeyword,
          loc: searchFormData.txtlocation,
          bath: selectedBathRooms,
          bed: selectedBedRooms,
          atid: parseInt(setSelectDefaultVal(selectedAssetType)),
          ctid: parseInt(setSelectDefaultVal(selectedContractType)),
          misq: searchFormData.txtminsqfeet,
          masq: searchFormData.txtmaxsqfeet,
        })
      );
    }

    //check page search from properties page
    if (pathname.toLowerCase().indexOf("properties") != -1) {
      navigate(routeNames.properties.path, {
        state: { search: true },
      });
    } else {
      navigate(routeNames.properties.path);
    }
  };

  return (
    <>
      {pathname?.toLowerCase() == "/" || pathname?.toLowerCase() == "home" ? (
        <div className="full-row p-0" style={{ marginTop: "0px", zIndex: 99 }}>
          <div className="container-fluid">
            <div className="row shadow">
              <div className="col px- 0">
                <form
                  className="quick-search py-4 px-5 form-icon-right position-relative"
                  action="#"
                  method="post"
                >
                  <div className="row row-cols-lg-5 row-cols-md-3 row-cols-1 g-3 mx-auto">
                    <div className="col">
                      <InputControl
                        lblClass="d-none"
                        name="txtkeyword"
                        ctlType={formCtrlTypes.searchkeyword}
                        value={searchFormData.txtkeyword}
                        onChange={handleChange}
                        formErrors={formErrors}
                        placeHolder="Keyword..."
                        tabIndex={1}
                      ></InputControl>
                    </div>
                    <div className="col">
                      <div className="position-relative">
                        <InputControl
                          lblClass="d-none"
                          name="txtlocation"
                          ctlType={formCtrlTypes.location}
                          value={searchFormData.txtlocation}
                          onChange={handleChange}
                          formErrors={formErrors}
                          placeHolder="Location"
                          tabIndex={2}
                        ></InputControl>
                        <i className="flaticon-placeholder flat-mini icon-font y-center text-dark" />
                      </div>
                    </div>
                    <div className="col">
                      <AsyncSelect
                        placeHolder={
                          assetTypesList.length <= 0 &&
                          selectedAssetType == null
                            ? AppMessages.DdLLoading
                            : "Property Type"
                        }
                        noData={
                          assetTypesList.length <= 0 &&
                          selectedAssetType == null
                            ? AppMessages.DdLLoading
                            : AppMessages.NoData
                        }
                        options={assetTypesList}
                        dataKey="AssetTypeId"
                        dataVal="AssetType"
                        onChange={handleAssetTypeChange}
                        value={selectedAssetType}
                        name="ddlassettype"
                        lbl={formCtrlTypes.assettype}
                        lblClass="d-none"
                        className="ddlborder"
                        isClearable={true}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={3}
                      ></AsyncSelect>
                    </div>
                    <div className="col">
                      <div className="position-relative">
                        <AsyncSelect
                          placeHolder={
                            assetContractTypesList.length <= 0 &&
                            selectedContractType == null
                              ? AppMessages.DdLLoading
                              : "Property Status"
                          }
                          noData={
                            assetContractTypesList.length <= 0 &&
                            selectedContractType == null
                              ? AppMessages.DdLLoading
                              : AppMessages.NoData
                          }
                          options={assetContractTypesList}
                          dataKey="ContractTypeId"
                          dataVal="ContractType"
                          onChange={handleContractTypeChange}
                          value={selectedContractType}
                          name="ddlcontracttype"
                          lbl={formCtrlTypes.assetcontracttype}
                          lblClass="d-none"
                          className="ddlborder"
                          isClearable={true}
                          errors={errors}
                          formErrors={formErrors}
                          tabIndex={4}
                        ></AsyncSelect>
                      </div>
                    </div>
                    <div className="col">
                      <button
                        className="btn btn-primary btn-mini w-100 btn-glow sha dow rounded lh-38"
                        onClick={onPropertiesSearch}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="widget advance_search_widget box-shadow rounded">
          <h5 className="mb-30 down-line">Search Property</h5>
          <form
            className="rounded quick-search  grid-search form-icon-right"
            action="#"
            method="post"
          >
            <div className="row g-3">
              <div className="col-12">
                <InputControl
                  lblClass="d-none"
                  name="txtkeyword"
                  ctlType={formCtrlTypes.searchkeyword}
                  value={searchFormData.txtkeyword}
                  onChange={handleChange}
                  formErrors={formErrors}
                  placeHolder="Keyword..."
                  tabIndex={1}
                ></InputControl>
              </div>
              <div className="col-12">
                <AsyncSelect
                  placeHolder={
                    assetTypesList.length <= 0 && selectedAssetType == null
                      ? AppMessages.DdLLoading
                      : "Property Type"
                  }
                  noData={
                    assetTypesList.length <= 0 && selectedAssetType == null
                      ? AppMessages.DdLLoading
                      : AppMessages.NoData
                  }
                  options={assetTypesList}
                  dataKey="AssetTypeId"
                  dataVal="AssetType"
                  onChange={handleAssetTypeChange}
                  value={selectedAssetType}
                  name="ddlassettype"
                  lbl={formCtrlTypes.assettype}
                  lblClass="d-none"
                  className="ddlborder"
                  isClearable={true}
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={2}
                ></AsyncSelect>
              </div>
              <div className="col-12">
                <AsyncSelect
                  placeHolder={
                    assetContractTypesList.length <= 0 &&
                    selectedContractType == null
                      ? AppMessages.DdLLoading
                      : "Property Status"
                  }
                  noData={
                    assetContractTypesList.length <= 0 &&
                    selectedContractType == null
                      ? AppMessages.DdLLoading
                      : AppMessages.NoData
                  }
                  options={assetContractTypesList}
                  dataKey="ContractTypeId"
                  dataVal="ContractType"
                  onChange={handleContractTypeChange}
                  value={selectedContractType}
                  name="ddlcontracttype"
                  lbl={formCtrlTypes.assetcontracttype}
                  lblClass="d-none"
                  className="ddlborder"
                  isClearable={true}
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={3}
                ></AsyncSelect>
              </div>
              <div className="col-12">
                <div className="position-relative">
                  <InputControl
                    lblClass="d-none"
                    name="txtlocation"
                    ctlType={formCtrlTypes.location}
                    value={searchFormData.txtlocation}
                    onChange={handleChange}
                    formErrors={formErrors}
                    placeHolder="Location"
                    tabIndex={4}
                  ></InputControl>
                  <i className="flaticon-placeholder flat-mini icon-font y-center text-dark" />
                </div>
              </div>
              {/* <div className="col-12">
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
            </div> */}
              <div className="col-12">
                <AsyncSelect
                  placeHolder={
                    assetsAppConfigList?.["BedRooms"]?.length <= 0 &&
                    selectedBedRooms == null
                      ? AppMessages.DdLLoading
                      : "Bedrooms"
                  }
                  noData={
                    assetsAppConfigList?.["BedRooms"]?.length <= 0 &&
                    selectedBedRooms == null
                      ? AppMessages.DdLLoading
                      : AppMessages.NoData
                  }
                  options={assetsAppConfigList?.BedRooms}
                  dataType="string"
                  onChange={handleBedroomsChange}
                  value={selectedBedRooms}
                  name="ddlbedrooms"
                  lbl={formCtrlTypes.bedrooms}
                  lblClass="d-none"
                  className="ddlborder"
                  isClearable={true}
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={5}
                ></AsyncSelect>
              </div>
              <div className="col-12">
                <AsyncSelect
                  placeHolder={
                    assetsAppConfigList?.["BathRooms"]?.length <= 0 &&
                    selectedBathRooms == null
                      ? AppMessages.DdLLoading
                      : "Bathrooms"
                  }
                  noData={
                    assetsAppConfigList?.["BathRooms"]?.length <= 0 &&
                    selectedBathRooms == null
                      ? AppMessages.DdLLoading
                      : AppMessages.NoData
                  }
                  options={assetsAppConfigList?.BathRooms}
                  dataType="string"
                  onChange={handleBathRoomsChange}
                  value={selectedBathRooms}
                  name="ddlbathrooms"
                  lbl={formCtrlTypes.bathrooms}
                  lblClass="d-none"
                  className="ddlborder"
                  isClearable={true}
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={6}
                ></AsyncSelect>
              </div>
              {/* <div className="col-12">
              <select className="form-control">
                <option>Garage</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div> */}
              <div className="col-6">
                <InputControl
                  lblClass="d-none"
                  name="txtminsqfeet"
                  ctlType={formCtrlTypes.sqfeet}
                  value={searchFormData.txtminsqfeet}
                  onChange={handleChange}
                  formErrors={formErrors}
                  placeHolder="Min Area"
                  tabIndex={7}
                ></InputControl>
              </div>
              <div className="col-6">
                <InputControl
                  lblClass="d-none"
                  name="txtmaxsqfeet"
                  ctlType={formCtrlTypes.sqfeet}
                  value={searchFormData.txtmaxsqfeet}
                  onChange={handleChange}
                  formErrors={formErrors}
                  placeHolder="Max Area"
                  tabIndex={8}
                ></InputControl>
              </div>
              <div className="col-6 mt-20">
                <button
                  className="btn btn-secondary btn-mini btn-glow box-shadow rounded w-100"
                  onClick={(e) => {
                    onPropertiesSearch(e, true);
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="col-6 mt-20">
                <button
                  className="btn btn-primary btn-mini btn-glow box-shadow rounded w-100"
                  onClick={onPropertiesSearch}
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default PropertySearch;
