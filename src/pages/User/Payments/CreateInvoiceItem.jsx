import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
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

const CreateInvoiceItem = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let formErrors = {};
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtdescription: "",
      txtprice: "",
      ddlitemfortype: null,
      ddlaccountfortype: null,
      ddlforitem: null,
    };
  }
  const [formData, setFormData] = useState(setInitialFormData());
  const { invoiceItemForTypesList } = useGetInvoiceItemForTypesGateway("", 1);
  const { invoiceForItems } = useGetDdlInvoiceForItemsGateway(
    "",
    formData.ddlitemfortype?.value
  );

  const { invoiceItemAccountForTypesList } =
    useGetInvoiceItemAccountForTypesGateway("", 1);

  //Load
  useEffect(() => {
    Promise.allSettled([]).then(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const ddlChange = (e, name) => {
    let updateFormData = {
      ...formData,
      [name]: e,
    };
    if (name === "ddlitemfortype") {
      updateFormData = {
        ...updateFormData,
        ddlforitem: null,
        txtdescription: "",
      };
    }
    if (name === "ddlforitem") {
      updateFormData = {
        ...updateFormData,
        txtdescription: checkEmptyVal(e?.description)
          ? e?.label
          : e?.description,
      };
    }
    setFormData({ ...updateFormData });
  };

  const onCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(formData.ddlitemfortype)) {
      formErrors["ddlitemfortype"] = ValidationMessages.ItemForTypeReq;
    }

    if (checkEmptyVal(formData.ddlforitem)) {
      formErrors["ddlforitem"] = ValidationMessages.ItemReq;
    }

    if (checkEmptyVal(formData.ddlaccountfortype)) {
      formErrors["ddlaccountfortype"] = ValidationMessages.AccountForTypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnCreate", "Creating", API_ACTION_STATUS.START);
      let isapimethoderr = false;
      let objBodyParams = {
        ItemId: 0,
        AccountId: accountId,
        ProfileId: profileId,
        ItemForTypeId: parseInt(formData.ddlitemfortype?.value),
        ItemForId: parseInt(formData.ddlforitem?.value),
        Item: formData.ddlforitem?.label,
        AccountForTypeId: parseInt(formData.ddlaccountfortype?.value),
        Description: formData.txtdescription,
        Price: checkEmptyVal(formData.txtprice) ? 0 : formData.txtprice,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.addInvoiceItem}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              setFormData(setInitialFormData());
              navigateToInvoiceItems(e);
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
          apiReqResLoader("btnCreate", "Create", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToInvoiceItems = (e) => {
    e.preventDefault();
    navigate(routeNames.invoiceitems.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
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
                      <span className="font-general font-500 cur-pointer">
                        <a
                          className="text-general"
                          onClick={navigateToInvoiceItems}
                        >
                          Items
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-8 col-xl-7 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                Create Item
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToInvoiceItems}
                              isformBack={true}
                            />
                          </div>
                          <div className="col-md-6 mb-15">
                            <AsyncSelect
                              placeHolder={
                                invoiceItemForTypesList.length <= 0 &&
                                formData.ddlitemfortype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                invoiceItemForTypesList.length <= 0 &&
                                formData.ddlitemfortype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={invoiceItemForTypesList}
                              dataKey="ItemForTypeId"
                              dataVal="ItemForType"
                              onChange={(e) => ddlChange(e, "ddlitemfortype")}
                              value={formData.ddlitemfortype}
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
                                formData.ddlforitem == null ||
                                Object.keys(formData.ddlforitem).length === 0
                                  ? AppMessages.DdlDefaultSelect
                                  : invoiceForItems?.length <= 0 &&
                                    formData.ddlforitem == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                formData.ddlforitem == null ||
                                Object.keys(formData.ddlforitem).length === 0
                                  ? AppMessages.NoData
                                  : invoiceForItems?.length <= 0 &&
                                    formData.ddlforitem == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.NoData
                              }
                              options={invoiceForItems}
                              dataKey="Id"
                              dataVal="Name"
                              extraOptions={{
                                key: "description",
                                dataVal: "Description",
                              }}
                              onChange={(e) => ddlChange(e, "ddlforitem")}
                              value={formData.ddlforitem}
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
                                invoiceItemAccountForTypesList.length <= 0 &&
                                formData.ddlaccountfortype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                invoiceItemAccountForTypesList.length <= 0 &&
                                formData.ddlaccountfortype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={invoiceItemAccountForTypesList}
                              dataKey="AccountForTypeId"
                              dataVal="AccountForType"
                              onChange={(e) =>
                                ddlChange(e, "ddlaccountfortype")
                              }
                              value={formData.ddlaccountfortype}
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
                            onClick={navigateToInvoiceItems}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            id="btnCreate"
                            onClick={onCreate}
                          >
                            Create
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

export default CreateInvoiceItem;
