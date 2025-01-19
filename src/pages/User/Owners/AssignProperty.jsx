import React, { useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
} from "../../../utils/constants";
import { routeNames } from "../../../routes/routes";
import { useAuth } from "../../../contexts/AuthContext";
import { Toast } from "../../../components/common/ToastView";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { LazyImage, NoData } from "../../../components/common/LazyComponents";

const AssignProperty = () => {
  let $ = window.$;

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
  const [assignedUsers, setAssignedUsers] = useState([]);

  const [assignedUsersDivs, setAssignedUsersDivs] = useState([]);
  const [assignedUsersFormData, setAssignedUsersFormData] = useState([]);

  const [unAssignedUsersData, setUnAssignedUsersData] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      getAssetDetails(),
      getAssetAssignedUsers(),
      getUnassignedUsers(),
    ]).then(() => {});
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

  const getAssetAssignedUsers = () => {
    if (editAssetId > 0) {
      let objParams = {
        keyword: "",
        AssetId: editAssetId,
        pi: 0,
        ps: -1,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getAssetAssignedProfiles}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let users = objResponse.Data;
            setAssignedUsers(objResponse.Data);

            if (!checkObjNullorEmpty(users)) {
              if (users.hasOwnProperty("AssignedProfiles")) {
                if (users["AssignedProfiles"].length > 0) {
                  setAssetsInitAssignedUsersDivs();
                }
              }
            }
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getAssetAssignedProfiles}, Error ::" ${err}`
          );
        })
        .finally(() => {});
    }
  };

  const setAssetsInitAssignedUsersDivs = () => {
    if (assignedUsers?.hasOwnProperty("AssignedProfiles")) {
      if (assignedUsers["AssignedProfiles"].length > 0) {
        let users = [];

        assignedUsers["AssignedProfiles"].forEach((a, idx) => {
          users.push({ id: Date.now() + idx, profileid: a.ProfileId });
        });

        setAssignedUsersDivs([...users]);
        let userData = {};
        assignedUsers["AssignedProfiles"]?.forEach((a, idx) => {
          let i = idx + 1;
          let curretAssignedUserFormData = {
            [`accountid${i}`]: a.AccountId,
            [`profileid${i}`]: a.ProfileId,
            [`txtfeepercentage${i}`]: a.FeePercentage,
            [`ddlunassigneduser${i}`]: 0,
          };
          // const promise = new Promise((resolve, reject) => {
          //   resolve();
          //   reject();
          // });
          // promise.then(() => {
          curretAssignedUserFormData = {
            ...curretAssignedUserFormData,
            [`ddlunassigneduser${i}`]: a.ProfileId,
          };
          userData = { ...userData, ...curretAssignedUserFormData };
          setAssignedUsersFormData({ ...assignedUsersFormData, ...userData });
          // });
        });
      }
    }
  };

  const [showEditAssignedUsersInfo, setShowEditAssignedUsersInfo] =
    useState(false);
  const toggleAssignedUsersInfo = (e) => {
    clearAssignedUsersFormError();
    setShowEditAssignedUsersInfo(!showEditAssignedUsersInfo);
  };

  const clearAssignedUsersFormError = () => {
    let errctl = "#form-error-assignedusers";
    $(errctl).html("");
  };

  const removeAllAssignedUsersDivs = () => {
    clearAssignedUsersFormError();
    setAssignedUsersDivs([]);
    setAssignedUsersFormData([]);
  };

  const addAssignedUsersDiv = () => {
    clearAssignedUsersFormError();
    let assignedusersdivscount = assignedUsersDivs.length + 1;
    setAssignedUsersDivs([...assignedUsersDivs, { id: Date.now() + 1 }]);

    const curretAssignedUserFormData = {
      [`accountid${assignedusersdivscount}`]: 0,
      [`profileid${assignedusersdivscount}`]: 0,
      [`txtfeepercentage${assignedusersdivscount}`]: "0",
      [`ddlunassigneduser${assignedusersdivscount}`]: 0,
    };

    setAssignedUsersFormData({
      ...assignedUsersFormData,
      ...curretAssignedUserFormData,
    });
  };

  const removeOwnersDiv = (o, idx) => {
    clearAssignedUsersFormError();
    let idxnext = idx + 1;
    if (!checkObjNullorEmpty(o) && o.profileid > 0) {
      apiReqResLoader("x");
      let isapimethoderr = false;
      let objBodyParams = {
        ProfileId: parseInt(o.profileid),
        AssetId: parseInt(editAssetId),
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.unassignAsset}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 1) {
              const promise = new Promise((resolve, reject) => {
                getAssetAssignedUsers();
                resolve();
                reject();
              });
              promise.then(() => {
                setShowEditAssignedUsersInfo(false);
              });
              Toast.success(objResponse.Data.Message);
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.unassignAsset}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          } else {
            let remainownerdivs = assignedUsersDivs.filter(
              (div) => div.id !== o.id
            );
            if (remainownerdivs.length == 0) {
              setShowEditAssignedUsersInfo(false);
              setAssignedUsersDivs([]);
              setAssignedUsersFormData([]);
            } else {
              setAssignedUsersDivs(remainownerdivs);

              let curretAssignedUserFormData = {
                // [`txtownerhsippercentage${o.id}`]:
                //   ownerFormData[`txtownerhsippercentage${idxnext}`],
                // [`ddlowners${o.id}`]: 0,
                // [`ddlownershipstatus${o.id}`]: "A",

                [`accountid${o.id}`]:
                  assignedUsersFormData[`accountid${idxnext}`],
                [`profileid${o.id}`]:
                  assignedUsersFormData[`profileid${idxnext}`],
                [`txtfeepercentage${o.id}`]:
                  assignedUsersFormData[`txtfeepercentage${idxnext}`],
                [`ddlunassigneduser${o.id}`]: 0,
              };
              setAssignedUsersFormData({
                ...assignedUsersFormData,
                ...curretAssignedUserFormData,
              });
            }
          }
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      let curretAssignedUserFormData = {
        [`accountid${idx}`]: assignedUsersFormData[`accountid${idxnext}`],
        [`profileid${idx}`]: assignedUsersFormData[`profileid${idxnext}`],
        [`txtfeepercentage${idx}`]: "0",
        [`ddlunassigneduser${idx}`]: 0,
      };

      let remainassigneduserdivs = assignedUsersDivs.filter(
        (div) => div.id !== o.id
      );

      if (remainassigneduserdivs.length == 0) {
        setShowEditAssignedUsersInfo(false);
        setAssignedUsersDivs([]);
        setAssignedUsersFormData([]);
      } else {
        setAssignedUsersDivs(remainassigneduserdivs);

        setAssignedUsersFormData({
          ...assignedUsersFormData,
          ...curretAssignedUserFormData,
        });
      }
    }
  };

  const handleUnassignedUserChange = (selItem, ctlidx) => {
    if (selItem == null || selItem == undefined || selItem == "") {
      setAssignedUsersFormData({
        ...assignedUsersFormData,
        [`ddlunassigneduser${ctlidx}`]: 0,
      });
      return;
    } else {
      let selUserId = parseInt(selItem?.value);
      setAssignedUsersFormData({
        ...assignedUsersFormData,
        [`ddlunassigneduser${ctlidx}`]: selUserId,
      });
    }
  };

  const handleAssignedUsersControlsChange = (e) => {
    const { name, value } = e?.target;
    setAssignedUsersFormData({
      ...assignedUsersFormData,
      [name]: value,
    });
  };

  //Get unassigned users
  const getUnassignedUsers = async () => {
    // let objParams = {
    //   keyword: "",
    //   AssetId: editAssetId,
    //   inviterid: profileid,
    //   InviterProfileTypeId: parseInt(config.userProfileTypes.Owner),
    //   InviteeProfileTypeId: parseInt(config.userProfileTypes.Agent),
    // };

    let objParams = {
      keyword: "",
      inviterid: profileid,
      InviterProfileTypeId: parseInt(config.userProfileTypes.Owner),
      InviteeProfileTypeId: parseInt(config.userProfileTypes.Agent),
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
          setUnAssignedUsersData(data);
        } else {
          setUnAssignedUsersData([]);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        setUnAssignedUsersData([]);
      });
  };

  const onSaveAssignedUsers = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearAssignedUsersFormError();

    apiReqResLoader("btnSaveAssignedUsers", "Saving...");
    let isapimethoderr = false;
    let Valerror = false;
    let objBodyParams = new FormData();

    for (let od = 0; od <= assignedUsersDivs.length - 1; od++) {
      let idx = od + 1;
      if (
        !checkEmptyVal(assignedUsersFormData[`ddlunassigneduser${idx}`]) &&
        assignedUsersFormData[`ddlunassigneduser${idx}`] != "0"
      ) {
        objBodyParams.append(
          `Assignees[${od}].ProfileId`,
          parseInt(assignedUsersFormData[`ddlunassigneduser${idx}`])
        );
        objBodyParams.append(
          `Assignees[${od}].FeePercentage`,
          assignedUsersFormData[`txtfeepercentage${idx}`]
        );
      } else {
        Valerror = true;
        $(`#ownervalerr-${idx}`).html("All * fields are mandatory.");
        $(`#ownervalerr-${idx}`).next("button").focus();
      }
    }
    if (Valerror == false) {
      objBodyParams.append(`AssetId`, editAssetId);
      axiosPost(`${config.apiBaseUrl}${ApiUrls.assignAsset}`, objBodyParams, {
        "Content-Type": "multipart/form-data",
      })
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (
              objResponse.Data != null &&
              objResponse.Data?.Status > 0 &&
              objResponse.Data?.Id > 0
            ) {
              const promise = new Promise((resolve, reject) => {
                getAssetAssignedUsers();
                resolve();
                reject();
              });
              promise.then(() => {
                setShowEditAssignedUsersInfo(false);
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
          console.error(`"API :: ${ApiUrls.assignAsset}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnSaveAssignedUsers",
            "Save",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      apiReqResLoader(
        "btnSaveAssignedUsers",
        "Save",
        API_ACTION_STATUS.COMPLETED
      );
      $("#form-error-assignedusers").html(AppMessages.AssetAssignUsersRequired);
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
                  <h6 className="mb-3 down-line pb-10">Assign Property</h6>
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
                <div className="col-xl-7 col-lg-7 md-mt-20 order-2 order-lg-1 ">
                  <form noValidate>
                    {/*============== Propertyinfo Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <div className="row mx-0">
                              <div className="col-12 px-0">
                                <h6 className="mb-3 down-line  pb-10">
                                  Property Info
                                </h6>
                              </div>
                            </div>
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
                                <span>{assetDetails?.State}</span>
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
                                  {assetDetails?.AreaDisplay}{" "}
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
                              {assetDetails?.IsListed == 1 && (
                                <>
                                  <div className="col-md-6 mb-15">
                                    <span>Listing Type : </span>
                                    <span>
                                      {assetDetails?.ListingType
                                        ? assetDetails.ListingType
                                        : "--"}
                                    </span>
                                  </div>
                                  <div className="col-md-6 mb-15 text-md-end">
                                    <span>Listed On : </span>
                                    <span>
                                      {assetDetails?.ListedDateDisplay}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="col-md-12 mb-15">
                                <span>Description : </span>
                                <span>{assetDetails?.Description}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Propertyinfo End ==============*/}
                  </form>
                </div>
                <div className="col-xl-5 col-lg-5 order-1 order-lg-2 ">
                  {/*============== Assign Users Start ==============*/}
                  {!showEditAssignedUsersInfo ? (
                    <>
                      <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col px-0">
                              <div className="row mx-0">
                                <div className="col-9 px-0">
                                  <h6 className="mb-3 down-line  pb-10">
                                    Assigned Users
                                  </h6>
                                </div>
                                <div className="col-3 px-0 text-right">
                                  <i
                                    className="fa fa-pen text-primary cur-pointer font-16"
                                    onClick={(e) => {
                                      toggleAssignedUsersInfo(e);
                                      assignedUsers?.AssignedProfiles
                                        ?.length === 0
                                        ? addAssignedUsersDiv()
                                        : removeAllAssignedUsersDivs();
                                      setAssetsInitAssignedUsersDivs();
                                    }}
                                  ></i>
                                </div>
                              </div>
                              {assignedUsers?.AssignedProfiles?.length == 0 ? (
                                <>
                                  <NoData
                                    message={AppMessages.NoUsers}
                                    className="mt-10 mb-40"
                                  ></NoData>
                                </>
                              ) : (
                                assignedUsers?.AssignedProfiles?.map(
                                  (o, idx) => (
                                    <div
                                      className="row form-view"
                                      key={`vu-${idx}`}
                                    >
                                      <div className="col-auto pr-0">
                                        <LazyImage
                                          src={o.PicPath}
                                          alt={o.FirstName + " " + o.LastName}
                                          className="shadow img-border-white profile w-40px rounded-circle"
                                          placeHolderClass="pos-absolute w-40px min-h-40 fl-l"
                                        />
                                      </div>
                                      <div className="col pl-10">
                                        <div className=" font-general font-500 text-primary mb-1 lh-18">
                                          {o.FirstName} {o.LastName}
                                        </div>
                                        <div className=" font-small font-400 text-general mb-0 lh-18">
                                          {o.ProfileType}
                                        </div>
                                      </div>
                                      <div className="col mb-15 text-end">
                                        <span>Fee : </span>
                                        <span>{o.FeePercentageDisplay}</span>
                                      </div>
                                      <hr className="w-100 text-primary my-10 px-0"></hr>
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      {assignedUsersDivs.map((div, idx) => (
                        <div key={`audiv-${idx}`}>
                          <span className="d-none" key={`auispan-${idx}`}>
                            {(idx = idx + 1)}
                          </span>
                          <div
                            className=""
                            key={`au-${idx}`}
                            profileid={div.profileid}
                          >
                            <div className="container-fluid">
                              <div className="row">
                                <div className="col px-0">
                                  <div className="row mx-0 px-0">
                                    <h6 className="col mx-0 px-0 mb-3 down-line pb-10">
                                      User - {idx}
                                    </h6>
                                    <div className="col-auto px-0 mx-0">
                                      <button
                                        type="button"
                                        className="btn btn-glow px-15"
                                        onClick={addAssignedUsersDiv}
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
                                        noData={AppMessages.NoUsers}
                                        onChange={(e) => {
                                          handleUnassignedUserChange(e, idx);
                                        }}
                                        value={
                                          assignedUsersFormData[
                                            `ddlunassigneduser${idx}`
                                          ]
                                        }
                                        name={`ddlunassigneduser${idx}`}
                                        lblText="User:"
                                        lblClass="mb-0 lbl-req-field"
                                        required={true}
                                        isClearable={true}
                                        options={unAssignedUsersData}
                                        isRenderOptions={false}
                                      ></AsyncSelect>
                                    </div>
                                    <div className="col-md-6 mb-15">
                                      <InputControl
                                        lblClass="mb-0 lbl-req-field"
                                        name={`txtfeepercentage${idx}`}
                                        ctlType={formCtrlTypes.feepercentage}
                                        onChange={
                                          handleAssignedUsersControlsChange
                                        }
                                        value={
                                          assignedUsersFormData[
                                            `txtfeepercentage${idx}`
                                          ]
                                        }
                                      ></InputControl>
                                    </div>
                                  </div>
                                </div>
                                <hr className="w-100 text-primary my-20 px-0"></hr>
                                {idx == assignedUsersDivs.length && (
                                  <div className="row form-action flex-center mx-0 px-0">
                                    <div
                                      className="col-md-6 px-0 form-error"
                                      id="form-error-assignedusers"
                                    ></div>
                                    <div className="col-md-6 px-0">
                                      <button
                                        className="btn btn-secondary"
                                        id="btnCancelOwners"
                                        onClick={(e) => {
                                          toggleAssignedUsersInfo(e);
                                          removeAllAssignedUsersDivs();
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="btn btn-primary"
                                        id="btnSaveAssignedUsers"
                                        onClick={onSaveAssignedUsers}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/*============== Assign Users End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignProperty;
