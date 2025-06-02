import React, { useCallback, useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useNavigate } from "react-router-dom";
import TextAreaControl from "../../../components/common/TextAreaControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppConstants,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { useGetAssetTypesGateway } from "../../../hooks/useGetAssetTypesGateway";
import { useAssetsAppConfigGateway } from "../../../hooks/useAssetsAppConfigGateway";
import { routeNames } from "../../../routes/routes";
import { useAuth } from "../../../contexts/AuthContext";
import { Toast } from "../../../components/common/ToastView";
import { useGetAreaUnitTypesGateway } from "../../../hooks/useGetAreaUnitTypesGateway";
import { useGetAssetOwnershipStatusTypesGateway } from "../../../hooks/useGetAssetOwnershipStatusTypesGateway";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import { useDropzone } from "react-dropzone";
import GoBackPanel from "../../../components/common/GoBackPanel";

const AddResidentialProperty = () => {
  let $ = window.$;
  let formErrors = {};

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let loggedinUserDetails = {
    Name: GetUserCookieValues(UserCookie.Name, loggedinUser),
    ProfileType: GetUserCookieValues(UserCookie.ProfileType, loggedinUser),
    PicPath: GetUserCookieValues(UserCookie.ProfilePic, loggedinUser),
  };

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtdescription: "",
    txtaddressone: "",
    txtaddresstwo: "",
    txtzip: "",
    txtarea: "",
    txtnooffloors: "",
    owners: [],
  });

  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const { assetTypesList } = useGetAssetTypesGateway(
    "",
    1,
    parseInt(config.assetClassificationTypes.Residential)
  );
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  const { areaUnitTypesList } = useGetAreaUnitTypesGateway("", 1);
  const [selectedAreaUnitType, setselectedAreaUnitType] = useState(2);

  const { assetOwnershipStatusTypes } =
    useGetAssetOwnershipStatusTypesGateway();

  const { assetsAppConfigList } = useAssetsAppConfigGateway();
  const [selectedBedRooms, setSelectedBedRooms] = useState(null);
  const [selectedBathRooms, setSelectedBathRooms] = useState(null);

  const [ownerdivs, setOwnerDivs] = useState([]);
  const [ownerFormData, setOwnerFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [initApisLoaded, setinitApisLoaded] = useState(false);

  //Load
  useEffect(() => {
    Promise.allSettled([getUserDetails()]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {};
  }, []);

  const getUserDetails = () => {
    let objParams = {
      // AccountId: accountId,
      ProfileId: profileid,
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          let details = objResponse.Data;
          if (checkObjNullorEmpty(details) == false) {
            setFormData({
              ...formData,
              txtaddressone: details.AddressOne,
              txtaddresstwo: details.AddressTwo,
              txtzip: details.Zip,
            });
            getCountries(details);
          }
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
      })
      .finally(() => {});
  };

  //Get countries.
  const getCountries = (userDetails) => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCountries}`, {})
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setCountriesData(objResponse.Data);
          if (checkObjNullorEmpty(userDetails) == false) {
            handleCountryChange(
              { value: userDetails.CountryId, label: userDetails.Country },
              { value: userDetails.StateId, label: userDetails.State },
              { value: userDetails.CityId, label: userDetails.City }
            );
          }
        } else {
          setCountriesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCountries}, Error ::" ${err}`);
        setCountriesData([]);
      })
      .finally(() => {});
  };

  //Get States.
  const getStates = (countryid, selState, selCity) => {
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
        if (!checkObjNullorEmpty(selState) && checkEmptyVal(selState?.action)) {
          handleStateChange(selState, selCity);
        } else {
          setStateSelected({});
        }
      });
  };

  //Get cities.
  const getCities = (stateid, selCity) => {
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
        if (!checkObjNullorEmpty(selCity) && checkEmptyVal(selCity?.action)) {
          handleCityChange(selCity);
        } else {
          setCitySelected({});
        }
      });
  };
  //Get joined Owners
  const getJoinedUsers = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];

    let objParams = {
      keyword: searchValue,
      inviterid: profileid,
      InviterProfileTypeId: parseInt(config.userProfileTypes.Owner),
      InviteeProfileTypeId: parseInt(config.userProfileTypes.Owner),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlJoinedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          let data = Array.isArray(objResponse?.Data)
            ? [...objResponse.Data]
            : [];
          data.push({
            AccountId: accountid,
            ProfileId: profileid,
            FirstName: loggedinUserDetails?.Name || "",
            LastName: "",
            ProfileType: `${loggedinUserDetails?.ProfileType} - Self`,
            PicPath: loggedinUserDetails?.PicPath || "",
          });

          return data.map((item) => ({
            label: (
              <div className="flex items-center">
                <div className="w-40px h-40px mr-10 flex-shrink-0">
                  <img
                    alt=""
                    src={item.PicPath}
                    className="rounded cur-pointer w-40px"
                  />
                </div>
                <div>
                  <span className="text-primary lh-1 d-block">
                    {item.FirstName + " " + item.LastName}
                  </span>
                  <span className="small text-light">{item.ProfileType}</span>
                </div>
              </div>
            ),
            value: item.ProfileId,
            customlabel: item.FirstName + " " + item.LastName,
          }));
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        return [];
      });
  };

  const usersProfilesOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getJoinedUsers(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay),
    []
  );

  const handleCountryChange = (selItem, selState, selCity) => {
    setStateSelected(null);
    setStatesData([]);
    setCitySelected(null);
    setCitiesData([]);

    setCountrySelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
    getStates(selItem?.value, selState, selCity);
  };

  const handleStateChange = (selItem, selCity) => {
    setCitySelected(null);
    setCitiesData([]);

    setStateSelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getCities(selItem?.value, selCity);
  };

  const handleCityChange = (selItem) => {
    setCitySelected(selItem);
  };

  const handleAssetTypeChange = (e) => {
    setSelectedAssetType(e?.value);
  };

  const handleAreaUnitTypeChange = (e) => {
    setselectedAreaUnitType(e?.value);
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
      [`txtownerhsippercentage${ownerdivscount}`]: "0",
      [`ddlowners${ownerdivscount}`]: 0,
      [`ddlownershipstatus${ownerdivscount}`]: "A",
    };

    setOwnerFormData({
      ...ownerFormData,
      ...curretOwnerFormData,
    });
  };

  const removeOwnersDiv = (id, idx) => {
    let idxnext = idx + 1;
    const curretOwnerFormData = {
      [`txtownerhsippercentage${idx}`]:
        ownerFormData[`txtownerhsippercentage${idxnext}`],
      [`ddlowners${idx}`]: 0,
      [`ddlownershipstatus${idx}`]: "A",
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

  const handleDdlUsersProfilesChange = () => {
    usersProfilesOptions();
  };

  const handleOwnerChange = (selItem, ctlidx) => {
    if (selItem == null || selItem == undefined || selItem == "") {
      setOwnerFormData({
        ...ownerFormData,
        [`ddlowners${ctlidx}`]: 0,
      });
      return;
    } else {
      let selOwnerId = parseInt(selItem?.value);
      setOwnerFormData({
        ...ownerFormData,
        [`ddlowners${ctlidx}`]: selOwnerId,
      });
    }
  };

  const handleOwnershipStatusChange = (selItem, ctlidx) => {
    setOwnerFormData({
      ...ownerFormData,
      [`ddlownershipstatus${ctlidx}`]: selItem?.value,
    });

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const onDrop = (acceptedFiles) => {
    // Calculate total file size
    const totalAccepetedFileSize = acceptedFiles.reduce(
      (sum, file) => sum + file.size,
      0
    );

    const totalSelectedFilesSize = selectedFiles.reduce(
      (sum, file) => sum + file.file.size,
      0
    );

    if (
      totalAccepetedFileSize + totalSelectedFilesSize >
      config.fileUploadLimitations.maxUploadTotalSize
    ) {
      Toast.error(ValidationMessages.MaxFileSizeReached);
      return;
    }

    if (
      acceptedFiles.length + selectedFiles.length <=
      config.fileUploadLimitations.filesLimit
    ) {
      let selectedFiles = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedFiles((prevFiles) => [...selectedFiles, ...prevFiles]);
      //const files = Array.from(event.target.files);
      //setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    } else {
      Toast.error(ValidationMessages.MaxFileLimitReaced);
    }
  };

  const onDropRejected = (rejectedFiles) => {
    Toast.error(ValidationMessages.UploadValidFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: config.fileUploadLimitations.validImgTypes,
    multiple: true,
    noClick: false,
  });

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

    if (checkEmptyVal(selectedAssetType)) {
      formErrors["ddlassettype"] = ValidationMessages.AssetTypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      setErrors({});
      let isapimethoderr = false;
      let ownerDivsValerror = false;

      let objBodyParams = new FormData();

      for (let od = 0; od <= ownerdivs.length - 1; od++) {
        let idx = od + 1;

        if (
          !checkEmptyVal(ownerFormData[`ddlownershipstatus${idx}`]) &&
          !checkEmptyVal(ownerFormData[`ddlowners${idx}`]) &&
          ownerFormData[`ddlowners${idx}`] != "0"
        ) {
          objBodyParams.append(`Owners[${od}].OwnerId`, 0);
          objBodyParams.append(
            `Owners[${od}].ProfileId`,
            parseInt(ownerFormData[`ddlowners${idx}`])
          );
          objBodyParams.append(
            `Owners[${od}].OwnerShipStatus`,
            ownerFormData[`ddlownershipstatus${idx}`]
          );
          objBodyParams.append(
            `Owners[${od}].SharePercentage`,
            ownerFormData[`txtownerhsippercentage${idx}`]
          );
        } else {
          ownerDivsValerror = true;
          $(`#ownervalerr-${idx}`).html("All * fields are mandatory.");
          $(`#ownervalerr-${idx}`).next("button").focus();
        }
      }
      if (ownerDivsValerror == false) {
        objBodyParams.append("AssetId", 0);
        objBodyParams.append("ProfileId", profileid);
        objBodyParams.append("AccountId", accountid);
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
          "ClassificationTypeId",
          parseInt(config.assetClassificationTypes.Residential)
        );
        objBodyParams.append(
          "AssetTypeId",
          parseInt(setSelectDefaultVal(selectedAssetType))
        );
        objBodyParams.append("Area", formData.txtarea);
        objBodyParams.append(
          "AreaUnitTypeId",
          parseInt(setSelectDefaultVal(selectedAreaUnitType))
        );
        objBodyParams.append("Bedrooms", setSelectDefaultVal(selectedBedRooms));
        objBodyParams.append(
          "Bathrooms",
          setSelectDefaultVal(selectedBathRooms)
        );
        objBodyParams.append(
          "NoOfFloors",
          checkEmptyVal(formData.txtnooffloors) ? "0" : formData.txtnooffloors
        );

        selectedFiles.forEach((file, idx) => {
          objBodyParams.append(`Images[${idx}].Id`, 0);
          objBodyParams.append(`Images[${idx}].DisplayOrder`, idx + 1);
          objBodyParams.append(`Images[${idx}].File`, file.file);
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
                navigate(routeNames.ownerproperties.path);
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
    navigate(routeNames.ownerproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={onCancel}
                      >
                        Properties
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Residential Property
                      </span>
                    </div>
                  </div>
                </div>
                <GoBackPanel clickAction={onCancel} />
              </div>
              <div className="row">
                <div className="col-xl-7 col-lg-7">
                  <form noValidate>
                    {/*============== Propertyinfo Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-3 down-line  pb-10">
                              Property Info
                            </h6>
                            <div className="row">
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
                                  tabIndex={1}
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
                                  tabIndex={2}
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
                                      tabIndex={3}
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
                                      tabIndex={4}
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
                                      tabIndex={5}
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
                                  tabIndex={6}
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
                                  tabIndex={7}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <div className="row">
                                  <div className="col-7 pr-0">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name="txtarea"
                                      ctlType={formCtrlTypes.area}
                                      required={true}
                                      onChange={handleChange}
                                      value={formData.txtarea}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={8}
                                      inputClass="bo-r-0 br-r-0"
                                    ></InputControl>
                                  </div>
                                  <div className="col pl-0">
                                    <AsyncSelect
                                      placeHolder={
                                        areaUnitTypesList.length <= 0 &&
                                        selectedAreaUnitType == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        areaUnitTypesList.length <= 0 &&
                                        selectedAreaUnitType == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlNoData
                                      }
                                      options={areaUnitTypesList}
                                      dataKey="AreaUnitTypeId"
                                      dataVal="AreaUnitType"
                                      onChange={handleAreaUnitTypeChange}
                                      value={selectedAreaUnitType}
                                      name="ddlareaunittype"
                                      lbl={formCtrlTypes.areaunittype}
                                      lblClass="mb-0"
                                      lblText={" "}
                                      className="ddlborder br-l-0"
                                      isClearable={false}
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={9}
                                    ></AsyncSelect>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtnooffloors"
                                  ctlType={formCtrlTypes.nooffloors}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtnooffloors}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={10}
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
                                  tabIndex={11}
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
                                  tabIndex={12}
                                ></AsyncSelect>
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
                                  tabIndex={13}
                                  rows={4}
                                ></TextAreaControl>
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
                      <div key={`odiv-${idx}`}>
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
                                  <h6 className="col mx-0 px-0 mb-3 down-line pb-10">
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
                                  <div className="col-md-6 mb-15">
                                    <InputControl
                                      lblClass="mb-0 d-none"
                                      ctlType={formCtrlTypes.name}
                                      isFocus={true}
                                      inputClass="w-0 h-0 p-0"
                                    ></InputControl>
                                    <AsyncRemoteSelect
                                      placeHolder={AppMessages.DdlTypetoSearch}
                                      noData={AppMessages.NoOwners}
                                      loadOptions={usersProfilesOptions}
                                      handleInputChange={(e, val) => {
                                        handleDdlUsersProfilesChange(
                                          e,
                                          val.prevInputValue
                                        );
                                      }}
                                      onChange={(e) => {
                                        handleOwnerChange(e, idx);
                                      }}
                                      value={ownerFormData[`ddlowners${idx}`]}
                                      name={`ddlowners${idx}`}
                                      lblText="Owner:"
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      isClearable={true}
                                    ></AsyncRemoteSelect>
                                  </div>
                                  <div className="col-md-3 mb-15">
                                    <AsyncSelect
                                      placeHolder={AppMessages.DdlDefaultSelect}
                                      noData={AppMessages.NoData}
                                      options={assetOwnershipStatusTypes}
                                      dataKey="Id"
                                      dataVal="Type"
                                      onChange={(e) => {
                                        handleOwnershipStatusChange(e, idx);
                                      }}
                                      value={
                                        ownerFormData[
                                          `ddlownershipstatus${idx}`
                                        ]
                                      }
                                      name={`ddlownershipstatus${idx}`}
                                      lbl={formCtrlTypes.ownershipstatus}
                                      lblClass="mb-0 lbl-req-field"
                                      className="ddlborder"
                                      isClearable={false}
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                    ></AsyncSelect>
                                  </div>
                                  <div className="col-md-3 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name={`txtownerhsippercentage${idx}`}
                                      ctlType={
                                        formCtrlTypes.ownershippercentage
                                      }
                                      onChange={handleOwnerControlsChange}
                                      value={
                                        ownerFormData[
                                          `txtownerhsippercentage${idx}`
                                        ]
                                      }
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
                      </div>
                    ))}
                    {/*============== Add Owners End ==============*/}
                  </form>
                </div>
                <div className="col-xl-5 col-lg-5 md-mt-20">
                  {/*============== Propertymedia Start ==============*/}
                  <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                    <div className="container-fluid">
                      <div className="row">
                        <div className="col px-0">
                          <h6 className="mb-3 down-line pb-10">
                            Property Media
                          </h6>
                          <div
                            className="row"
                            {...getRootProps()}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {selectedFiles.length > 0 && (
                              <div className="col-md-12 mt-0 mb-20">
                                <ul className="row row-cols-xl-6 row-cols-md-3 row-cols-2 media-upload">
                                  {selectedFiles.map((file, index) => (
                                    <li className="col bg-light border rounded m-10 p-0">
                                      <img
                                        src={file.preview}
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
                            <div className="col-md-10 mb-20 mx-auto d-flex flex-center">
                              <input
                                type="file"
                                id="imgupload"
                                className="d-none"
                                multiple
                                //onChange={handleFileChange}
                                {...getInputProps()}
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
                </div>
                <div className="col-xl-7 col-lg-7">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddResidentialProperty;
