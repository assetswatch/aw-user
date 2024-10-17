import React from "react";

import { SetPageLoaderNavLinks } from "../../../utils/common";

const Agents = () => {
  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Agents</h5>

              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded upcoming">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-4 col-xl-4 col-md-6"></div>
                          <div className="col-lg-4 col-xl-2 col-md-6"></div>
                          <div className="col-lg-4 col-xl-2 col-md-4"></div>
                          <div className="col-lg-3 col-xl-2 col-md-4"></div>
                          <div className="col-lg-3 col-xl-2 col-md-4"></div>
                          <div className="col-lg-6 col-xl-4 col-md-7 grid-search-action">
                            <label
                              className="mb-0 form-error w-100"
                              id="search-val-err-message"
                            ></label>
                          </div>
                        </div>
                      </form>
                      <p className="no-data flex flex-center py-50">
                        Coming Soon...
                      </p>
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

export default Agents;
