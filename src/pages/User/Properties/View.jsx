import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
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
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { useGetAssetTypesGateway } from "../../../hooks/useGetAssetTypesGateway";
import { useGetAssetContractTypesGateway } from "../../../hooks/useGetAssetContractTypesGateway";
import { Toast } from "../../../components/common/ToastView";

const View = () => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();

  //Search data.
  const { assetTypesList } = useGetAssetTypesGateway("", 1);
  const { assetContractTypesList } = useGetAssetContractTypesGateway("", 1);

  //Grid
  const [assetsList, setAssetsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);

  //Modal
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteAssetConfirmationMessage
  );

  const navigate = useNavigate();

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(1, "month"),
      txttodate: moment(),
      ddlassettype: null,
      ddlcontracttype: null,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
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
    getAssets({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getAssets({ isShowall: true });
  };

  // Search events

  //Delete any stored edit propertyid.
  //deletesessionStorageItem(SessionStorageKeys.EditAssetId);

  //Get assets list
  const getAssets = ({
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
      let dateCheck = checkStartEndDateGreater(
        searchFormData.txtfromdate,
        searchFormData.txttodate
      );

      if (!checkEmptyVal(dateCheck)) {
        formErrors["date"] = dateCheck;
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
        ProfileId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        accountid: parseInt(
          GetUserCookieValues(UserCookie.AccountId, loggedinUser)
        ),
        keyword: "",
        contracttypeid: 0,
        assettypeid: 0,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          contracttypeid: parseInt(
            setSelectDefaultVal(searchFormData.ddlcontracttype)
          ),
          assettypeid: parseInt(
            setSelectDefaultVal(searchFormData.ddlassettype)
          ),
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getUserAssets}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setAssetsList(objResponse.Data.Assets);
          } else {
            isapimethoderr = true;
            setAssetsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setAssetsList([]);
          setPageCount(0);
          console.error(`"API :: ${ApiUrls.getUserAssets}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", "completed");
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Property",
        accessor: "title",
        className: "w-450px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <LazyImage
              className="rounded box-shadow cur-pointer"
              onClick={(e) => {
                onEdit(e, row);
              }}
              src={row.original.Images[0]?.ImagePath}
              alt={row.original.Title}
              placeHolderClass="pos-absolute w-140px min-h-100 fl-l"
            ></LazyImage>
            <div className="property-info d-table">
              <a
                href="#"
                onClick={(e) => {
                  onEdit(e, row);
                }}
              >
                <h5 className="text-secondary">{row.original.Title}</h5>
              </a>
              <div>
                <i className="fas fa-map-marker-alt text-primary font-13 p-r-5" />
                {row.original.AddressOne}
              </div>
              <div className="price">
                <span className="text-primary">
                  {row.original.PriceDisplay}
                </span>
              </div>
            </div>
          </>
        ),
      },
      {
        Header: "Property Type",
        accessor: "AssetType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Contract Type",
        accessor: "ContractType",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Properties",
        className: "w-200px",
        Cell: ({ row }) => (
          <>
            <div className="property-info d-table">
              <div>Sqfeet : {row.original.SqfeetDisplay}</div>
              <div>Bedrooms : {row.original.Bedrooms}</div>
              <div>Bathrooms : {row.original.Bathrooms}</div>
            </div>
          </>
        ),
      },
      {
        Header: "Last Modified On",
        accessor: "ModifiedDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        className: "w-150px",
        actions: [
          {
            text: "View",
            onclick: (e, row) => onEdit(e, row),
          },
          {
            text: "Edit",
            onclick: (e, row) => onEdit(e, row),
          },
          {
            text: "Delete",
            onclick: (e, row) => onDeleteConfirmModalShow(e, row),
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
      getAssets({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onEdit = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(SessionStorageKeys.EditAssetId, row.original.AssetId);
    navigate(routeNames.editproperty.path);
  };

  const onAdd = () => {
    navigate(routeNames.addproperty.path);
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader(
      "btndeleteproperty",
      "Deleting",
      API_ACTION_STATUS.START,
      false
    );

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      AssetId: parseInt(selectedGridRow?.original?.AssetId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteAsset}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.Status == 1) {
            Toast.success(AppMessages.DeleteAssetSuccess);
            getAssets({});
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
        console.error(`"API :: ${ApiUrls.deleteAsset}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader(
          "btndeleteproperty",
          "Yes",
          API_ACTION_STATUS.COMPLETED,
          false
        );
      });
  };

  //Grid actions

  //Delete confirmation Modal actions

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeleteproperty",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(AppMessages.DeleteAssetConfirmationMessage);
  };

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        propertyname: `${row?.original?.Title}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  //Delete confirmation Modal actions

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Properties</h5>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-4 col-xl-4 col-md-6">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search Title / Location"
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
                                assetTypesList.length <= 0 &&
                                searchFormData.ddlassettype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                assetTypesList.length <= 0 &&
                                searchFormData.ddlassettype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={assetTypesList}
                              dataKey="AssetTypeId"
                              dataVal="AssetType"
                              onChange={(e) => ddlChange(e, "ddlassettype")}
                              value={searchFormData.ddlassettype}
                              name="ddlassettype"
                              lbl={formCtrlTypes.assettype}
                              lblClass="mb-0"
                              lblText="Property type"
                              className="ddlborder"
                              isClearable={false}
                              isSearchCtl={true}
                              formErrors={formErrors}
                            ></AsyncSelect>
                          </div>
                          <div className="col-lg-4 col-xl-2 col-md-4">
                            <AsyncSelect
                              placeHolder={
                                assetContractTypesList.length <= 0 &&
                                searchFormData.ddlcontracttype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                assetContractTypesList.length <= 0 &&
                                searchFormData.ddlcontracttype == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={assetContractTypesList}
                              dataKey="ContractTypeId"
                              dataVal="ContractType"
                              onChange={(e) => ddlChange(e, "ddlcontracttype")}
                              value={searchFormData.ddlcontracttype}
                              name="ddlcontracttype"
                              lbl={formCtrlTypes.assetcontracttype}
                              lblClass="mb-0"
                              lblText="Contract type"
                              className="ddlborder"
                              isClearable={false}
                              isSearchCtl={true}
                              formErrors={formErrors}
                            ></AsyncSelect>
                          </div>
                          <div className="col-lg-3 col-xl-2 col-md-4">
                            <DateControl
                              lblClass="mb-0"
                              lblText="Start date"
                              name="txtfromdate"
                              required={false}
                              onChange={(dt) => onDateChange(dt, "txtfromdate")}
                              value={searchFormData.txtfromdate}
                              isTime={false}
                            ></DateControl>
                          </div>
                          <div className="col-lg-3 col-xl-2 col-md-4">
                            <DateControl
                              lblClass="mb-0"
                              lblText="End date"
                              name="txttodate"
                              required={false}
                              onChange={(dt) => onDateChange(dt, "txttodate")}
                              value={searchFormData.txttodate}
                              isTime={false}
                              objProps={{
                                checkVal: searchFormData.txtfromdate,
                                days: 7,
                              }}
                            ></DateControl>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-7 grid-search-action">
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
                            <button
                              className="btn btn-primary w- 100"
                              value="Add property"
                              name="btnaddproperty"
                              type="button"
                              onClick={onAdd}
                            >
                              <i className="fa fa-plus-circle mr-10"></i>
                              Add Property
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              {/*============== Search End ==============*/}

              {/*============== Grid Start ==============*/}
              <div className="row rounded">
                <div className="col">
                  <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                    <Grid
                      columns={columns}
                      data={assetsList}
                      loading={isDataLoading}
                      fetchData={fetchData}
                      pageCount={pageCount}
                      totalInfo={{
                        text: "Total Properties",
                        count: totalCount,
                      }}
                      noData={AppMessages.NoProperties}
                    />
                  </div>
                </div>
              </div>
              {/*============== Grid End ==============*/}
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
                id: "btndeleteproperty",
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

export default View;
