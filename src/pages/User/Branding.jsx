import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config.json";
import { useAuth } from "../../contexts/AuthContext";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
  SetAccordion,
  showHideCtrl,
  checkEmptyVal,
} from "../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
} from "../../utils/constants";
import { Toast } from "../../components/common/ToastView";
import { axiosPost } from "../../helpers/axiosHelper";
import { routeNames } from "../../routes/routes";
import { useUserBrandingTypesGateway } from "../../hooks/useUserBrandingTypesGateway";
import LazyImage from "../../components/common/LazyImage";
import InputControl from "../../components/common/InputControl";
import { formCtrlTypes } from "../../utils/formvalidation";
import FileControl from "../../components/common/FileControl";

const Settings = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser, updateUserProfile } = useAuth();

  const [showEditBrandingInfo, setShowEditBrandingInfo] = useState(false);
  const [initApisLoaded, setinitApisLoaded] = useState(false);

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let profileTypeId = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  const { BrandingTypes } = useUserBrandingTypesGateway();

  let formErrors = {};
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());
  const [logoFile, setLogoFile] = useState(null);
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [brandingDetails, setBrandingDetails] = useState([]);
  const [showdivcustombranding, setShowdivcustombranding] = useState(false);

  function setInitFormData(bdetails) {
    return {
      txtheader: bdetails ? (bdetails.Id > 0 ? bdetails.Header : "") : "",
      txtfooter: bdetails ? (bdetails.Id > 0 ? bdetails.Footer : "") : "",
      rblbrandingtype: bdetails
        ? bdetails.BrandingTypeId
        : config.UserBrandingTypes.Default_Branding,
      logo: bdetails ? (bdetails.Id > 0 ? bdetails.LogoUrl : "") : "",
      watermark: bdetails ? (bdetails.Id > 0 ? bdetails.WatermarkUrl : "") : "",
      isbrandingenabled: bdetails
        ? bdetails.IsBrandingEnabled == 1
          ? true
          : false
        : false,
    };
  }

  //Load
  useEffect(() => {
    Promise.allSettled([getUserBrandingDetails()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  const getUserBrandingDetails = () => {
    let isapimethoderr = false;
    let objParams = {
      AccountId: accountId,
      ProfileId: profileId,
      ReturnDefaultData: false,
    };
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getUserBrandingDetails}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          let details = objResponse.Data;
          if (details?.Id > 0) {
            setBrandingDetails(details);
            setFormData(setInitFormData(details));
            if (
              details.BrandingTypeId == config.UserBrandingTypes.Custom_Branding
            ) {
              setShowdivcustombranding(true);
            }
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.getUserBrandingDetails}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;

    if (name == "rblbrandingtype") {
      if (value == 2) {
        setShowdivcustombranding(true);
      } else {
        setShowdivcustombranding(false);
        clearFormImageFiles();
      }

      let isBrandingEnabled = formData.isbrandingenabled;

      setFormData({
        ...setInitFormData(),
        isbrandingenabled: isBrandingEnabled,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLogoChange = (event) => {
    let selFile = event.target.files[0];
    if (selFile) {
      setLogoFile(selFile);
      setFormData({
        ...formData,
        logo: URL.createObjectURL(selFile),
      });
    }
  };

  const handleWatermarkChange = (event) => {
    let selFile = event.target.files[0];
    if (selFile) {
      setWatermarkFile(selFile);
      setFormData({
        ...formData,
        watermark: URL.createObjectURL(selFile),
      });
    }
  };

  const handleIsEnabledChange = (e) => {
    setFormData({
      ...formData,
      ["isbrandingenabled"]: e.target.checked,
    });

    if (brandingDetails?.Id > 0) {
      apiReqResLoader("X", "X", API_ACTION_STATUS.START);
      let isapimethoderr = false;
      let objBodyParams = {
        AccountId: accountId,
        ProfileId: profileId,
        IsBrandingEnabled: e.target.checked,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.switchUserProfileBranding}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Id > 0) {
              Toast.success(objResponse.Data.Message);
            } else {
              Toast.error(objResponse.Data.Message);
              setFormData({
                ...formData,
                isbrandingenabled: !e.target.checked,
              });
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.switchUserProfileBranding}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            setFormData({ ...formData, isbrandingenabled: !e.target.checked });
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("X", "X", API_ACTION_STATUS.COMPLETED);
        });
    }
  };

  function clearFormImageFiles() {
    setLogoFile(null);
    setWatermarkFile(null);
    const inputLogo = document.getElementsByName("uploadlogo")[0];
    inputLogo && (inputLogo.value = "");
    const inputWatermark = document.getElementsByName("uploadwatermark")[0];
    inputWatermark && (inputWatermark.value = "");
  }

  const onSave = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      let errctl = ".form-error";
      $(errctl).html("");
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = new FormData();
      objBodyParams.append(
        "Id",
        brandingDetails
          ? checkEmptyVal(brandingDetails.Id)
            ? 0
            : brandingDetails.Id
          : 0
      );
      objBodyParams.append("AccountId", accountId);
      objBodyParams.append("ProfileId", profileId);

      objBodyParams.append("Header", formData.txtheader);
      objBodyParams.append("Footer", formData.txtfooter);
      objBodyParams.append("BrandingTypeId", formData.rblbrandingtype);
      objBodyParams.append("IsBrandingEnabled", formData.isbrandingenabled);

      if (logoFile) objBodyParams.append("LogoFile", logoFile);
      if (watermarkFile) objBodyParams.append("WatermarkFile", watermarkFile);

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createUserBranding}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Id > 0) {
              Toast.success(AppMessages.CreateUserBrandingSuccess);
              toggleBrandingInfo(e);
              getUserBrandingDetails();
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
            `"API :: ${ApiUrls.createUserBranding}, Error ::" ${err}`
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

  const toggleBrandingInfo = (e) => {
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    e.preventDefault();
    setFormData(setInitFormData(brandingDetails));
    clearFormImageFiles();
    setShowEditBrandingInfo(!showEditBrandingInfo);
    apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
  };

  const navigateToSettings = (e) => {
    e.preventDefault();
    navigate(routeNames.settings.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {SetAccordion()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 col-xl-7 col-md-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-9">
                  <div className="breadcrumb mb-0">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-2 down-line pb-10">Settings</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Branding
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-3 d-flex flex-ai-t flex-jc-r text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                    onClick={
                      !showEditBrandingInfo
                        ? navigateToSettings
                        : brandingDetails?.Id > 0
                        ? toggleBrandingInfo
                        : navigateToSettings
                    }
                  >
                    <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
                    <span className="font-general">Back</span>
                  </button>
                </div>
              </div>
              <div className="row pt-20 pb-0 row-cols-1 g-4 flex-center">
                {!showEditBrandingInfo && brandingDetails?.Id > 0 ? (
                  <div className="col">
                    <div className="row form-view" id="divViewBrandingInfo">
                      <div className="col-md-6 mb-15 row">
                        <span className="col-auto pr-0">Branding Type: </span>
                        <span className="col px-0 pl-5">
                          {brandingDetails.BrandingType}
                        </span>
                      </div>
                      <div className="col-md-6 mb-15 row-right text-md-end px-0">
                        <span className="col-auto pr-0">Is Enabled: </span>
                        <span className="col px-0 pl-5">
                          {brandingDetails?.IsBrandingEnabled == 1
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      {brandingDetails.Id > 0 &&
                        brandingDetails.BrandingTypeId ==
                          config.UserBrandingTypes.Custom_Branding && (
                          <>
                            <div className="col-md-12 mb-15 row">
                              <span className="col-auto pr-0">
                                Header Text:{" "}
                              </span>
                              <span className="col px-0 pl-5">
                                {brandingDetails.Header}
                              </span>
                            </div>
                            <div className="col-md-12 mb-30 row">
                              <span className="col-auto pr-0">
                                Footer Text:{" "}
                              </span>
                              <span className="col px-0 pl-5">
                                {brandingDetails.Footer}
                              </span>
                            </div>
                            <div className="col-md-12 mb-50 row">
                              <span className="col-auto pr-0">
                                Logo Image:{" "}
                              </span>
                              <span className="col px-0 pl-5">
                                <LazyImage
                                  className="mx-auto mt-1 rounded"
                                  src={brandingDetails?.LogoUrl}
                                  alt=""
                                ></LazyImage>
                              </span>
                            </div>
                            <div className="col-md-12 mb-30 row">
                              <span className="col-auto pr-0">
                                Watermark Image:{" "}
                              </span>
                              <span className="col-md-9 px-0 pl-5">
                                <LazyImage
                                  className="mx-auto mt-1 rounded"
                                  src={brandingDetails?.WatermarkUrl}
                                  alt=""
                                ></LazyImage>
                              </span>
                            </div>
                          </>
                        )}
                    </div>
                    <hr className="w-100 text-primary my-20"></hr>

                    <div className="row form-action flex-center mx-0">
                      <div className="col-md-12 px-0">
                        <button
                          className="btn btn-secondary"
                          id="btnCancelEdit"
                          onClick={navigateToSettings}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          id="btnEdit"
                          onClick={toggleBrandingInfo}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="row col-md-12 mb-15" tabIndex={0}>
                            <label className="mb-0">Branding type:</label>
                            {initApisLoaded &&
                              BrandingTypes.map((bt, idx) => {
                                return (
                                  <div
                                    className="col-md-4"
                                    key={"btkey-" + idx}
                                  >
                                    <div
                                      className={`custom-check-box-2  ${
                                        idx == 0
                                          ? "text-left"
                                          : idx == BrandingTypes.length - 1
                                          ? "text-right"
                                          : "text-center"
                                      }`}
                                    >
                                      <input
                                        className="d-none"
                                        type="radio"
                                        value={bt.Id}
                                        id={"bt-" + bt.Id}
                                        name="rblbrandingtype"
                                        checked={
                                          formData.rblbrandingtype == bt.Id
                                        }
                                        onChange={(e) => {
                                          handleChange(e);
                                        }}
                                      />
                                      <label
                                        htmlFor={"bt-" + bt.Id}
                                        className="radio-lbl"
                                      >
                                        {bt.Type.replace("_", " ")}
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            {errors?.[`rblbrandingtype`] && (
                              <div className="err-invalid">
                                {errors?.[`rblbrandingtype`]}
                              </div>
                            )}
                          </div>
                          {showdivcustombranding && (
                            <div id="divcustombranding" className="mb-10">
                              <div className="col-md-12 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtheader"
                                  isFocus={true}
                                  ctlType={formCtrlTypes.brandingheader}
                                  required={false}
                                  onChange={handleChange}
                                  value={formData.txtheader}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={1}
                                ></InputControl>
                              </div>
                              <div className="col-md-12 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtfooter"
                                  ctlType={formCtrlTypes.brandingfooter}
                                  required={false}
                                  onChange={handleChange}
                                  value={formData.txtfooter}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={2}
                                ></InputControl>
                              </div>
                              <div className="col-md-12 mb-15">
                                <div>
                                  <FileControl
                                    lblClass="mb-0"
                                    lblText="Logo image: "
                                    name="uploadlogo"
                                    ctlType={formCtrlTypes.file}
                                    onChange={handleLogoChange}
                                    file={logoFile}
                                    errors={errors}
                                    formErrors={formErrors}
                                    tabIndex={3}
                                  />
                                </div>
                                <div className="pt-20 d-flex flex-center col-9 mx-auto mt-1">
                                  <img
                                    src={formData.logo}
                                    alt=""
                                    className="rounded"
                                  />
                                </div>
                              </div>
                              <div className="col-md-12 mb-0">
                                <div>
                                  <FileControl
                                    lblClass="mb-0"
                                    lblText="Watermark image: "
                                    name="uploadwatermark"
                                    ctlType={formCtrlTypes.file}
                                    onChange={handleWatermarkChange}
                                    file={watermarkFile}
                                    errors={errors}
                                    formErrors={formErrors}
                                    tabIndex={4}
                                  />
                                </div>
                                <div className="pt-20 d-flex flex-center col-9 mx-auto mt-1">
                                  <img
                                    src={formData.watermark}
                                    alt=""
                                    className="rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="col-md-6 mb-15 row-right text-md-right p x-0">
                            <span className="col-auto pr-0 d-ib">
                              Is Enabled:{" "}
                            </span>
                            <span className="col px-0 pl-5 d-ib v-m mt-n-1">
                              <div className="form-check form-switch pt-1">
                                <input
                                  className="form-check-input checked"
                                  type="checkbox"
                                  id="isbrandingenabled"
                                  checked={formData.isbrandingenabled}
                                  onClick={handleIsEnabledChange}
                                />
                              </div>
                            </span>
                          </div>
                        </div>
                      </form>
                      <hr className="w-100 text-primary mb-20 mt-30"></hr>

                      <div className="row form-action flex-center mx-0">
                        <div
                          className="col-md-6 px-0 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-6 px-0">
                          <button
                            className="btn btn-secondary"
                            id="btnCancelEdit"
                            onClick={
                              !showEditBrandingInfo
                                ? navigateToSettings
                                : brandingDetails?.Id > 0
                                ? toggleBrandingInfo
                                : navigateToSettings
                            }
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
