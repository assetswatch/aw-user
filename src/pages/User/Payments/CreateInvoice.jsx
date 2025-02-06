import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppConstants,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import moment from "moment";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import InputControl from "../../../components/common/InputControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import DateControl from "../../../components/common/DateControl";
import { useGetDdlInvoiceItemsGateway } from "../../../hooks/useGetDdlInvoiceItemsGateway";
import TextAreaControl from "../../../components/common/TextAreaControl";

const CreateInvoice = () => {
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

  let formAddItemErrors = {};
  const [addItemerrors, setAddItemErrors] = useState({});

  function setInitialFormData() {
    return {
      generateInvoiceNumber: "",
      txtinvoicenumber: "",
      txtbilldate: moment(),
      txtduedate: moment().add(1, "month"),
      txtmessage: "",
    };
  }
  const [formData, setFormData] = useState(setInitialFormData());

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(objInitItems());
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItem, setEditItem] = useState(objInitItems());

  function objInitItems() {
    return {
      item: null,
      description: "",
      quantity: 0,
      price: 0,
      selectedItem: null,
    };
  }

  const { invoiceItemsList } = useGetDdlInvoiceItemsGateway(
    "",
    accountId,
    profileId
  );

  //Load
  useEffect(() => {
    Promise.allSettled([getGeneratedInvoiceNumber()]).then(() => {});
  }, []);

  const getGeneratedInvoiceNumber = () => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.generateInvoiceNumber}`, {
      AccountId: accountId,
      ProfileId: profileId,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setFormData({
            ...formData,
            generateInvoiceNumber: objResponse.Data?.InvoiceNumber || "",
            txtinvoicenumber: objResponse.Data?.InvoiceNumber || "",
          });
        }
      })
      .catch((err) => {
        console.error(
          `API :: ${config.apiBaseUrl}${ApiUrls.generateInvoiceNumber}, Error :: ${err}`
        );
      })
      .finally(() => {});
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onDateChange = (newDate, name) => {
    setFormData({
      ...formData,
      [name]: newDate,
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setAddItemErrors({});
    if (newItem.item) {
      setItems([...items, { ...newItem, id: Date.now() }]);
      setNewItem(objInitItems());
    } else {
      formAddItemErrors["ddlitem"] = ValidationMessages.ItemReq;
      $(`[name="ddlitem"]`).focus();
      setAddItemErrors(formAddItemErrors);
    }
  };

  const calculateNewItemTotal = () => {
    let cal = (newItem?.quantity * newItem?.price).toFixed(2);
    return cal == "NaN" ? "0.00" : cal;
  };

  const handleDeleteItem = (e, id) => {
    e.preventDefault();
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEditItem = (e, id) => {
    e.preventDefault();
    const itemToEdit = items.find((item) => item.id === id);
    setEditingItemId(id);
    setEditItem(itemToEdit);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setItems(
      items.map((item) =>
        item.id === editingItemId ? { ...editItem, id: editingItemId } : item
      )
    );
    setEditingItemId(null);
    setEditItem(objInitItems());
  };

  const calculateTotal = () => {
    let cal = items
      .reduce((total, item) => total + item.quantity * item.price, 0)
      .toFixed(2);
    return cal == "NaN" ? "0.00" : cal;
  };

  const onCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#form-error";
    $(errctl).html("");

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnCreate", "Creating...");
      setErrors({});
      let isapimethoderr = false;
      let itemsError = false;

      let objBodyParams = new FormData();

      if (items?.length == 0) {
        itemsError = true;
        $(errctl).html("Please add item to create invoice.");
      } else {
        for (let i = 0; i <= items.length - 1; i++) {
          let idx = i;
          if (
            !checkEmptyVal(items[idx]?.item) &&
            !checkObjNullorEmpty(items[idx])
          ) {
            objBodyParams.append(
              `Items[${i}].AccountForTypeId`,
              parseInt(items[idx]?.selectedItem?.AccountForTypeId)
            );
            objBodyParams.append(
              `Items[${i}].ItemForTypeId`,
              parseInt(items[idx]?.selectedItem?.ItemForTypeId)
            );
            objBodyParams.append(
              `Items[${i}].ItemForId`,
              parseInt(items[idx]?.selectedItem?.ItemForId)
            );
            objBodyParams.append(`Items[${i}].Item`, items[idx]?.item?.label);
            objBodyParams.append(
              `Items[${i}].Description`,
              items[idx]?.description
            );
            objBodyParams.append(
              `Items[${i}].Quantity`,
              parseInt(items[idx]?.quantity)
            );
            objBodyParams.append(`Items[${i}].Amount`, items[idx]?.price);
          } else {
            itemsError = true;
            $(errctl).html("All items fields are mandatory");
          }
        }
      }

      if (itemsError == false) {
        objBodyParams.append("ProfileId", profileId);
        objBodyParams.append("AccountId", accountId);
        objBodyParams.append("InvoiceNumber", formData.txtinvoicenumber);
        objBodyParams.append(
          "BillDate",
          formData.txtbilldate.format("MM/DD/YYYY")
        );
        objBodyParams.append(
          "DueDate",
          formData.txtduedate.format("MM/DD/YYYY")
        );
        objBodyParams.append("Message", formData.txtmessage);
        objBodyParams.append(
          "IsCustomInvNum",
          formData.txtinvoicenumber == formData.generateInvoiceNumber ? 0 : 1
        );

        axiosPost(
          `${config.apiBaseUrl}${ApiUrls.createInvoice}`,
          objBodyParams,
          {
            "Content-Type": "multipart/form-data",
          }
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (objResponse.Data != null && objResponse.Data?.Status > 0) {
                if (objResponse.Data?.Id > 0) {
                  //Checks any duplicate inovice number
                  Toast.success(objResponse.Data.Message);
                  navigateToInvoices();
                } else {
                  Toast.error(objResponse.Data.Message);
                }
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
            console.error(`"API :: ${ApiUrls.createInvoice}, Error ::" ${err}`);
          })
          .finally(() => {
            if (isapimethoderr == true) {
              Toast.error(AppMessages.SomeProblem);
              $(errctl).html(AppMessages.SomeProblem);
            }
            apiReqResLoader("btnCreate", "Create", API_ACTION_STATUS.COMPLETED);
          });
      } else {
        apiReqResLoader("btnCreate", "Create", API_ACTION_STATUS.COMPLETED);
      }
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToInvoices = (e) => {
    e?.preventDefault();
    navigate(routeNames.paymentsinvoices.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-md-12 col-lg-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-9">
                  <div className="breadcrumb mb-0">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-2 down-line pb-10">Invoices</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Create
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-3 d-flex flex-ai-t flex-jc-r text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                    onClick={navigateToInvoices}
                  >
                    <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
                    <span className="font-general">Back</span>
                  </button>
                </div>
              </div>
              <div className="row pt-20 pb-0 row-cols-1 g-4 flex-center">
                <div className="col">
                  <form noValidate>
                    <div className="row">
                      <div className="col-md-4 col-lg-4 mb-15">
                        <InputControl
                          lblClass="mb-0 lbl-req-field"
                          name="txtinvoicenumber"
                          ctlType={formCtrlTypes.invoicenum}
                          required={true}
                          onChange={handleChange}
                          value={formData.txtinvoicenumber}
                          errors={errors}
                          formErrors={formErrors}
                          tabIndex={1}
                        ></InputControl>
                      </div>
                      <div className="col-md-4 col-lg-4 mb-15">
                        <DateControl
                          lblClass="mb-0 lbl-req-field"
                          lblText="Date: "
                          name="txtbilldate"
                          required={false}
                          onChange={(dt) => onDateChange(dt, "txtbilldate")}
                          value={formData.txtbilldate}
                          isTime={false}
                          errors={errors}
                          formErrors={formErrors}
                          tabIndex={2}
                        ></DateControl>
                      </div>
                      <div className="col-md-4 col-lg-4 mb-15">
                        <DateControl
                          lblClass="mb-0 lbl-req-field"
                          lblText="Due date: "
                          name="txtduedate"
                          required={false}
                          onChange={(dt) => onDateChange(dt, "txtduedate")}
                          value={formData.txtduedate}
                          isTime={false}
                          errors={errors}
                          formErrors={formErrors}
                          tabIndex={3}
                        ></DateControl>
                      </div>
                      <div className="col-md-12 my-15">
                        {/*============== Add Items Start ==============*/}
                        <div className="row">
                          <div className="col">
                            <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 pb-10">
                              <div className="overflow-x-scroll font-fifteen">
                                <table className="w-100 items-list bg-transparent tbl-grid row-alt-bg grid-search">
                                  <thead>
                                    <tr className="bg-li-hover-color">
                                      <th className="lh-5 w-350px">Item</th>
                                      <th className="lh-5 w-300px">
                                        Description
                                      </th>
                                      <th className="lh-5 w-120px text-right">
                                        Quantity
                                      </th>
                                      <th className="lh-5 w-200px text-right">
                                        Amount ($)
                                      </th>
                                      <th className="lh-5 w-200px text-right">
                                        Total ($)
                                      </th>
                                      <th className="lh-5 w-130px">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items.map((item) => (
                                      <tr key={item.id}>
                                        {editingItemId === item.id ? (
                                          <>
                                            <td className="w-350px">
                                              <div>
                                                <AsyncSelect
                                                  placeHolder={
                                                    invoiceItemsList.length <=
                                                      0 && editItem.item == null
                                                      ? AppMessages.DdLLoading
                                                      : AppMessages.DdlSelectItem
                                                  }
                                                  noData={
                                                    invoiceItemsList.length <=
                                                      0 && editItem.item == null
                                                      ? AppMessages.DdLLoading
                                                      : AppMessages.NoItems
                                                  }
                                                  options={invoiceItemsList}
                                                  dataKey="ItemId"
                                                  dataVal="Item"
                                                  onChange={(e) => {
                                                    let selectedItem =
                                                      objInitItems();
                                                    if (e != null) {
                                                      selectedItem =
                                                        invoiceItemsList.filter(
                                                          (i) =>
                                                            i.ItemId === e.value
                                                        )?.[0];
                                                    }
                                                    setEditItem({
                                                      ...editItem,
                                                      item: e,
                                                      description:
                                                        selectedItem.Description,
                                                      quantity: 1,
                                                      price: selectedItem.Price,
                                                      selectedItem:
                                                        selectedItem,
                                                    });
                                                  }}
                                                  value={editItem.item}
                                                  name="ddlitem"
                                                  lbl={formCtrlTypes.item}
                                                  lblClass="mb-0 lbl-req-field d-none"
                                                  className="ddlborder py-0"
                                                  isClearable={false}
                                                  required={true}
                                                  isSearchCtl={true}
                                                  menuPortalTarget="body"
                                                ></AsyncSelect>
                                              </div>
                                            </td>
                                            <td className="w-300px">
                                              <InputControl
                                                lblClass="mb-0 d-none"
                                                name="txtdescription"
                                                ctlType={
                                                  formCtrlTypes.description300
                                                }
                                                required={false}
                                                onChange={(e) =>
                                                  setEditItem({
                                                    ...editItem,
                                                    description: e.target.value,
                                                  })
                                                }
                                                value={editItem.description}
                                              ></InputControl>
                                            </td>
                                            <td className="w-120px text-right">
                                              <InputControl
                                                lblClass="mb-0 lbl-req-field b-0 d-none"
                                                inputClass="b-0"
                                                name="txtquantity"
                                                ctlType={formCtrlTypes.qty}
                                                required={true}
                                                onChange={(e) =>
                                                  setEditItem({
                                                    ...editItem,
                                                    quantity:
                                                      parseInt(
                                                        e.target.value,
                                                        10
                                                      ) || 0,
                                                  })
                                                }
                                                value={editItem.quantity}
                                              ></InputControl>
                                            </td>
                                            <td className="w-200px text-right">
                                              <InputControl
                                                lblClass="mb-0 lbl-req-field b-0 d-none"
                                                inputClass="b-0"
                                                name="txtprice"
                                                ctlType={
                                                  formCtrlTypes.invoiceitemprice
                                                }
                                                required={true}
                                                onChange={(e) =>
                                                  setEditItem({
                                                    ...editItem,
                                                    price: e.target.value,
                                                  })
                                                }
                                                value={editItem.price}
                                              ></InputControl>
                                            </td>
                                            <td className="w-200px text-right">
                                              {(
                                                editItem.quantity *
                                                editItem.price
                                              ).toFixed(2)}
                                            </td>
                                            <td className="w-130px">
                                              <button
                                                type="button"
                                                className="mr-10 btn btn-glow px-0 rounded-circle text-primary lh-1 mr-10"
                                                onClick={(e) =>
                                                  handleSaveEdit(e)
                                                }
                                              >
                                                <i className="fa fa-check-circle font-18"></i>
                                              </button>
                                              <button
                                                type="button"
                                                className="btn btn-glow px-0 rounded-circle text-primary lh-1"
                                                onClick={() =>
                                                  setEditingItemId(null)
                                                }
                                              >
                                                <i className="fa fa-times-circle text-danger font-18"></i>
                                              </button>
                                            </td>
                                          </>
                                        ) : (
                                          <>
                                            <td className="w-350px">
                                              {item.item.label}
                                            </td>
                                            <td className="w-300px">
                                              {item.description}
                                            </td>
                                            <td className="w-120px text-right">
                                              {item.quantity}
                                            </td>
                                            <td className="w-200px text-right">
                                              {(item.price * 1).toFixed(2)}
                                            </td>
                                            <td className="w-200px text-right">
                                              {(
                                                item.quantity * item.price
                                              ).toFixed(2)}
                                            </td>
                                            <td className="w-130px">
                                              <button
                                                type="button"
                                                className="btn btn-glow px-0 rounded-circle text-primary lh-1 mr-10"
                                                onClick={(e) =>
                                                  handleEditItem(e, item.id)
                                                }
                                              >
                                                <i className="fa fa-pencil font-general" />
                                              </button>
                                              <button
                                                type="button"
                                                className="btn btn-glow px-0 rounded-circle text-primary lh-1"
                                                onClick={(e) =>
                                                  handleDeleteItem(e, item.id)
                                                }
                                              >
                                                <i className="fa fa-trash text-danger font-general" />
                                              </button>
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))}
                                    {items.length === 0 && (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          className="no-data text-center py-50 font-16"
                                        >
                                          No items added...
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot>
                                    {items.length > 0 && (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="text-right px-0"
                                        >
                                          <span className="font-500 font-small pr-20">
                                            Total ($) : {calculateTotal()}
                                          </span>
                                        </td>
                                        <td></td>
                                      </tr>
                                    )}
                                    <tr className="bo-b-0 td-valign-top">
                                      <td className="w-350px">
                                        <AsyncSelect
                                          placeHolder={
                                            invoiceItemsList.length <= 0 &&
                                            newItem.item == null
                                              ? AppMessages.DdLLoading
                                              : AppMessages.DdlSelectItem
                                          }
                                          noData={
                                            invoiceItemsList.length <= 0 &&
                                            newItem.item == null
                                              ? AppMessages.DdLLoading
                                              : AppMessages.NoItems
                                          }
                                          options={invoiceItemsList}
                                          dataKey="ItemId"
                                          dataVal="Item"
                                          onChange={(e) => {
                                            let selectedItem = objInitItems();
                                            if (e != null) {
                                              selectedItem =
                                                invoiceItemsList.filter(
                                                  (i) => i.ItemId === e.value
                                                )?.[0];
                                            }
                                            setNewItem({
                                              ...newItem,
                                              item: e,
                                              description:
                                                selectedItem.Description,
                                              quantity: 1,
                                              price: selectedItem.Price,
                                              selectedItem: selectedItem,
                                            });
                                          }}
                                          value={newItem.item}
                                          name="ddlitem"
                                          lbl={formCtrlTypes.item}
                                          lblClass="mb-0 lbl-req-field"
                                          className="ddlborder"
                                          isClearable={true}
                                          required={true}
                                          isSearchCtl={true}
                                          errors={addItemerrors}
                                          formErrors={formAddItemErrors}
                                          menuPortalTarget="body"
                                        ></AsyncSelect>
                                      </td>
                                      <td className="w-300px">
                                        <InputControl
                                          lblClass="mb-0"
                                          name="txtdescription"
                                          ctlType={formCtrlTypes.description300}
                                          required={false}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              description: e.target.value,
                                            })
                                          }
                                          value={newItem.description}
                                        ></InputControl>
                                      </td>
                                      <td className="w-120px">
                                        <InputControl
                                          lblClass="mb-0 lbl-req-field b-0"
                                          inputClass="b-0"
                                          name="txtquantity"
                                          ctlType={formCtrlTypes.qty}
                                          required={true}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              quantity:
                                                parseInt(e.target.value, 10) ||
                                                0,
                                            })
                                          }
                                          value={newItem.quantity}
                                        ></InputControl>
                                      </td>
                                      <td className="w-200px">
                                        <InputControl
                                          lblClass="mb-0 lbl-req-field b-0"
                                          inputClass="b-0"
                                          name="txtprice"
                                          ctlType={
                                            formCtrlTypes.invoiceitemprice
                                          }
                                          required={true}
                                          onChange={(e) => {
                                            setNewItem({
                                              ...newItem,
                                              price: e.target.value,
                                            });
                                          }}
                                          value={newItem.price}
                                        ></InputControl>
                                      </td>
                                      <td className="w-200px text-right">
                                        <label className="mb-0 w-100"></label>
                                        <span className="mb-0 font-small font-500">
                                          ${calculateNewItemTotal()}
                                        </span>
                                      </td>
                                      <td className="w-130px">
                                        <label className="mb-0 w-100"></label>
                                        <button
                                          className="btn btn-primary btn-xs btn-glow shadow rounded"
                                          name="btnadditem"
                                          id="btnadditem"
                                          type="button"
                                          onClick={(e) => {
                                            handleAddItem(e);
                                          }}
                                        >
                                          <i className="icon icon-plus position-relative me-1 t-1"></i>
                                          Item
                                        </button>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/*============== Add Items End ==============*/}
                      </div>
                    </div>
                  </form>
                  <hr className="w-100 text-primary my-20"></hr>

                  <div className="row form-action flex-center mx-0">
                    <div className="col-md-6 col-lg-4 px-0 text-left mb-15">
                      <TextAreaControl
                        lblClass="mb-0"
                        name="txtmessage"
                        ctlType={formCtrlTypes.message}
                        required={false}
                        onChange={handleChange}
                        value={formData.txtmessage}
                        errors={errors}
                        formErrors={formErrors}
                        rows={2}
                      ></TextAreaControl>
                    </div>
                    <div className="col-md-6 col-lg-8 px-0 my-15 flex-vb">
                      <button
                        className="btn btn-secondary"
                        id="btnCancel"
                        onClick={navigateToInvoices}
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
                    <div
                      className="col-md-12 px-0 form-error text-right"
                      id="form-error"
                    ></div>
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

export default CreateInvoice;
