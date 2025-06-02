import React, { useEffect, useState } from "react";
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
  AppMessages,
  SessionStorageKeys,
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
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { ModalView } from "../../../components/common/LazyComponents";
import { useGetInvoiceItemAccountForTypesGateway } from "../../../hooks/usegetInvoiceItemAccountForTypesGateway";
import { useGetInvoiceItemForTypesGateway } from "../../../hooks/useGetInvoiceItemForTypesGateway";
import { useGetDdlInvoiceForItemsGateway } from "../../../hooks/useGetDdlInvoiceForItemsGateway";
import TextAreaControl from "../../../components/common/TextAreaControl";
import GoBackPanel from "../../../components/common/GoBackPanel";

const CreateInvoice = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let tempInvoiceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.PreviewInvoiceId, 0)
  );

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  //check any temp invoice id exists in session storage and delete it.
  const deleteTempInvoice = () => {
    if (tempInvoiceId > 0) {
      deletesessionStorageItem(SessionStorageKeys.PreviewInvoiceId);
      axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteInvoice}`, {
        ProfileId: profileId,
        AccountId: accountId,
        InvoiceId: tempInvoiceId,
      });
    }
  };

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
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

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

  const [ddlInvoiceItems, setDdlInvoiceItems] = useState([]);

  useEffect(() => {
    setDdlInvoiceItems(invoiceItemsList);
  }, [invoiceItemsList]);

  //Load
  useEffect(() => {
    Promise.allSettled([getGeneratedInvoiceNumber(), getJoinedUsers()]).then(
      () => {}
    );
  }, []);

  const getJoinedUsers = async () => {
    let objParams = {
      keyword: "",
      inviterid: profileId,
      InviterProfileTypeId: 0, //loggedinprofiletypeid
      InviteeProfileTypeId: 0, //parseInt(config.userProfileTypes.Tenant)
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
      })
      .finally(() => {
        setSelectedJoinedUser(null);
      });
  };

  const getGeneratedInvoiceNumber = () => {
    const promise = new Promise((resolve, reject) => {
      deleteTempInvoice();
      resolve();
      reject();
    });
    promise.then(() => {
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
    });
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

  const handleJoinedUserChange = (e) => {
    setSelectedJoinedUser(e);
  };

  const onPreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#form-error";
    $(errctl).html("");

    if (checkObjNullorEmpty(selectedJoinedUser)) {
      formErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

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
        objBodyParams.append(
          "BillToProfileId",
          parseInt(selectedJoinedUser?.value)
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
                  addSessionStorageItem(
                    SessionStorageKeys.PreviewInvoiceId,
                    objResponse.Data?.Id
                  );
                  navigate(routeNames.previewinvoice.path);
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

  const AddNewItem = () => {
    return (
      <div
        onClick={handleAddNewItem}
        className="bg-light text-center cur-pointer font-general font-500 my-1 py-2 text-primary underline"
      >
        + Create New Item
      </div>
    );
  };

  const [addNewItemModalShow, setAddNewItemModalShow] = useState(false);

  function setAddNewItemInitialFormData() {
    return {
      txtaddnewitemdescription: "",
      txtaddnewitemprice: "",
      ddladdnewitemitemfortype: null,
      ddladdnewitemaccountfortype: null,
      ddladdnewitemforitem: null,
    };
  }

  const [addNewItemFormData, setAddNewItemFormData] = useState(
    setAddNewItemInitialFormData()
  );

  const { invoiceItemForTypesList } = useGetInvoiceItemForTypesGateway("", 1);
  const { invoiceForItems } = useGetDdlInvoiceForItemsGateway(
    "",
    addNewItemFormData.ddladdnewitemitemfortype?.value
  );

  const { invoiceItemAccountForTypesList } =
    useGetInvoiceItemAccountForTypesGateway("", 1);

  let addNewItemformErrors = {};
  const [addNewItemerrors, setAddNewItemErrors] = useState({});

  const handleAddNewItem = () => {
    setAddNewItemModalShow(true);
  };

  const onAddNewItemModalClose = () => {
    setAddNewItemModalShow(false);
    addNewItemformErrors = {};
    setAddNewItemErrors({});
    setAddNewItemFormData(setAddNewItemInitialFormData());
  };

  const addNewItemHandleChange = (e) => {
    const { name, value } = e?.target;
    setAddNewItemFormData({
      ...addNewItemFormData,
      [name]: value,
    });
  };

  const addNewItemDdlChange = (e, name) => {
    let updateFormData = {
      ...addNewItemFormData,
      [name]: e,
    };
    if (name === "ddladdnewitemitemfortype") {
      updateFormData = {
        ...updateFormData,
        ddladdnewitemforitem: null,
        txtaddnewitemdescription: "",
      };
    }
    if (name === "ddladdnewitemforitem") {
      updateFormData = {
        ...updateFormData,
        txtaddnewitemdescription: checkEmptyVal(e?.description)
          ? e?.label
          : e?.description,
      };
    }
    setAddNewItemFormData({ ...updateFormData });
  };

  const onCreateNewItem = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(addNewItemFormData.ddladdnewitemitemfortype)) {
      addNewItemformErrors["ddladdnewitemitemfortype"] =
        ValidationMessages.ItemForTypeReq;
    }

    if (checkEmptyVal(addNewItemFormData.ddladdnewitemforitem)) {
      addNewItemformErrors["ddladdnewitemforitem"] = ValidationMessages.ItemReq;
    }

    if (checkEmptyVal(addNewItemFormData.ddladdnewitemaccountfortype)) {
      addNewItemformErrors["ddladdnewitemaccountfortype"] =
        ValidationMessages.AccountForTypeReq;
    }

    if (Object.keys(addNewItemformErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btncreatenewitem", "Creating", API_ACTION_STATUS.START);
      let isapimethoderr = false;
      let objBodyParams = {
        ItemId: 0,
        AccountId: accountId,
        ProfileId: profileId,
        ItemForTypeId: parseInt(
          addNewItemFormData.ddladdnewitemitemfortype?.value
        ),
        ItemForId: parseInt(addNewItemFormData.ddladdnewitemforitem?.value),
        Item: addNewItemFormData.ddladdnewitemforitem?.label,
        AccountForTypeId: parseInt(
          addNewItemFormData.ddladdnewitemaccountfortype?.value
        ),
        Description: addNewItemFormData.txtaddnewitemdescription,
        Price: checkEmptyVal(addNewItemFormData.txtaddnewitemprice)
          ? 0
          : addNewItemFormData.txtaddnewitemprice,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.addInvoiceItem}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              onAddNewItemModalClose();
              Toast.success(objResponse.Data.Message);
              axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlInvoiceItems}`, {
                Keyword: "",
                AccountId: accountId,
                ProfileId: profileId,
              })
                .then((invoceitemslistresponse) => {
                  let objInvoceItemsListResponse = invoceitemslistresponse.data;
                  if (objInvoceItemsListResponse.StatusCode === 200) {
                    setDdlInvoiceItems(objInvoceItemsListResponse.Data);
                  }
                })
                .catch((err) => {
                  console.error(
                    `"API :: ${ApiUrls.getDdlInvoiceItems}, Error ::" ${err}`
                  );
                });
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
          apiReqResLoader(
            "btncreatenewitem",
            "Create",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(addNewItemformErrors)[0]}]`).focus();
      setAddNewItemErrors(addNewItemformErrors);
    }
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
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToInvoices}
                      >
                        Invoices
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Create Invoice
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-12 col-lg-10 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                Create Invoice
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToInvoices}
                              isformBack={true}
                            />
                          </div>
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
                            <h6 className="mb-3 down-line  pb-10">Items</h6>
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
                                          <th className="lh-5 w-130px">
                                            Action
                                          </th>
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
                                                        ddlInvoiceItems.length <=
                                                          0 &&
                                                        editItem.item == null
                                                          ? AppMessages.DdLLoading
                                                          : AppMessages.DdlSelectItem
                                                      }
                                                      noData={
                                                        ddlInvoiceItems.length <=
                                                          0 &&
                                                        editItem.item == null
                                                          ? AppMessages.DdLLoading
                                                          : AppMessages.NoItems
                                                      }
                                                      options={ddlInvoiceItems}
                                                      dataKey="ItemId"
                                                      dataVal="Item"
                                                      onChange={(e) => {
                                                        let selectedItem =
                                                          objInitItems();
                                                        if (e != null) {
                                                          selectedItem =
                                                            ddlInvoiceItems.filter(
                                                              (i) =>
                                                                i.ItemId ===
                                                                e.value
                                                            )?.[0];
                                                        }
                                                        setEditItem({
                                                          ...editItem,
                                                          item: e,
                                                          description:
                                                            selectedItem.Description,
                                                          quantity: 1,
                                                          price:
                                                            selectedItem.Price,
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
                                                        description:
                                                          e.target.value,
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
                                                      handleDeleteItem(
                                                        e,
                                                        item.id
                                                      )
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
                                                AppMessages.DdlSelectItem
                                              }
                                              // ddlInvoiceItems.length <= 0 &&
                                              // newItem.item == null
                                              //   ? AppMessages.DdLLoading
                                              //   : AppMessages.DdlSelectItem

                                              noData={AppMessages.NoItems}
                                              // ddlInvoiceItems.length <= 0 &&
                                              // newItem.item == null
                                              //   ? AppMessages.DdLLoading
                                              //   : AppMessages.NoItems

                                              options={ddlInvoiceItems}
                                              dataKey="ItemId"
                                              dataVal="Item"
                                              onChange={(e) => {
                                                let selectedItem =
                                                  objInitItems();
                                                if (e != null) {
                                                  selectedItem =
                                                    ddlInvoiceItems.filter(
                                                      (i) =>
                                                        i.ItemId === e.value
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
                                              menuFooter={AddNewItem}
                                            ></AsyncSelect>
                                          </td>
                                          <td className="w-300px">
                                            <InputControl
                                              lblClass="mb-0"
                                              name="txtdescription"
                                              ctlType={
                                                formCtrlTypes.description300
                                              }
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
                                                    parseInt(
                                                      e.target.value,
                                                      10
                                                    ) || 0,
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
                          <div className="col-md-12 my-15">
                            <h6 className="mb-3 down-line  pb-10">Bill To</h6>
                            <div className="row">
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    selectedJoinedUser == null ||
                                    Object.keys(selectedJoinedUser).length === 0
                                      ? AppMessages.DdlDefaultSelect
                                      : joinedUsersData.length <= 0
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    selectedJoinedUser == null ||
                                    Object.keys(selectedJoinedUser).length === 0
                                      ? AppMessages.NoUsers
                                      : joinedUsersData.length <= 0
                                      ? AppMessages.DdLLoading
                                      : AppMessages.NoUsers
                                  }
                                  options={joinedUsersData}
                                  onChange={(e) => {
                                    handleJoinedUserChange(e);
                                  }}
                                  value={selectedJoinedUser}
                                  name="ddljoinedusers"
                                  lblText="Users"
                                  lbl={formCtrlTypes.users}
                                  lblClass="mb-0 lbl-req-field"
                                  required={true}
                                  errors={errors}
                                  formErrors={formErrors}
                                  //isMulti={true}
                                  isRenderOptions={false}
                                  tabIndex={1}
                                ></AsyncSelect>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtmessage"
                                  ctlType={formCtrlTypes.message}
                                  required={false}
                                  onChange={handleChange}
                                  value={formData.txtmessage}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={2}
                                ></InputControl>
                              </div>
                            </div>

                            <hr className="w-100 text-primary my-20"></hr>
                            <div className="row form-action d-flex flex-end mt-20">
                              <div
                                className="col-md-6 form-error"
                                id="form-error"
                              ></div>
                              <div className="col-md-6">
                                <button
                                  className="btn btn-secondary"
                                  id="btnCancel"
                                  onClick={navigateToInvoices}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-primary"
                                  id="btnPreview"
                                  onClick={onPreview}
                                >
                                  Preview
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
        </div>
      </div>

      {/*============== Add New Item Modal Start ==============*/}
      {addNewItemModalShow && (
        <>
          <ModalView
            title={AppMessages.AddInvocieItemModalTitle}
            content={
              <>
                <form noValidate>
                  <div className="row">
                    <div className="col-md-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          invoiceItemForTypesList.length <= 0 &&
                          addNewItemFormData.ddladdnewitemitemfortype == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          invoiceItemForTypesList.length <= 0 &&
                          addNewItemFormData.ddladdnewitemitemfortype == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlNoData
                        }
                        options={invoiceItemForTypesList}
                        dataKey="ItemForTypeId"
                        dataVal="ItemForType"
                        onChange={(e) =>
                          addNewItemDdlChange(e, "ddladdnewitemitemfortype")
                        }
                        value={addNewItemFormData.ddladdnewitemitemfortype}
                        name="ddladdnewitemitemfortype"
                        lbl={formCtrlTypes.itemfortype}
                        lblClass="mb-0 lbl-req-field"
                        className="ddlborder"
                        isClearable={true}
                        required={true}
                        errors={addNewItemerrors}
                        formErrors={addNewItemformErrors}
                        tabIndex={1}
                      ></AsyncSelect>
                    </div>
                    <div className="col-md-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          addNewItemFormData.ddladdnewitemforitem == null ||
                          Object.keys(addNewItemFormData.ddladdnewitemforitem)
                            .length === 0
                            ? AppMessages.DdlDefaultSelect
                            : invoiceForItems?.length <= 0 &&
                              addNewItemFormData.ddladdnewitemforitem == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          addNewItemFormData.ddladdnewitemforitem == null ||
                          Object.keys(addNewItemFormData.ddladdnewitemforitem)
                            .length === 0
                            ? AppMessages.NoData
                            : invoiceForItems?.length <= 0 &&
                              addNewItemFormData.ddladdnewitemforitem == null
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
                        onChange={(e) =>
                          addNewItemDdlChange(e, "ddladdnewitemforitem")
                        }
                        value={addNewItemFormData.ddladdnewitemforitem}
                        name="ddladdnewitemforitem"
                        lbl={formCtrlTypes.select}
                        lblClass="mb-0 lbl-req-field"
                        lblText="Item:"
                        className="ddlborder"
                        isClearable={false}
                        errors={addNewItemerrors}
                        formErrors={addNewItemformErrors}
                        tabIndex={2}
                      ></AsyncSelect>
                    </div>
                    <div className="col-md-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          invoiceItemAccountForTypesList.length <= 0 &&
                          addNewItemFormData.ddladdnewitemaccountfortype == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          invoiceItemAccountForTypesList.length <= 0 &&
                          addNewItemFormData.ddladdnewitemaccountfortype == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlNoData
                        }
                        options={invoiceItemAccountForTypesList}
                        dataKey="AccountForTypeId"
                        dataVal="AccountForType"
                        onChange={(e) =>
                          addNewItemDdlChange(e, "ddladdnewitemaccountfortype")
                        }
                        value={addNewItemFormData.ddladdnewitemaccountfortype}
                        name="ddladdnewitemaccountfortype"
                        lbl={formCtrlTypes.accountfortype}
                        lblClass="mb-0 lbl-req-field"
                        className="ddlborder"
                        isClearable={false}
                        required={true}
                        errors={addNewItemerrors}
                        formErrors={addNewItemformErrors}
                        tabIndex={3}
                      ></AsyncSelect>
                    </div>
                    <div className="col-md-6 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field"
                        name="txtaddnewitemprice"
                        ctlType={formCtrlTypes.price}
                        required={true}
                        onChange={addNewItemHandleChange}
                        value={addNewItemFormData.txtaddnewitemprice}
                        errors={addNewItemerrors}
                        formErrors={addNewItemformErrors}
                        tabIndex={4}
                      ></InputControl>
                    </div>
                    <div className="col-md-12 mb-15">
                      <TextAreaControl
                        lblClass="mb-0"
                        name="txtaddnewitemdescription"
                        ctlType={formCtrlTypes.description300}
                        required={false}
                        onChange={addNewItemHandleChange}
                        value={addNewItemFormData.txtaddnewitemdescription}
                        errors={addNewItemerrors}
                        formErrors={addNewItemformErrors}
                        tabIndex={5}
                        rows={2}
                      ></TextAreaControl>
                    </div>
                  </div>
                </form>
              </>
            }
            onClose={onAddNewItemModalClose}
            actions={[
              {
                id: "btncreatenewitem",
                text: "Create",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onCreateNewItem(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onAddNewItemModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Add New Item Modal End ==============*/}
    </>
  );
};

export default CreateInvoice;
