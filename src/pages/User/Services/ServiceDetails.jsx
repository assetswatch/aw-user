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

const ServiceDetails = () => {
  return (
    <>
      <div className="full-row bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-6">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="down-line pb-10">Services</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <label className="font-general font-500 cur-default">
                        Service Details
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-15">
                  <span>Name : </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-4 mb-15">
                  <span>Property : </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-4 mb-15">
                  <span>Request Status : </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-4 mb-15">
                  <span>Request type: </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-4 mb-15">
                  <span>Request Date : </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-4 mb-15">
                  <span>Resolve Date : </span>
                  <span>{null}</span>
                </div>
                <div className="col-md-12 mb-15">
                  <span>Description : </span>
                  <span>{null}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetails;
