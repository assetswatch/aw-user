import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { Grid, ModalView } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  GridDefaultValues,
  API_ACTION_STATUS,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { usePaymentAccountCreateStatusGateway } from "../../../hooks/usePaymentAccountCreateStatusGateway";
import { addSessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { Toast } from "../../../components/common/ToastView";
import { useGetInvoiceItemAccountForTypesGateway } from "../../../hooks/usegetInvoiceItemAccountForTypesGateway";
import { useGetInvoiceItemForTypesGateway } from "../../../hooks/useGetInvoiceItemForTypesGateway";
import GridFiltersPanel from "../../../components/common/GridFiltersPanel";

const InvoiceItems = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let formErrors = {};
  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const { invoiceItemForTypesList } = useGetInvoiceItemForTypesGateway("", 1);
  const { invoiceItemAccountForTypesList } =
    useGetInvoiceItemAccountForTypesGateway("", 1);

  //Modal
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteInvoiceItemConfirmationMessage
  );

  //Grid
  const [itemsList, setItemsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: "",
      txttodate: "",
      ddlitemfortype: null,
      ddlaccountfortype: null,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData()
  );
  //Set search formdata

  //Search ddl controls changes
  const ddlChange = (e, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: e?.value,
    });
  };

  //Search Date control change
  const onDateChange = (newDate, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: newDate,
    });
  };

  //Input change
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  //Set search formdata

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getItems({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData());
    getItems({ isShowall: true });
  };

  // Search events

  //Get items list
  const getItems = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    let errctl = "#search-val-err-message";
    $(errctl).html("");

    //Add date error to form errors.
    delete formErrors["date"];
    if (!isShowall) {
      if (
        !checkEmptyVal(searchFormData.txtfromdate) &&
        !checkEmptyVal(searchFormData.txttodate)
      ) {
        let dateCheck = checkStartEndDateGreater(
          searchFormData.txtfromdate,
          searchFormData.txttodate
        );
        if (!checkEmptyVal(dateCheck)) {
          formErrors["date"] = dateCheck;
        }
      }
    }

    //Validation check
    if (Object.keys(formErrors).length > 0) {
      $(errctl).html(formErrors[Object.keys(formErrors)[0]]);
    } else {
      //show loader if search actions.
      if (isSearch || isShowall) {
        apiReqResLoader("x");
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        keyword: "",
        AccountId: accountid,
        ProfileId: profileid,
        ItemForTypeId: 0,
        AccountForTypeId: 0,
        fromdate: setSearchInitialFormData().txtfromdate,
        todate: setSearchInitialFormData().txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
          ItemForTypeId: parseInt(
            setSelectDefaultVal(searchFormData.ddlitemfortype, 0)
          ),
          AccountForTypeId: parseInt(
            setSelectDefaultVal(searchFormData.ddlaccountfortype, 0)
          ),
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getInvoiceItems}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setItemsList(objResponse.Data.Items);
          } else {
            isapimethoderr = true;
            setItemsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setItemsList([]);
          setPageCount(0);
          console.error(`"API :: ${ApiUrls.getInvoiceItems}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Item",
        accessor: "Item",
        className: "w-250px",
        disableSortBy: true,
      },
      {
        Header: "Item For Type",
        accessor: "ItemForType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Account For Type",
        accessor: "AccountForType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Price",
        accessor: "PriceDisplay",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Last Modified On",
        accessor: "ModifiedDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        className: "w-130px",
        actions: [
          {
            text: "Manage Item",
            onclick: (e, row) => onView(e, row),
          },
          {
            text: "Delete",
            onclick: (e, row) => onDeleteConfirmModalShow(e, row),
            icssclass: "pr-10 pl-2px",
          },
        ],
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getItems({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewInvoiceItemId,
      row.original.ItemId
    );
    navigate(routeNames.viewinvoiceitem.path);
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader("btndeleteitem", "Deleting", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      ItemId: parseInt(selectedGridRow?.original?.ItemId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteInvoiceItem}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteAssetSuccess);
            getItems({});
            onDeleteConfirmModalClose();
          } else {
            Toast.error(objResponse.Data.Message);
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.deleteInvoiceItem}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndeleteitem", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  //Delete confirmation Modal actions

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader("btndeleteitem", "Yes", API_ACTION_STATUS.COMPLETED, false);
    setModalDeleteConfirmContent(
      AppMessages.DeleteInvoiceItemConfirmationMessage
    );
  };

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        item: `${row?.original?.Item}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  //Delete confirmation Modal actions

  const navigateToPayments = (e) => {
    e.preventDefault();
    navigate(routeNames.paymentsaccounts.path);
  };

  const navigateToInvoices = (e) => {
    e.preventDefault();
    navigate(routeNames.paymentsinvoices.path);
  };

  const navigateToCreateInvoiceItem = (e) => {
    e.preventDefault();
    navigate(routeNames.createinvoiceitem.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumb my-1">
                <div className="breadcrumb-item bc-fh">
                  <h6 className="mb-3 down-line pb-10">Payments</h6>
                </div>
                <div className="breadcrumb-item bc-fh ctooltip-container">
                  <span className="font-general font-500 cur-default">
                    <a className="text-general" onClick={navigateToInvoices}>
                      Invoices
                    </a>
                  </span>
                </div>
                <div className="breadcrumb-item bc-fh ctooltip-container">
                  <span className="font-general font-500 cur-default">
                    Items
                  </span>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToPayments}>Accounts</li>
                  <li className="active">
                    Invoices <i className="icons icon-arrow-right font-8px"></i>{" "}
                    Items
                  </li>
                </ul>
                <div className="tab-element">
                  {/*============== Search Start ==============*/}
                  <GridFiltersPanel
                    divFilterControls={
                      <div
                        className="container-fluid v-center"
                        id="div-filters-controls-panel"
                      >
                        <div className="row">
                          <div className="col px-0">
                            <form noValidate>
                              <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                                <div className="col-lg-4 col-xl-2 col-md-6">
                                  <InputControl
                                    lblClass="mb-0"
                                    lblText="Search"
                                    name="txtkeyword"
                                    ctlType={formCtrlTypes.searchkeyword}
                                    value={searchFormData.txtkeyword}
                                    onChange={handleChange}
                                    formErrors={formErrors}
                                  ></InputControl>
                                </div>
                                <div className="col-lg-4 col-xl-2 col-md-6">
                                  <AsyncSelect
                                    placeHolder={
                                      invoiceItemForTypesList.length <= 0 &&
                                      searchFormData.ddlitemfortype == null
                                        ? AppMessages.DdLLoading
                                        : AppMessages.DdlDefaultSelect
                                    }
                                    noData={
                                      invoiceItemForTypesList.length <= 0 &&
                                      searchFormData.ddlitemfortype == null
                                        ? AppMessages.DdLLoading
                                        : AppMessages.DdlNoData
                                    }
                                    options={invoiceItemForTypesList}
                                    dataKey="ItemForTypeId"
                                    dataVal="ItemForType"
                                    onChange={(e) =>
                                      ddlChange(e, "ddlitemfortype")
                                    }
                                    value={searchFormData.ddlitemfortype}
                                    name="ddlitemfortype"
                                    lbl={formCtrlTypes.itemfortype}
                                    lblClass="mb-0 lbl-req-field"
                                    className="ddlborder"
                                    isClearable={true}
                                    required={false}
                                    isSearchCtl={true}
                                    formErrors={formErrors}
                                  ></AsyncSelect>
                                </div>
                                <div className="col-lg-4 col-xl-2 col-md-6">
                                  <AsyncSelect
                                    placeHolder={
                                      invoiceItemAccountForTypesList.length <=
                                        0 &&
                                      searchFormData.ddlitemfortype == null
                                        ? AppMessages.DdLLoading
                                        : AppMessages.DdlDefaultSelect
                                    }
                                    noData={
                                      invoiceItemAccountForTypesList.length <=
                                        0 &&
                                      searchFormData.ddlitemfortype == null
                                        ? AppMessages.DdLLoading
                                        : AppMessages.DdlNoData
                                    }
                                    options={invoiceItemAccountForTypesList}
                                    dataKey="AccountForTypeId"
                                    dataVal="AccountForType"
                                    onChange={(e) =>
                                      ddlChange(e, "ddlaccountfortype")
                                    }
                                    value={searchFormData.ddlaccountfortype}
                                    name="ddlaccountfortype"
                                    lbl={formCtrlTypes.accountfortype}
                                    lblClass="mb-0 lbl-req-field"
                                    className="ddlborder"
                                    isClearable={true}
                                    required={false}
                                    isSearchCtl={true}
                                    formErrors={formErrors}
                                  ></AsyncSelect>
                                </div>
                                <div className="col-lg-3 col-xl-2 col-md-3">
                                  <DateControl
                                    lblClass="mb-0"
                                    lblText="Start date"
                                    name="txtfromdate"
                                    required={false}
                                    onChange={(dt) =>
                                      onDateChange(dt, "txtfromdate")
                                    }
                                    value={searchFormData.txtfromdate}
                                    isTime={false}
                                    formErrors={formErrors}
                                  ></DateControl>
                                </div>
                                <div className="col-lg-3 col-xl-2 col-md-3">
                                  <DateControl
                                    lblClass="mb-0"
                                    lblText="End date"
                                    name="txttodate"
                                    required={false}
                                    onChange={(dt) =>
                                      onDateChange(dt, "txttodate")
                                    }
                                    value={searchFormData.txttodate}
                                    isTime={false}
                                    objProps={{
                                      checkVal: searchFormData.txtfromdate,
                                    }}
                                    formErrors={formErrors}
                                  ></DateControl>
                                </div>
                                <div className="col-lg-6 col-xl-3 col-md-6 grid-search-action">
                                  <label
                                    className="mb-0 form-error w-100"
                                    id="search-val-err-message"
                                  ></label>
                                  <button
                                    className="btn btn-primary w- 100"
                                    value="Search"
                                    name="btnsearch"
                                    type="button"
                                    onClick={onSearch}
                                  >
                                    Search
                                  </button>
                                  <button
                                    className="btn btn-primary w- 100"
                                    value="Show all"
                                    name="btnshowall"
                                    type="button"
                                    onClick={onShowAll}
                                  >
                                    Show All
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    }
                    elements={[
                      {
                        label: "Invoices",
                        icon: "fa fa-file-invoice ",
                        onClick: navigateToInvoices,
                      },
                      {
                        label: "New Item",
                        icon: "icons icon-plus ",
                        onClick: navigateToCreateInvoiceItem,
                      },
                    ]}
                  ></GridFiltersPanel>
                  {/*============== Search End ==============*/}

                  {/*============== Grid Start ==============*/}
                  <div className="row rounded">
                    <div className="col">
                      <div className="dashboard-panel bo-top br-r-0 br-l-0 bg-white rounded overflow-hidden w-100 box-shadow-top">
                        <Grid
                          columns={columns}
                          data={itemsList}
                          loading={isDataLoading}
                          fetchData={fetchData}
                          pageCount={pageCount}
                          totalInfo={{
                            text: "Total Items",
                            count: totalCount,
                          }}
                          noData={AppMessages.NoItems}
                        />
                      </div>
                    </div>
                  </div>
                  {/*============== Grid End ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndeleteitem",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onDelete(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onDeleteConfirmModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Delete Confirmation Modal End ==============*/}
    </>
  );
};

export default InvoiceItems;
