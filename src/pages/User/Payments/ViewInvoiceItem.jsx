import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import InputControl from "../../../components/common/InputControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useGetInvoiceItemForTypesGateway } from "../../../hooks/useGetInvoiceItemForTypesGateway";
import { useGetInvoiceItemAccountForTypesGateway } from "../../../hooks/usegetInvoiceItemAccountForTypesGateway";
import { useGetDdlInvoiceForItemsGateway } from "../../../hooks/useGetDdlInvoiceForItemsGateway";
import TextAreaControl from "../../../components/common/TextAreaControl";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ViewInvoiceItem = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let viewItemId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewInvoiceItemId, 0)
  );

  let formErrors = {};
  const [errors, setErrors] = useState({});

  const [showEditItem, setShowEditItem] = useState(false);
  const toggleItemInfo = (e) => {
    setShowEditItem(!showEditItem);
  };

  function setInitialFormData(details) {
    return {
      txtdescription: details ? details.Description : "",
      txtprice: details ? details.Price : "0",
      ddlitemfortype: details ? details.ItemForTypeId : null,
      ddlaccountfortype: details ? details.AccountForTypeId : null,
      ddlforitem: details ? details.ItemForId : null,
    };
  }

  const [selectedItemForType, setSelectedItemForType] = useState(null);
  const [selectedAccountForType, setSelectedAccountForType] = useState(null);
  const [selectedForItem, setSelectedForItem] = useState(null);
  const [formData, setFormData] = useState(setInitialFormData());
  const [itemDetails, setItemDetails] = useState({});
  const { invoiceItemForTypesList } = useGetInvoiceItemForTypesGateway("", 1);
  const { invoiceForItems } = useGetDdlInvoiceForItemsGateway(
    "",
    selectedItemForType
  );

  const { invoiceItemAccountForTypesList } =
    useGetInvoiceItemAccountForTypesGateway("", 1);

  //Load
  useEffect(() => {
    Promise.allSettled([
      invoiceItemForTypesList,
      //invoiceForItems,
      invoiceItemAccountForTypesList,
      getItemDetails(),
    ]).then(() => {});
  }, []);

  const getItemDetails = () => {
    if (viewItemId > 0) {
      let objParams = {
        ItemId: viewItemId,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getInvoiceItemDetails}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let details = objResponse.Data;
            setItemDetails(details);
            setFormData(setInitialFormData(details));
            setSelectedItemForType(details.ItemForTypeId);
            setSelectedForItem(details.ItemForId);
            setSelectedAccountForType(details.AccountForTypeId);
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getInvoiceItemDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleItemForTypeChange = (e) => {
    setSelectedItemForType(e?.value);
    setSelectedForItem(null);
  };

  const handleForItemChange = (e) => {
    setSelectedForItem(e?.value);
  };

  const handleAccountForTypeChange = (e) => {
    setSelectedAccountForType(e?.value);
  };

  const onSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedItemForType)) {
      formErrors["ddlitemfortype"] = ValidationMessages.ItemForTypeReq;
    }

    if (checkEmptyVal(selectedForItem)) {
      formErrors["ddlforitem"] = ValidationMessages.ItemReq;
    }

    if (checkEmptyVal(selectedAccountForType)) {
      formErrors["ddlaccountfortype"] = ValidationMessages.AccountForTypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnSave", "Saving", API_ACTION_STATUS.START);
      let isapimethoderr = false;
      let objBodyParams = {
        ItemId: viewItemId,
        AccountId: accountId,
        ProfileId: profileId,
        ItemForTypeId: parseInt(setSelectDefaultVal(selectedItemForType)),
        ItemForId: parseInt(setSelectDefaultVal(selectedForItem)),
        Item: selectedForItem
          ? invoiceForItems.find((item) => item.Id === selectedForItem).Name
          : "",
        AccountForTypeId: parseInt(setSelectDefaultVal(selectedAccountForType)),
        Description: formData.txtdescription,
        Price: checkEmptyVal(formData.txtprice) ? 0 : formData.txtprice,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.addInvoiceItem}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              setFormData(setInitialFormData());
              getItemDetails();
              setShowEditItem(false);
              // navigateToInvoiceItems(e);
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
          console.error(`"API :: ${ApiUrls.addInvoiceItem}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToPaymentsAccounts = () => {
    navigate(routeNames.paymentsaccounts.path);
  };

  const navigateToInvoiceItems = (e) => {
    e.preventDefault();
    navigate(routeNames.invoiceitems.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">Invoices</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        <a
                          className="text-general"
                          onClick={navigateToInvoiceItems}
                        >
                          Items
                        </a>
                      </span>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Item Details
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-6 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row">
                    <div className="d-flex w-100">
                      <div className="flex-grow-1">
                        <h6 className="mb-3 down-line pb-10 px-0 font-16">
                          Item Details{" "}
                          {!showEditItem && (
                            <i
                              className="fa fa-pen text-primary cur-pointer font-general px-10"
                              onClick={(e) => {
                                toggleItemInfo(e);
                              }}
                            ></i>
                          )}
                        </h6>
                      </div>
                      <GoBackPanel
                        clickAction={navigateToInvoiceItems}
                        isformBack={true}
                      />
                    </div>
                  </div>
                  <div className="row pt-10 pb-0 row-cols-1 g-4 flex-center">
                    <div className="col">
                      {!showEditItem ? (
                        <>
                          <div className="row form-view" id="divViewItem">
                            <div className="col-md-6 mb-15">
                              <span>Item : </span>
                              <span>{itemDetails?.ItemForType}</span>
                            </div>
                            <div className="col-md-6 mb-15 text-md-end">
                              <span>Item of : </span>
                              <span>{itemDetails?.Item}</span>
                            </div>
                            <div className="col-md-6 mb-15">
                              <span>Account : </span>
                              <span>{itemDetails?.AccountForType}</span>
                            </div>
                            <div className="col-md-6 mb-15 text-md-end">
                              <span>Price : </span>
                              <span>{itemDetails?.PriceDisplay}</span>
                            </div>
                            <div className="col-md-12 mb-15">
                              <span>Description : </span>
                              <span>{itemDetails?.Description}</span>
                            </div>
                          </div>
                          <hr className="w-100 text-primary my-20"></hr>
                          <div className="row form-action flex-center mx-0">
                            <div
                              className="col-md-4 px-0 form-error"
                              id="form-error"
                            ></div>
                            <div className="col-md-8 px-0">
                              <button
                                className="btn btn-secondary"
                                id="btnCancel"
                                onClick={navigateToInvoiceItems}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary"
                                id="btnEdit"
                                onClick={(e) => {
                                  toggleItemInfo(e);
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <form noValidate>
                            <div className="row">
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    invoiceItemForTypesList.length <= 0 &&
                                    selectedItemForType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    invoiceItemForTypesList.length <= 0 &&
                                    selectedItemForType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={invoiceItemForTypesList}
                                  dataKey="ItemForTypeId"
                                  dataVal="ItemForType"
                                  onChange={handleItemForTypeChange}
                                  value={selectedItemForType}
                                  name="ddlitemfortype"
                                  lbl={formCtrlTypes.itemfortype}
                                  lblClass="mb-0 lbl-req-field"
                                  className="ddlborder"
                                  isClearable={true}
                                  required={true}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={1}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    selectedForItem == null ||
                                    Object.keys(selectedForItem).length === 0
                                      ? AppMessages.DdlDefaultSelect
                                      : invoiceForItems?.length <= 0 &&
                                        selectedForItem == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    selectedForItem == null ||
                                    Object.keys(selectedForItem).length === 0
                                      ? AppMessages.NoData
                                      : invoiceForItems?.length <= 0 &&
                                        selectedForItem == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.NoData
                                  }
                                  options={invoiceForItems}
                                  dataKey="Id"
                                  dataVal="Name"
                                  onChange={handleForItemChange}
                                  value={selectedForItem}
                                  name="ddlforitem"
                                  lbl={formCtrlTypes.select}
                                  lblClass="mb-0 lbl-req-field"
                                  lblText="Item:"
                                  className="ddlborder"
                                  isClearable={false}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={2}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    invoiceItemAccountForTypesList.length <=
                                      0 && selectedAccountForType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    invoiceItemAccountForTypesList.length <=
                                      0 && selectedAccountForType == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlNoData
                                  }
                                  options={invoiceItemAccountForTypesList}
                                  dataKey="AccountForTypeId"
                                  dataVal="AccountForType"
                                  onChange={handleAccountForTypeChange}
                                  value={selectedAccountForType}
                                  name="ddlaccountfortype"
                                  lbl={formCtrlTypes.accountfortype}
                                  lblClass="mb-0 lbl-req-field"
                                  className="ddlborder"
                                  isClearable={false}
                                  required={true}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={3}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtprice"
                                  ctlType={formCtrlTypes.price}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtprice}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={4}
                                ></InputControl>
                              </div>
                              <div className="col-md-12 mb-15">
                                <TextAreaControl
                                  lblClass="mb-0"
                                  name="txtdescription"
                                  ctlType={formCtrlTypes.description300}
                                  required={false}
                                  onChange={handleChange}
                                  value={formData.txtdescription}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={5}
                                  rows={2}
                                ></TextAreaControl>
                              </div>
                            </div>
                          </form>
                          <hr className="w-100 text-primary my-20"></hr>
                          <div className="row form-action flex-center mx-0">
                            <div
                              className="col-md-4 px-0 form-error"
                              id="form-error"
                            ></div>
                            <div className="col-md-8 px-0">
                              <button
                                className="btn btn-secondary"
                                id="btnCancel"
                                onClick={(e) => {
                                  toggleItemInfo(e);
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewInvoiceItem;
