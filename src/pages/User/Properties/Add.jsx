import React, { useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
  setDdlOptions,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { Link, useNavigate } from "react-router-dom";
import TextAreaControl from "../../../components/common/TextAreaControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { useGetAssetTypesGateway } from "../../../hooks/useGetAssetTypesGateway";
import { useGetAssetContractTypesGateway } from "../../../hooks/useGetAssetContractTypesGateway";
import { useGetAssetAccessTypesGateway } from "../../../hooks/useGetAssetAccessTypesGateway";
import { useAssetsAppConfigGateway } from "../../../hooks/useAssetsAppConfigGateway";
import SelectControl from "../../../components/common/SelectControl";
import { routeNames } from "../../../routes/routes";
import { useAuth } from "../../../contexts/AuthContext";
import { Toast } from "../../../components/common/ToastView";

const Add = () => {
  let $ = window.$;
  let formErrors = {};

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtpropertytitle: "",
    txtdescription: "",
    txtaddressone: "",
    txtaddresstwo: "",
    txtzip: "",
    txtprice: "",
    txtadvance: "",
    txtsqfeet: "",
    txtbrokerpercentage: "0",
    owners: [],
  });

  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const { assetTypesList } = useGetAssetTypesGateway("", 1);
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  const { assetContractTypesList } = useGetAssetContractTypesGateway("", 1);
  const [selectedContractType, setSelectedContractType] = useState(null);

  const { assetAccessTypesList } = useGetAssetAccessTypesGateway("", 1);
  const [selectedAccessType, setSelectedAccessType] = useState(null);

  const { assetsAppConfigList } = useAssetsAppConfigGateway();
  const [selectedBedRooms, setSelectedBedRooms] = useState(null);
  const [selectedBathRooms, setSelectedBathRooms] = useState(null);

  const [ownerdivs, setOwnerDivs] = useState([]);
  const [ownerFormData, setOwnerFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [initApisLoaded, setinitApisLoaded] = useState(false);

  //Load
  useEffect(() => {
    Promise.allSettled([getCountries()]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {};
  }, []);

  //Get countries.
  const getCountries = () => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCountries}`, {})
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setCountriesData(objResponse.Data);
        } else {
          setCountriesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCountries}, Error ::" ${err}`);
        setCountriesData([]);
      })
      .finally(() => {
        setCountrySelected({});
      });
  };

  //Get States.
  const getStates = (countryid) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlStates}`, {
      CountryId: parseInt(countryid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setStatesData(objResponse.Data);
        } else {
          setStatesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlStates}, Error ::" ${err}`);
        setStatesData([]);
      })
      .finally(() => {
        setStateSelected({});
      });
  };

  //Get cities.
  const getCities = (stateid) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCities}`, {
      StateId: parseInt(stateid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setCitiesData(objResponse.Data);
        } else {
          setCitiesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCities}, Error ::" ${err}`);
        setCitiesData([]);
      })
      .finally(() => {
        setCitySelected({});
      });
  };

  const handleCountryChange = (selItem) => {
    setStateSelected(null);
    setStatesData([]);
    setCitySelected(null);
    setCitiesData([]);

    setCountrySelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getStates(selItem?.value);
  };

  const handleStateChange = (selItem) => {
    setCitySelected(null);
    setCitiesData([]);

    setStateSelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getCities(selItem?.value);
  };

  const handleCityChange = (selItem) => {
    setCitySelected(selItem);
  };

  const handleAssetTypeChange = (e) => {
    setSelectedAssetType(e?.value);
  };

  const handleContractTypeChange = (e) => {
    setSelectedContractType(e?.value);
  };

  const handleAccessTypeChange = (e) => {
    setSelectedAccessType(e?.value);
  };

  const handleBedroomsChange = (e) => {
    setSelectedBedRooms(e?.value);
  };

  const handleBathRoomsChange = (e) => {
    setSelectedBathRooms(e?.value);
  };

  const addOwnersDiv = () => {
    let ownerdivscount = ownerdivs.length + 1;
    setOwnerDivs([...ownerdivs, { id: Date.now() + 1 }]);

    const curretOwnerFormData = {
      [`txtname${ownerdivscount}`]: "",
      [`txtemail${ownerdivscount}`]: "",
      [`txtmobile${ownerdivscount}`]: "",
      [`txtaddressone${ownerdivscount}`]: "",
      [`txtaddresstwo${ownerdivscount}`]: "",
      [`txtzip${ownerdivscount}`]: "",
      [`ddlcountry${ownerdivscount}`]: 0,
      [`ddlstate${ownerdivscount}`]: 0,
      [`ddlcity${ownerdivscount}`]: 0,
    };

    setOwnerFormData({
      ...ownerFormData,
      ...curretOwnerFormData,
    });
  };

  const removeOwnersDiv = (id, idx) => {
    let idxnext = idx + 1;
    const curretOwnerFormData = {
      [`txtname${idx}`]: ownerFormData[`txtname${idxnext}`],
      [`txtemail${idx}`]: ownerFormData[`txtemail${idxnext}`],
      [`txtmobile${idx}`]: ownerFormData[`txtmobile${idxnext}`],
      [`txtaddressone${idx}`]: ownerFormData[`txtaddressone${idxnext}`],
      [`txtaddresstwo${idx}`]: ownerFormData[`txtaddresstwo${idxnext}`],
      [`txtzip${idx}`]: ownerFormData[`txtzip${idxnext}`],
      [`ddlcountry${idx}`]: 0, //ownerFormData[`ddlcountry${idxnext}`],
      [`ddlstate${idx}`]: 0,
      [`ddlcity${idx}`]: 0,
    };

    setOwnerDivs(ownerdivs.filter((div) => div.id !== id));

    setOwnerFormData({
      ...ownerFormData,
      ...curretOwnerFormData,
    });
    // setOwnerFormData({
    //   ...ownerFormData,
    // });
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOwnerControlsChange = (e) => {
    const { name, value } = e?.target;
    setOwnerFormData({
      ...ownerFormData,
      [name]: value,
    });
  };

  const handleOwnerCountryChange = (selItem, ctlidx) => {
    setDdlOptions(`ddlstate${ctlidx}`, "loading");
    let selCountryId = parseInt(selItem?.target?.value);
    setOwnerFormData({
      ...ownerFormData,
      [`ddlcountry${ctlidx}`]: selCountryId,
      [`ddlstate${ctlidx}`]: 0,
      [`ddlcity${ctlidx}`]: 0,
    });

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlStates}`, {
      CountryId: parseInt(selCountryId),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setDdlOptions(`ddlstate${ctlidx}`, objResponse.Data, "Id", "Text");
        } else {
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlStates}, Error ::" ${err}`);
      })
      .finally(() => {});
  };

  const handleOwnerStateChange = (selItem, ctlidx) => {
    setDdlOptions(`ddlcity${ctlidx}`, "loading");
    let selStateId = parseInt(selItem?.target?.value);
    setOwnerFormData({
      ...ownerFormData,
      [`ddlstate${ctlidx}`]: selStateId,
      [`ddlcity${ctlidx}`]: 0,
    });

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCities}`, {
      StateId: parseInt(selStateId),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setDdlOptions(`ddlcity${ctlidx}`, objResponse.Data, "Id", "Text");
        } else {
          objResponse.Data = { Id: 0, Text: AppMessages.NoCities };
          setDdlOptions(`ddlcity${ctlidx}`, objResponse.Data, "Id", "Text");
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCities}, Error ::" ${err}`);
        let Nodata = { Id: 0, Text: AppMessages.NoCities };
        setDdlOptions(`ddlcity${ctlidx}`, Nodata, "Id", "Text");
      })
      .finally(() => {});
  };

  const handleOwnerCityChange = (selItem, ctlidx) => {
    let selCityId = parseInt(selItem?.target?.value);
    setOwnerFormData({
      ...ownerFormData,
      [`ddlcity${ctlidx}`]: selCityId,
    });

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleFileRemove = (e, index) => {
    e.preventDefault();
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const onSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#form-error";
    $(errctl).html("");

    if (checkObjNullorEmpty(countrySelected)) {
      formErrors["ddlcountries"] = ValidationMessages.CountryReq;
    }

    if (checkObjNullorEmpty(stateSelected)) {
      formErrors["ddlstates"] = ValidationMessages.StateReq;
    }

    if (checkObjNullorEmpty(citySelected)) {
      formErrors["ddlcities"] = ValidationMessages.CityReq;
    }

    if (checkEmptyVal(selectedContractType)) {
      formErrors["ddlcontracttype"] = ValidationMessages.ContractTypeReq;
    }

    if (checkEmptyVal(selectedAccessType)) {
      formErrors["ddlaccesstype"] = ValidationMessages.AccessTypeReq;
    }

    if (checkEmptyVal(selectedAssetType)) {
      formErrors["ddlassettype"] = ValidationMessages.AssetTypeReq;
    }

    // if (checkObjNullorEmpty(selectedBedRooms)) {
    //   formErrors["ddlbedrooms"] = ValidationMessages.BedroomsReq;
    // }

    // if (checkObjNullorEmpty(selectedBathRooms)) {
    //   formErrors["ddlbathrooms"] = ValidationMessages.BathroomsReq;
    // }

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      setErrors({});
      let isapimethoderr = false;
      let ownerDivsValerror = false;

      let objBodyParams = new FormData();

      for (let od = 0; od <= ownerdivs.length - 1; od++) {
        let idx = od + 1;
        if (
          !checkEmptyVal(ownerFormData[`txtname${idx}`]) &&
          !checkEmptyVal(ownerFormData[`txtemail${idx}`]) &&
          !checkEmptyVal(ownerFormData[`txtmobile${idx}`]) &&
          !checkEmptyVal(ownerFormData[`txtaddressone${idx}`]) &&
          !checkEmptyVal(ownerFormData[`txtzip${idx}`]) &&
          !checkEmptyVal(ownerFormData[`ddlcountry${idx}`]) &&
          ownerFormData[`ddlcountry${idx}`] != "0" &&
          !checkEmptyVal(ownerFormData[`ddlstate${idx}`]) &&
          ownerFormData[`ddlstate${idx}`] != "0" &&
          !checkEmptyVal(ownerFormData[`ddlcity${idx}`]) &&
          ownerFormData[`ddlcity${idx}`] != "0"
        ) {
          objBodyParams.append(`Owners[${od}].OwnerId`, 0);
          objBodyParams.append(
            `Owners[${od}].Name`,
            ownerFormData[`txtname${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].Email`,
            ownerFormData[`txtemail${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].Mobile`,
            ownerFormData[`txtmobile${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].AddressOne`,
            ownerFormData[`txtaddressone${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].AddressTwo`,
            checkEmptyVal(ownerFormData[`txtaddresstwo${idx}`]) == true
              ? ""
              : ownerFormData[`txtaddresstwo${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].CountryId`,
            ownerFormData[`ddlcountry${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].StateId`,
            ownerFormData[`ddlstate${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].CityId`,
            ownerFormData[`ddlcity${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].Zip`,
            ownerFormData[`txtzip${idx}`]
          );
        } else {
          ownerDivsValerror = true;
          $(`#ownervalerr-${idx}`).html("All * fields are mandatory.");
          $(`#ownervalerr-${idx}`).next("button").focus();
        }
      }
      if (ownerDivsValerror == false) {
        objBodyParams.append("AssetId", 0);
        objBodyParams.append(
          "ProfileId",
          parseInt(GetUserCookieValues(UserCookie.ProfileId, loggedinUser))
        );
        objBodyParams.append(
          "AccountId",
          parseInt(GetUserCookieValues(UserCookie.AccountId, loggedinUser))
        );

        objBodyParams.append("Title", formData.txtpropertytitle);
        objBodyParams.append("Description", formData.txtdescription);
        objBodyParams.append("AddressOne", formData.txtaddressone);
        objBodyParams.append(
          "AddressTwo",
          checkEmptyVal(formData.txtaddresstwo) ? "" : formData.txtaddresstwo
        );
        objBodyParams.append(
          "CountryId",
          parseInt(setSelectDefaultVal(countrySelected))
        );
        objBodyParams.append(
          "StateId",
          parseInt(setSelectDefaultVal(stateSelected))
        );
        objBodyParams.append(
          "CityId",
          parseInt(setSelectDefaultVal(citySelected))
        );
        objBodyParams.append("Zip", formData.txtzip);
        objBodyParams.append(
          "AssetTypeId",
          parseInt(setSelectDefaultVal(selectedAssetType))
        );
        objBodyParams.append(
          "ContractTypeId",
          parseInt(setSelectDefaultVal(selectedContractType))
        );
        objBodyParams.append("Price", formData.txtprice);

        objBodyParams.append(
          "Advance",
          checkEmptyVal(formData.txtadvance) ? 0 : formData.txtadvance
        );

        objBodyParams.append(
          "AccessTypeId",
          parseInt(setSelectDefaultVal(selectedAccessType))
        );
        objBodyParams.append("Sqfeet", formData.txtsqfeet);
        objBodyParams.append("Bedrooms", setSelectDefaultVal(selectedBedRooms));
        objBodyParams.append(
          "Bathrooms",
          setSelectDefaultVal(selectedBathRooms)
        );
        objBodyParams.append(
          "BrokerPercentage",
          checkEmptyVal(formData.txtbrokerpercentage)
            ? 0
            : formData.txtbrokerpercentage
        );

        selectedFiles.forEach((file, idx) => {
          objBodyParams.append(`Images[${idx}].Id`, 0);
          objBodyParams.append(`Images[${idx}].DisplayOrder`, idx + 1);
          objBodyParams.append(`Images[${idx}].File`, file);
        });

        axiosPost(`${config.apiBaseUrl}${ApiUrls.addAsset}`, objBodyParams, {
          "Content-Type": "multipart/form-data",
        })
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (
                objResponse.Data != null &&
                objResponse.Data?.StatusCode > 0 &&
                objResponse.Data?.AssetId > 0
              ) {
                Toast.success(AppMessages.AddPropertySuccess);
                navigate(routeNames.userproperties.path);
              } else {
                Toast.error(objResponse.Data.Message);
                $(errctl).html(objResponse.Data.Message);
              }
            } else {
              isapimethoderr = true;
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            console.error(`"API :: ${ApiUrls.addAsset}, Error ::" ${err}`);
          })
          .finally(() => {
            if (isapimethoderr == true) {
              Toast.error(AppMessages.SomeProblem);
              $(errctl).html(AppMessages.SomeProblem);
            }
            apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
          });
      } else {
        apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
      }
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onCancel = (e) => {
    navigate(routeNames.userproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Add Property</h5>
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  <div className="widget bg-white box-shadow rounded px-0 mb-20">
                    <h6 className="mb-20 down-line pb-10 px-20 down-line-mx20">
                      My Properties
                    </h6>
                    <ul className="nav-page-lnk">
                      <li className="dropdown-item px-40">
                        <Link
                          id="page-lnk-viewproperties"
                          to={routeNames.userproperties.path}
                          className="page-lnk font-general"
                        >
                          <i className="fa fa-eye pe-1"></i> View Properties
                        </Link>
                      </li>

                      <li className="dropdown-item px-40">
                        <Link
                          id="page-lnk-addproperty"
                          to={routeNames.addproperty.path}
                          className="page-lnk font-general"
                        >
                          <i className="fa fa-edit pe-1"></i> Add Property
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-xl-9 col-lg-8">
                  <form noValidate>
                    {/*============== Propertyinfo Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-4 down-line  pb-10">
                              Property Info
                            </h6>
                            <div className="row">
                              <div className="col-md-12 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtpropertytitle"
                                  ctlType={formCtrlTypes.propertytitle}
                                  isFocus={true}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtpropertytitle}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={1}
                                ></InputControl>
                              </div>
                              <div className="col-md-12 mb-15">
                                <TextAreaControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtdescription"
                                  ctlType={formCtrlTypes.description}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtdescription}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={2}
                                  rows={6}
                                ></TextAreaControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtaddressone"
                                  ctlType={formCtrlTypes.addressone}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtaddressone}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={3}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtaddresstwo"
                                  ctlType={formCtrlTypes.addresstwo}
                                  onChange={handleChange}
                                  value={formData.txtaddresstwo}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={4}
                                ></InputControl>
                              </div>
                              {initApisLoaded && (
                                <>
                                  <div className="col-md-6 mb-15">
                                    <AsyncSelect
                                      placeHolder={
                                        countriesData.length <= 0 &&
                                        countrySelected == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        countriesData.length <= 0 &&
                                        countrySelected == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.NoCountries
                                      }
                                      options={countriesData}
                                      onChange={handleCountryChange}
                                      value={countrySelected}
                                      name="ddlcountries"
                                      lbl={formCtrlTypes.country}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={5}
                                    ></AsyncSelect>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <AsyncSelect
                                      placeHolder={
                                        countrySelected == null ||
                                        Object.keys(countrySelected).length ===
                                          0
                                          ? AppMessages.DdlDefaultSelect
                                          : statesData.length <= 0 &&
                                            stateSelected == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        countrySelected == null ||
                                        Object.keys(countrySelected).length ===
                                          0
                                          ? AppMessages.NoStates
                                          : statesData.length <= 0 &&
                                            stateSelected == null &&
                                            countrySelected != null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.NoStates
                                      }
                                      options={statesData}
                                      onChange={handleStateChange}
                                      value={stateSelected}
                                      name="ddlstates"
                                      lbl={formCtrlTypes.state}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={6}
                                    ></AsyncSelect>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <AsyncSelect
                                      placeHolder={
                                        stateSelected == null ||
                                        Object.keys(stateSelected).length === 0
                                          ? AppMessages.DdlDefaultSelect
                                          : citiesData.length <= 0 &&
                                            citySelected == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        stateSelected == null ||
                                        Object.keys(stateSelected).length === 0
                                          ? AppMessages.NoCities
                                          : citiesData.length <= 0 &&
                                            citySelected == null &&
                                            stateSelected != null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.NoCities
                                      }
                                      options={citiesData}
                                      onChange={handleCityChange}
                                      value={citySelected}
                                      name="ddlcities"
                                      lbl={formCtrlTypes.city}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={7}
                                    ></AsyncSelect>
                                  </div>
                                </>
                              )}
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtzip"
                                  ctlType={formCtrlTypes.zip}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtzip}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={8}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    assetTypesList.length <= 0 &&
                                    selectedAssetType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetTypesList.length <= 0 &&
                                    selectedAssetType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={assetTypesList}
                                  dataKey="AssetTypeId"
                                  dataVal="AssetType"
                                  onChange={handleAssetTypeChange}
                                  value={selectedAssetType}
                                  name="ddlassettype"
                                  lbl={formCtrlTypes.assettype}
                                  lblClass="mb-0 lbl-req-field"
                                  className="ddlborder"
                                  isClearable={false}
                                  required={true}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={9}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    assetContractTypesList.length <= 0 &&
                                    selectedContractType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetContractTypesList.length <= 0 &&
                                    selectedContractType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={assetContractTypesList}
                                  dataKey="ContractTypeId"
                                  dataVal="ContractType"
                                  onChange={handleContractTypeChange}
                                  value={selectedContractType}
                                  name="ddlcontracttype"
                                  lbl={formCtrlTypes.assetcontracttype}
                                  lblClass="mb-0 lbl-req-field"
                                  className="ddlborder"
                                  isClearable={false}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={10}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtprice"
                                  ctlType={formCtrlTypes.amount}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtprice}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={11}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtadvance"
                                  ctlType={formCtrlTypes.advance}
                                  onChange={handleChange}
                                  value={formData.txtadvance}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={12}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    assetAccessTypesList.length <= 0 &&
                                    selectedAccessType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetAccessTypesList.length <= 0 &&
                                    selectedAccessType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={assetAccessTypesList}
                                  dataKey="AccessTypeId"
                                  dataVal="AccessType"
                                  onChange={handleAccessTypeChange}
                                  value={selectedAccessType}
                                  name="ddlaccesstype"
                                  lbl={formCtrlTypes.assetaccesstype}
                                  lblClass="mb-0 lbl-req-field"
                                  className="ddlborder"
                                  isClearable={false}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={13}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtsqfeet"
                                  ctlType={formCtrlTypes.sqfeet}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtsqfeet}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={14}
                                ></InputControl>
                              </div>
                              <div className="col-md-4 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    assetsAppConfigList?.["BedRooms"]?.length <=
                                      0 && selectedBedRooms == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetsAppConfigList?.["BedRooms"]?.length <=
                                      0 && selectedBedRooms == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={assetsAppConfigList?.BedRooms}
                                  dataType="string"
                                  onChange={handleBedroomsChange}
                                  value={selectedBedRooms}
                                  name="ddlbedrooms"
                                  lbl={formCtrlTypes.bedrooms}
                                  lblClass="mb-0"
                                  className="ddlborder"
                                  isClearable={false}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={15}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-4 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    assetsAppConfigList?.["BathRooms"]
                                      ?.length <= 0 && selectedBathRooms == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    assetsAppConfigList?.["BathRooms"]
                                      ?.length <= 0 && selectedBathRooms == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={assetsAppConfigList?.BathRooms}
                                  dataType="string"
                                  onChange={handleBathRoomsChange}
                                  value={selectedBathRooms}
                                  name="ddlbathrooms"
                                  lbl={formCtrlTypes.bathrooms}
                                  lblClass="mb-0"
                                  className="ddlborder"
                                  isClearable={false}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={16}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-4 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtbrokerpercentage"
                                  ctlType={formCtrlTypes.brokerpercentage}
                                  onChange={handleChange}
                                  value={formData.txtbrokerpercentage}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={17}
                                ></InputControl>
                              </div>
                            </div>
                            <hr className="w-100 text-primary my-20"></hr>
                            <div className="col-md-12 text-right">
                              <button
                                className="btn btn-primary btn-glow btn-xs rounded box-shadow"
                                name="btnaddowners"
                                id="btnaddowners"
                                type="button"
                                onClick={addOwnersDiv}
                              >
                                Add Owners
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Propertyinfo End ==============*/}

                    {/*============== Add Owners Start ==============*/}
                    {ownerdivs.map((div, idx) => (
                      <>
                        <span className="d-none">{(idx = idx + 1)}</span>
                        <div
                          className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded"
                          key={`ownerinfo-${idx}`}
                          ownerid={0}
                        >
                          <div className="container-fluid">
                            <div className="row">
                              <div className="col px-0">
                                <div className="row mx-0 px-0">
                                  <h6 className="col mx-0 px-0 mb-4 down-line pb-10">
                                    Property Owner - {idx}
                                  </h6>
                                  <div className="col-auto px-0 mx-0">
                                    <button
                                      type="button"
                                      className="btn btn-glow px-0"
                                      onClick={addOwnersDiv}
                                    >
                                      <i className="fa font-extra-large fa-plus-circle text-primary box-shadow lh-1 rounded-circle"></i>
                                    </button>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-12 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtname${idx}`}
                                      ctlType={formCtrlTypes.name}
                                      isFocus={true}
                                      onChange={handleOwnerControlsChange}
                                      value={ownerFormData[`txtname${idx}`]}
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtemail${idx}`}
                                      ctlType={formCtrlTypes.email}
                                      onChange={handleOwnerControlsChange}
                                      value={ownerFormData[`txtemail${idx}`]}
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtmobile${idx}`}
                                      ctlType={formCtrlTypes.mobile}
                                      onChange={handleOwnerControlsChange}
                                      value={ownerFormData[`txtmobile${idx}`]}
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtaddressone${idx}`}
                                      ctlType={formCtrlTypes.addressone}
                                      onChange={handleOwnerControlsChange}
                                      value={
                                        ownerFormData[`txtaddressone${idx}`]
                                      }
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0"
                                      name={`txtaddresstwo${idx}`}
                                      ctlType={formCtrlTypes.addresstwo}
                                      onChange={handleOwnerControlsChange}
                                      value={
                                        ownerFormData[`txtaddresstwo${idx}`]
                                      }
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                  {initApisLoaded && (
                                    <>
                                      <div className="col-md-6 mb-15">
                                        <SelectControl
                                          lblClass="mb-0 lbl-req-field"
                                          name={`ddlcountry${idx}`}
                                          ctlType={formCtrlTypes.country}
                                          options={[
                                            { Id: 0, Text: "Select" },
                                            ...countriesData,
                                          ]}
                                          dataKey="Text"
                                          dataValue="Id"
                                          onChange={(e) =>
                                            handleOwnerCountryChange(e, idx)
                                          }
                                          value={
                                            ownerFormData[`ddlcountry${idx}`]
                                          }
                                          errors={errors}
                                          formErrors={formErrors}
                                        ></SelectControl>
                                      </div>
                                      <div className="col-md-6 mb-15">
                                        <SelectControl
                                          lblClass="mb-0 lbl-req-field"
                                          name={`ddlstate${idx}`}
                                          ctlType={formCtrlTypes.state}
                                          options={[{ Id: 0, Text: "Select" }]}
                                          dataKey="Text"
                                          dataValue="Id"
                                          onChange={(e) =>
                                            handleOwnerStateChange(e, idx)
                                          }
                                          value={
                                            ownerFormData[`ddlstate${idx}`]
                                          }
                                          errors={errors}
                                          formErrors={formErrors}
                                        ></SelectControl>
                                      </div>
                                      <div className="col-md-6 mb-15">
                                        <SelectControl
                                          lblClass="mb-0 lbl-req-field"
                                          name={`ddlcity${idx}`}
                                          ctlType={formCtrlTypes.city}
                                          options={[{ Id: 0, Text: "Select" }]}
                                          dataKey="Text"
                                          dataValue="Id"
                                          onChange={(e) =>
                                            handleOwnerCityChange(e, idx)
                                          }
                                          value={ownerFormData[`ddlcity${idx}`]}
                                          errors={errors}
                                          formErrors={formErrors}
                                        ></SelectControl>
                                      </div>
                                    </>
                                  )}
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtzip${idx}`}
                                      ctlType={formCtrlTypes.zip}
                                      onChange={handleOwnerControlsChange}
                                      value={ownerFormData[`txtzip${idx}`]}
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></InputControl>
                                  </div>
                                </div>
                              </div>
                              <hr className="w-100 text-primary my-20 px-0"></hr>
                              <div className="col-md-12 text-right px-0">
                                <span
                                  id={`ownervalerr-${idx}`}
                                  className="form-error mr-30"
                                ></span>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-xs btn-glow rounded box-shadow"
                                  onClick={() => removeOwnersDiv(div.id, idx)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}

                    {/*============== Add Owners End ==============*/}

                    {/*============== Propertymedia Start ==============*/}
                    <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-4 down-line pb-10">
                              Property Media
                            </h6>
                            <div className="row">
                              {selectedFiles.length > 0 && (
                                <div className="col-md-12 mt-0 mb-20">
                                  <ul className="row row-cols-xl-6 row-cols-md-3 row-cols-2 media-upload">
                                    {selectedFiles.map((file, index) => (
                                      <li className="col bg-light border rounded m-10 p-0">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          className="py-0"
                                          alt={file.name}
                                        />
                                        <a
                                          href="#"
                                          title="Remove image"
                                          onClick={(e) =>
                                            handleFileRemove(e, index)
                                          }
                                        >
                                          <i className="fas fa-trash btn-danger" />
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="col-md-10 mb-20 mx-auto">
                                <input
                                  type="file"
                                  id="imgupload"
                                  className="d-none"
                                  multiple
                                  onChange={handleFileChange}
                                />
                                <label
                                  className="fileupload_label border rounded font-large"
                                  htmlFor="imgupload"
                                >
                                  <i
                                    className="fa fa-cloud-upload mb-20 upload-icon d-flex flex-center"
                                    aria-hidden="true"
                                  ></i>
                                  Drop your photos here or Click
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Propertymedia End ==============*/}

                    <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row form-action flex-center">
                          <div
                            className="col-md-6 px-0 form-error"
                            id="form-error"
                          ></div>
                          <div className="col-md-6 px-0">
                            <button
                              className="btn btn-secondary"
                              id="btnCancel"
                              onClick={onCancel}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              id="btnSave"
                              onClick={onSave}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Add;
