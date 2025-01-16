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
  SessionStorageKeys,
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
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { NoData } from "../../../components/common/LazyComponents";
import { useDropzone } from "react-dropzone";

const ManageCommercialProperty = () => {
  let $ = window.$;
  let formErrors = {};

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let editAssetId = parseInt(
    getsessionStorageItem(SessionStorageKeys.EditAssetId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [assetDetails, setAssetDetails] = useState([]);

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());

  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [ownerdivs, setOwnerDivs] = useState([]);
  const [ownerFormData, setOwnerFormData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { assetTypesList } = useGetAssetTypesGateway(
    "",
    1,
    parseInt(config.assetClassificationTypes.Commercial)
  );
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  const { areaUnitTypesList } = useGetAreaUnitTypesGateway("", 1);
  const [selectedAreaUnitType, setselectedAreaUnitType] = useState(2);

  const { assetOwnershipStatusTypes } =
    useGetAssetOwnershipStatusTypesGateway();

  const { assetsAppConfigList } = useAssetsAppConfigGateway();

  const [selectedBedRooms, setSelectedBedRooms] = useState(null);
  const [selectedBathRooms, setSelectedBathRooms] = useState(null);

  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [initApisLoaded, setinitApisLoaded] = useState(false);

  function setInitFormData(asssetDetails) {
    let initFormData = {
      txtpropertytitle: asssetDetails ? asssetDetails.Title : "",
      txtdescription: asssetDetails ? asssetDetails.Description : "",
      txtaddressone: asssetDetails ? asssetDetails.AddressOne : "",
      txtaddresstwo: asssetDetails ? asssetDetails.AddressTwo : "",
      txtzip: asssetDetails ? asssetDetails.Zip : "",
      txtprice: asssetDetails ? asssetDetails.Price : "0",
      txtadvance: asssetDetails ? asssetDetails.Advance : "0",
      txtarea: asssetDetails ? asssetDetails.Area : "0",
      txtnooffloors: asssetDetails ? asssetDetails.NoOfFloors : "0",
      owners: [],
    };

    if (!checkObjNullorEmpty(asssetDetails)) {
      if (asssetDetails.hasOwnProperty("Owners")) {
        if (asssetDetails["Owners"].length > 0) {
          setAssetsInitOwnersDivs();
        }
      }
    }

    if (!checkObjNullorEmpty(asssetDetails)) {
      if (asssetDetails.hasOwnProperty("Images")) {
        if (asssetDetails["Images"].length > 0) {
          let imageFiles = [];
          asssetDetails["Images"]?.forEach((i) => {
            imageFiles.push({
              id: i.Id,
              imgPath: i.ImagePath,
              assetId: i.AssetId,
            });
          });
          setSelectedFiles(imageFiles);
        }
      }
    }

    return initFormData;
  }

  const setAssetsInitOwnersDivs = () => {
    if (assetDetails?.hasOwnProperty("Owners")) {
      if (assetDetails["Owners"].length > 0) {
        let ownerDetails = [];

        assetDetails["Owners"]?.forEach((a, idx) => {
          ownerDetails.push({ id: Date.now() + idx, ownerId: a.OwnerId });
        });

        setOwnerDivs([...ownerDetails]);
        let ownerData = {};
        assetDetails["Owners"]?.forEach((a, idx) => {
          let i = idx + 1;
          let curretOwnerFormData = {
            [`ownerid${i}`]: a.OwnerId,
            [`txtownerhsippercentage${i}`]: a.SharePercentage,
            [`ddlownershipstatus${i}`]: a.OwnerShipStatus,
            [`ddlowners${i}`]: 0,
          };
          // const promise = new Promise((resolve, reject) => {
          //   resolve();
          //   reject();
          // });
          // promise.then(() => {
          curretOwnerFormData = {
            ...curretOwnerFormData,
            [`ddlowners${i}`]: a.ProfileId,
          };
          ownerData = { ...ownerData, ...curretOwnerFormData };
          setOwnerFormData({ ...ownerFormData, ...ownerData });
          // });
        });
      }
    }
  };

  useEffect(() => {
    Promise.allSettled([getJoinedUsers(), getAssetDetails()]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {
      //deletesessionStorageItem(SessionStorageKeys.EditAssetId);
    };
  }, []);

  const getAssetDetails = () => {
    if (editAssetId > 0) {
      let objParams = {
        AccountId: accountid,
        // ProfileId: profileid,
        AssetId: editAssetId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserAssetDetails}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let details = objResponse.Data;
            setAssetDetails(details);
            setFormData(setInitFormData(details));
            getCountries(details);
            setselectedAreaUnitType({
              value: details.AreaUnitTypeId,
              label: details.AreaUnitType,
            });
            setSelectedBedRooms({
              value: details.Bedrooms,
              label: details.Bedrooms,
            });
            setSelectedBathRooms({
              value: details.Bathrooms,
              label: details.Bathrooms,
            });
            setSelectedAssetType({
              value: details.AssetTypeId,
              label: details.AssetType,
            });
          } else {
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getUserAssetDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {});
    }
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

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  const removeAllOwnerDivs = () => {
    clearOwnersFormError();
    setOwnerDivs([]);
    setOwnerFormData([]);
  };

  const addOwnersDiv = () => {
    clearOwnersFormError();
    let ownerdivscount = ownerdivs.length + 1;
    setOwnerDivs([...ownerdivs, { id: Date.now() + 1, ownerId: 0 }]);

    const curretOwnerFormData = {
      [`ownerid${ownerdivscount}`]: 0,
      [`txtownerhsippercentage${ownerdivscount}`]: "0",
      [`ddlowners${ownerdivscount}`]: 0,
      [`ddlownershipstatus${ownerdivscount}`]: "A",
    };

    setOwnerFormData({
      ...ownerFormData,
      ...curretOwnerFormData,
    });
  };

  const removeOwnersDiv = (o, idx) => {
    clearOwnersFormError();
    let idxnext = idx + 1;
    if (!checkObjNullorEmpty(o) && o.ownerId > 0) {
      apiReqResLoader("x");
      let isapimethoderr = false;
      let objBodyParams = {
        OwnerId: parseInt(o.ownerId),
        AssetId: parseInt(editAssetId),
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.deleteAssetOwner}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 1) {
              const promise = new Promise((resolve, reject) => {
                getAssetDetails();
                resolve();
                reject();
              });
              promise.then(() => {
                setShowEditOwnersInfo(false);
              });
              Toast.success(AppMessages.DeleteAssetOwnerSuccess);
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
            `"API :: ${ApiUrls.deleteAssetOwner}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          } else {
            let remainownerdivs = ownerdivs.filter((div) => div.id !== o.id);
            if (remainownerdivs.length == 0) {
              setShowEditOwnersInfo(false);
              setOwnerDivs([]);
              setOwnerFormData([]);
            } else {
              setOwnerDivs(remainownerdivs);

              let curretOwnerFormData = {
                [`txtownerhsippercentage${o.id}`]:
                  ownerFormData[`txtownerhsippercentage${idxnext}`],
                [`ddlowners${o.id}`]: 0,
                [`ddlownershipstatus${o.id}`]: "A",
              };
              setOwnerFormData({
                ...ownerFormData,
                ...curretOwnerFormData,
              });
            }
          }
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      let curretOwnerFormData = {
        [`txtownerhsippercentage${idx}`]:
          ownerFormData[`txtownerhsippercentage${idxnext}`],
        [`ddlowners${idx}`]: 0,
        [`ddlownershipstatus${idx}`]: "A",
      };

      let remainownerdivs = ownerdivs.filter((div) => div.id !== o.id);

      if (remainownerdivs.length == 0) {
        setShowEditOwnersInfo(false);
        setOwnerDivs([]);
        setOwnerFormData([]);
      } else {
        setOwnerDivs(remainownerdivs);

        setOwnerFormData({
          ...ownerFormData,
          ...curretOwnerFormData,
        });
      }
    }
  };

  //Get joined Owners
  const getJoinedUsers = async () => {
    let objParams = {
      keyword: "",
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
          let data = objResponse.Data.map((item) => ({
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
          setJoinedUsersData(data);
        } else {
          setJoinedUsersData([]);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        setJoinedUsersData([]);
      });
  };

  const handleOwnerControlsChange = (e) => {
    const { name, value } = e?.target;
    setOwnerFormData({
      ...ownerFormData,
      [name]: value,
    });
  };

  const handleOwnerChange = (selItem, ctlidx) => {
    let selOwnerId = parseInt(selItem?.value);
    setOwnerFormData({
      ...ownerFormData,
      [`ddlowners${ctlidx}`]: selOwnerId,
    });

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
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

  const onDrop = (acceptedFiles) => {
    let selectedFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((prevFiles) => [...selectedFiles, ...prevFiles]);
    //const files = Array.from(event.target.files);
    //setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const onDropRejected = (rejectedFiles) => {
    Toast.error("Some files were rejected. Please upload valid files.");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: true,
    noClick: false,
  });

  const handleFileRemove = (e, index, assetImage) => {
    e.preventDefault();
    clearMediaFormError();
    if (!checkObjNullorEmpty(assetImage)) {
      apiReqResLoader("x");
      let isapimethoderr = false;
      let objBodyParams = {
        Id: parseInt(assetImage.id),
        AssetId: parseInt(assetImage.assetId),
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.deleteAssetImage}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 1) {
              getAssetDetails();
              Toast.success(AppMessages.DeleteImageSuccess);
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
            `"API :: ${ApiUrls.deleteAssetImage}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          } else {
            setSelectedFiles((prevFiles) =>
              prevFiles.filter((_, i) => i !== index)
            );
          }
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }
  };

  const resetImages = () => {
    setSelectedFiles([]);
    let imageFiles = [];
    if (assetDetails.hasOwnProperty("Images")) {
      if (assetDetails["Images"].length > 0) {
        assetDetails["Images"]?.forEach((i) => {
          imageFiles.push({
            id: i.Id,
            imgPath: i.ImagePath,
            assetId: i.AssetId,
          });
        });
        setSelectedFiles(imageFiles);
      }
    }
  };

  const [showEditPropertyInfo, setShowEditPropertyInfo] = useState(false);
  const togglePropertyInfo = (e) => {
    setShowEditPropertyInfo(!showEditPropertyInfo);
  };

  const [showEditOwnersInfo, setShowEditOwnersInfo] = useState(false);
  const toggleOwnersInfo = (e) => {
    clearOwnersFormError();
    setShowEditOwnersInfo(!showEditOwnersInfo);
  };

  const [showEditMediaInfo, setShowEditMediaInfo] = useState(false);
  const toggleMediaInfo = (e) => {
    clearMediaFormError();
    setShowEditMediaInfo(!showEditMediaInfo);
  };

  const clearMediaFormError = () => {
    let errctl = "#form-error-media";
    $(errctl).html("");
  };

  const clearOwnersFormError = () => {
    let errctl = "#form-error-owners";
    $(errctl).html("");
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
      let objBodyParams = new FormData();
      objBodyParams.append("AssetId", editAssetId);
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
        parseInt(config.assetClassificationTypes.Commercial)
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
      objBodyParams.append("Bathrooms", setSelectDefaultVal(selectedBathRooms));
      objBodyParams.append(
        "NoOfFloors",
        checkEmptyVal(formData.txtnooffloors) ? "0" : formData.txtnooffloors
      );

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.editAssetInformation}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (
              objResponse.Data != null &&
              objResponse.Data?.StatusCode > 0 &&
              objResponse.Data?.AssetId > 0
            ) {
              getAssetDetails();
              setShowEditPropertyInfo(false);
              Toast.success(AppMessages.UpdatePropertySuccess);
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
          console.error(
            `"API :: ${ApiUrls.editAssetInformation}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onSaveOwners = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearOwnersFormError();

    apiReqResLoader("btnSaveOwners", "Saving...");
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
        objBodyParams.append(
          `Owners[${od}].OwnerId`,
          ownerFormData[`ownerid${idx}`]
        );
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
      objBodyParams.append(`AssetId`, editAssetId);
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.addEditAssetOwners}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (
              objResponse.Data != null &&
              objResponse.Data?.StatusCode > 0 &&
              objResponse.Data?.AssetId > 0
            ) {
              const promise = new Promise((resolve, reject) => {
                getAssetDetails();
                resolve();
                reject();
              });
              promise.then(() => {
                setShowEditOwnersInfo(false);
              });
              Toast.success(AppMessages.AddAssetOwnersSuccess);
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
            `"API :: ${ApiUrls.addEditAssetOwners}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSaveOwners", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      apiReqResLoader("btnSaveOwners", "Save", API_ACTION_STATUS.COMPLETED);
      $("#form-error-owners").html(AppMessages.AssetImagesRequired);
    }
  };

  const onSaveImages = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearMediaFormError();

    let arrFilterExistingFiles = selectedFiles.filter(
      (item) => !item.hasOwnProperty("imgPath")
    );
    if (arrFilterExistingFiles.length > 0) {
      apiReqResLoader("btnSaveMedia", "Saving...");
      let isapimethoderr = false;
      let objBodyParams = new FormData();

      arrFilterExistingFiles.forEach((file, idx) => {
        objBodyParams.append(`Images[${idx}].Id`, 0);
        objBodyParams.append(`Images[${idx}].DisplayOrder`, idx + 1);
        objBodyParams.append(`Images[${idx}].File`, file.file);
      });

      objBodyParams.append(`AssetId`, editAssetId);

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.addEditAssetImages}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (
              objResponse.Data != null &&
              objResponse.Data?.StatusCode > 0 &&
              objResponse.Data?.AssetId > 0
            ) {
              const promise = new Promise((resolve, reject) => {
                getAssetDetails();
                resolve();
                reject();
              });
              promise.then(() => {
                //setShowEditMediaInfo(false);
              });
              Toast.success(AppMessages.AddPropertySuccess);
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
            `"API :: ${ApiUrls.addEditAssetImages}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSaveMedia", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $("#form-error-media").html(AppMessages.AssetImagesRequired);
    }
  };

  const onCancel = (e) => {
    navigate(routeNames.ownerproperties.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line pb-10">Commercial Property</h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnsendnotificationmodal"
                    id="btnsendnotificationmodal"
                    type="button"
                    onClick={onCancel}
                  >
                    <i className="icons font-18 icon-arrow-left-circle position-relative me-1 t-3"></i>{" "}
                    Back
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-7 col-lg-7">
                  <form noValidate>
                    {/*============== Propertyinfo Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <div className="row mx-0">
                              <div className="col-9 px-0">
                                <h6 className="mb-4 down-line  pb-10">
                                  Property Info
                                </h6>
                              </div>
                              {!showEditPropertyInfo && (
                                <div className="col-3 px-0 text-right">
                                  <i
                                    className="fa fa-pen text-primary cur-pointer font-16"
                                    onClick={(e) => {
                                      togglePropertyInfo(e);
                                    }}
                                  ></i>
                                </div>
                              )}
                            </div>
                            {!showEditPropertyInfo ? (
                              <div
                                className="row form-view"
                                id="divViewPropertyInfo"
                              >
                                <div className="col-md-6 mb-15">
                                  <span>AddressOne : </span>
                                  <span>{assetDetails?.AddressOne}</span>
                                </div>
                                <div className="col-md-6 mb-15 text-md-end">
                                  <span>AddressTwo : </span>
                                  <span>{assetDetails?.AddressTwo}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Country : </span>
                                  <span>{assetDetails?.Country}</span>
                                </div>
                                <div className="col-md-6 mb-15 text-md-end">
                                  <span>State : </span>
                                  <span>{assetDetails.State}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>City : </span>
                                  <span>{assetDetails?.City}</span>
                                </div>
                                <div className="col-md-6 mb-15 text-md-end">
                                  <span>Zip code : </span>
                                  <span>{assetDetails?.Zip}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Property type : </span>
                                  <span>{assetDetails?.AssetType}</span>
                                </div>
                                <div className="col-md-6 mb-15 text-md-end">
                                  <span>Area : </span>
                                  <span>
                                    {assetDetails?.Area}{" "}
                                    {assetDetails?.AreaUnitType}
                                  </span>
                                </div>
                                <div className="col-md-4 mb-15">
                                  <span>Noof floors : </span>
                                  <span>{assetDetails?.NoOfFloors}</span>
                                </div>
                                <div className="col-md-4 mb-15 text-md-center">
                                  <span>Bedrooms : </span>
                                  <span>{assetDetails?.Bedrooms}</span>
                                </div>
                                <div className="col-md-4 mb-15 text-md-end">
                                  <span>Bathrooms : </span>
                                  <span>{assetDetails?.Bathrooms}</span>
                                </div>
                                <div className="col-md-12 mb-15">
                                  <span>Description : </span>
                                  <span>{assetDetails?.Description}</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="row" id="divEditPropertyInfo">
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
                                            Object.keys(countrySelected)
                                              .length === 0
                                              ? AppMessages.DdlDefaultSelect
                                              : statesData.length <= 0 &&
                                                stateSelected == null
                                              ? AppMessages.DdLLoading
                                              : AppMessages.DdlDefaultSelect
                                          }
                                          noData={
                                            countrySelected == null ||
                                            Object.keys(countrySelected)
                                              .length === 0
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
                                            Object.keys(stateSelected)
                                              .length === 0
                                              ? AppMessages.DdlDefaultSelect
                                              : citiesData.length <= 0 &&
                                                citySelected == null
                                              ? AppMessages.DdLLoading
                                              : AppMessages.DdlDefaultSelect
                                          }
                                          noData={
                                            stateSelected == null ||
                                            Object.keys(stateSelected)
                                              .length === 0
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
                                        assetsAppConfigList?.["BedRooms"]
                                          ?.length <= 0 &&
                                        selectedBedRooms == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        assetsAppConfigList?.["BedRooms"]
                                          ?.length <= 0 &&
                                        selectedBedRooms == null
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
                                          ?.length <= 0 &&
                                        selectedBathRooms == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        assetsAppConfigList?.["BathRooms"]
                                          ?.length <= 0 &&
                                        selectedBathRooms == null
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
                                <div className="row form-action flex-center mx-0">
                                  <div
                                    className="col-md-6 px-0 form-error"
                                    id="form-error"
                                  ></div>
                                  <div className="col-md-6 px-0">
                                    <button
                                      className="btn btn-secondary"
                                      id="btnCancel"
                                      onClick={(e) => {
                                        togglePropertyInfo(e);
                                      }}
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
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Propertyinfo End ==============*/}

                    {/*============== Add Owners Start ==============*/}
                    {!showEditOwnersInfo ? (
                      <>
                        <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                          <div className="container-fluid">
                            <div className="row">
                              <div className="col px-0">
                                <div className="row mx-0">
                                  <div className="col-9 px-0">
                                    <h6 className="mb-4 down-line  pb-10">
                                      Property Owners
                                    </h6>
                                  </div>
                                  <div className="col-3 px-0 text-right">
                                    <i
                                      className="fa fa-pen text-primary cur-pointer font-16"
                                      onClick={(e) => {
                                        toggleOwnersInfo(e);
                                        assetDetails?.Owners?.length === 0
                                          ? addOwnersDiv()
                                          : removeAllOwnerDivs();
                                        setAssetsInitOwnersDivs();
                                      }}
                                    ></i>
                                  </div>
                                </div>
                                {assetDetails?.Owners?.length == 0 ? (
                                  <>
                                    <NoData
                                      message={AppMessages.NoOwners}
                                      className="mt-25 mb-40"
                                    ></NoData>
                                  </>
                                ) : (
                                  assetDetails?.Owners?.map((o, idx) => (
                                    <div className="row form-view">
                                      <div className="col-md-6 mb-15">
                                        <span>Owner : </span>
                                        <span>
                                          {o.FirstName} {o.LastName}
                                        </span>
                                      </div>
                                      <div className="col-md-6 mb-15 text-md-end">
                                        <span>Ownership status : </span>
                                        <span>{o.OwnerShipStatusDisplay}</span>
                                      </div>
                                      <div className="col-md-6 mb-15">
                                        <span>Ownership percentage : </span>
                                        <span>{o.SharePercentageDisplay}</span>
                                      </div>
                                      <hr className="w-100 text-primary my-10 px-0"></hr>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                        {ownerdivs.map((div, idx) => (
                          <>
                            <span className="d-none" key={`oispan-${idx}`}>
                              {(idx = idx + 1)}
                            </span>
                            <div
                              className=""
                              key={`ownerinfo-${idx}`}
                              ownerid={div.ownerId}
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
                                          className="btn btn-glow px-15"
                                          onClick={addOwnersDiv}
                                        >
                                          <i className="fa font-extra-large fa-plus-circle text-primary box-shadow lh-1 rounded-circle"></i>
                                        </button>

                                        <button
                                          type="button"
                                          className="btn btn-glow px-0"
                                          onClick={() =>
                                            removeOwnersDiv(div, idx)
                                          }
                                        >
                                          <i className="fa font-extra-large fa-circle-minus text-danger box-shadow lh-1 rounded-circle"></i>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-md-6 mb-15">
                                        <InputControl
                                          lblClass="mb-0 lbl-req-field d-none"
                                          ctlType={formCtrlTypes.name}
                                          isFocus={true}
                                          inputClass="w-0 h-0 p-0"
                                        ></InputControl>
                                        <AsyncSelect
                                          placeHolder={
                                            AppMessages.DdlTypetoSearch
                                          }
                                          noData={AppMessages.NoOwners}
                                          onChange={(e) => {
                                            handleOwnerChange(e, idx);
                                          }}
                                          value={
                                            ownerFormData[`ddlowners${idx}`]
                                          }
                                          name={`ddlowners${idx}`}
                                          lblText="Owner:"
                                          lblClass="mb-0 lbl-req-field"
                                          required={true}
                                          errors={errors}
                                          formErrors={formErrors}
                                          isClearable={true}
                                          options={joinedUsersData}
                                          isRenderOptions={false}
                                        ></AsyncSelect>
                                      </div>
                                      <div className="col-md-3 mb-15">
                                        <AsyncSelect
                                          placeHolder={
                                            AppMessages.DdlDefaultSelect
                                          }
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
                                  {idx == ownerdivs.length && (
                                    <div className="row form-action flex-center mx-0 px-0">
                                      <div
                                        className="col-md-6 px-0 form-error"
                                        id="form-error-owners"
                                      ></div>
                                      <div className="col-md-6 px-0">
                                        <button
                                          className="btn btn-secondary"
                                          id="btnCancelOwners"
                                          onClick={(e) => {
                                            toggleOwnersInfo(e);
                                            removeAllOwnerDivs();
                                          }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="btn btn-primary"
                                          id="btnSaveOwners"
                                          onClick={onSaveOwners}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    )}
                    {/*============== Add Owners End ==============*/}
                  </form>
                </div>
                <div className="col-xl-5 col-lg-5 md-mt-20">
                  {/*============== Propertymedia Start ==============*/}
                  <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                    <div className="container-fluid">
                      <div className="row">
                        <div className="col px-0">
                          <div className="row mx-0">
                            <div className="col-9 px-0">
                              <h6 className="mb-4 down-line  pb-10">
                                Property Media
                              </h6>
                            </div>
                            {!showEditMediaInfo && (
                              <div className="col-3 px-0 text-right">
                                <i
                                  className="fa fa-pen text-primary cur-pointer font-16"
                                  onClick={(e) => {
                                    toggleMediaInfo(e);
                                  }}
                                ></i>
                              </div>
                            )}
                          </div>
                          <div
                            className="row"
                            {...getRootProps()}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {selectedFiles && (
                              <div className="col-md-12 mt-0 mb-20">
                                {!showEditMediaInfo ? (
                                  selectedFiles.length === 0 &&
                                  assetDetails?.Images?.length == 0 ? (
                                    <NoData
                                      message={AppMessages.NoAssetMedia}
                                      className="mt-25 mb-40"
                                    ></NoData>
                                  ) : (
                                    <ul className="row row-cols-xl-6 row-cols-md-3 row-cols-2 media-upload">
                                      {selectedFiles.length > 0 &&
                                        selectedFiles.map((file, index) => (
                                          <li
                                            className="col bg-light border rounded m-10 p-0"
                                            key={`if-${index}`}
                                          >
                                            <>
                                              <img
                                                src={file.imgPath}
                                                className="py-0"
                                                alt={file.ImageName}
                                              />
                                            </>
                                          </li>
                                        ))}
                                    </ul>
                                  )
                                ) : (
                                  <ul className="row row-cols-xl-6 row-cols-md-3 row-cols-2 media-upload">
                                    {selectedFiles.length > 0 &&
                                      selectedFiles.map((file, index) => (
                                        <li
                                          className="col bg-light border rounded m-10 p-0"
                                          key={`if-${index}`}
                                        >
                                          {file.hasOwnProperty("imgPath") ? (
                                            <>
                                              <img
                                                src={file.imgPath}
                                                className="py-0"
                                                alt={file.ImageName}
                                              />
                                              <a
                                                href="#"
                                                title="Remove image"
                                                onClick={(e) =>
                                                  handleFileRemove(e, index, {
                                                    id: file.id,
                                                    assetId: file.assetId,
                                                  })
                                                }
                                              >
                                                <i className="fas fa-trash btn-danger" />
                                              </a>
                                            </>
                                          ) : (
                                            <>
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
                                            </>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>
                            )}
                            {showEditMediaInfo && (
                              <>
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

                                <hr className="w-100 text-primary my-20"></hr>
                                <div className="row form-action flex-center mx-0">
                                  <div
                                    className="col-md-6 px-0 form-error"
                                    id="form-error-media"
                                  ></div>
                                  <div className="col-md-6 px-0">
                                    <button
                                      className="btn btn-secondary"
                                      id="btnCancelMedia"
                                      onClick={(e) => {
                                        toggleMediaInfo(e);
                                        resetImages();
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      id="btnSaveMedia"
                                      onClick={onSaveImages}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Propertymedia End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageCommercialProperty;
